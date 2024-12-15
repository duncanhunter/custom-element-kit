global.HTMLElement = class HTMLElement {};
global.customElements = { define: () => {} };

import { parseHTML } from "linkedom";

const cache = new Map();

function convertToCamelCase(string) {
	return string.replace(/-./g, (match) => match[1].toUpperCase());
}

async function loadIcons() {
	if (cache.has("icons")) return cache.get("icons");
	try {
		const { default: iconCollection } = await import("../icons/icons.js");
		cache.set("icons", iconCollection);
		return iconCollection;
	} catch (error) {
		console.error("Error loading icons:", error);
		return {};
	}
}

async function getTemplateAndStyles(elementName) {
	if (cache.has(elementName)) return cache.get(elementName);

	const baseName = elementName.startsWith("tab") ? "tabs" : elementName;
	try {
		const module = await import(`../components/${baseName}/${baseName}.js`);
		const styles = module[`${convertToCamelCase(elementName)}Styles`] || "";
		const template = module[`${convertToCamelCase(elementName)}Template`];
		const componentDefinition = { styles, template };
		cache.set(elementName, componentDefinition);
		return componentDefinition;
	} catch (error) {
		console.error(`Error loading module for ${elementName}:`, error);
		return null;
	}
}

async function getIconContent(element) {
	const attributes = getAttributes(element);

	const iconName = attributes.name || "";
	const iconSize = attributes.size || "24";

	if (!iconName) {
		console.warn("cek-icon missing name attribute");
		return "<style>:host{display:flex;}</style>";
	}

	const icons = await loadIcons();
	const svgContent = icons[iconName];

	if (!svgContent) {
		console.warn(`cek-icon: "${iconName}" not found`);
		return "<style>:host{display:flex;}</style>";
	}

	return `<style>:host{display:flex;}</style>${svgContent.replace("<svg", `<svg height="${iconSize}" width="${iconSize}"`)}`;
}

function getAttributes(element) {
	const attributes = {};
	for (const { name, value } of element.attributes) attributes[name] = value;
	return attributes;
}

async function processElement(element, parsedDocument) {
	const tagName = element.tagName.toLowerCase();
	const elementName = tagName.slice(4).trim();

	const attributes = getAttributes(element);

	const newElement = parsedDocument.createElement(tagName);
	newElement.setAttribute("server-rendered", "");

	let shadowDomContent = "";

	if (elementName === "icon") {
		shadowDomContent = await getIconContent(element);
	} else {
		const componentDefinition = await getTemplateAndStyles(elementName);
		if (!componentDefinition) {
			console.error(`No template found for ${elementName}`);
			return;
		}
		const { template, styles } = componentDefinition;
		shadowDomContent = `<style>${styles}</style>${template ? template(attributes) : ""}`;
	}

	for (const { name, value } of element.attributes)
		newElement.setAttribute(name, value);
	newElement.innerHTML = `<template shadowrootmode="open">${shadowDomContent}</template>${element.innerHTML}`;

	const ssrId = element.getAttribute("ssr-id");
	const originalElement = parsedDocument.querySelector(`[ssr-id="${ssrId}"]`);
	newElement.removeAttribute("ssr-id");
	originalElement.replaceWith(newElement);
}

export async function renderDeclarativeShadowDom(htmlString) {
	const { document } = parseHTML(htmlString);
	const elements = [...document.querySelectorAll("*")]
		.filter(
			(element) =>
				!["cek-code-block"].includes(element.tagName.toLowerCase()) &&
				element.tagName.toLowerCase().startsWith("cek-"),
		)
		.reverse();

	for (const element of elements) {
		element.setAttribute(
			"ssr-id",
			`$ssr-${Math.random().toString(36).slice(2, 11)}`,
		);
	}

	if (!elements.length) {
		return htmlString;
	}

	for (const element of elements) {
		await processElement(element, document);
	}
	return `<!DOCTYPE html><html lang="en">${document.documentElement.outerHTML}`;
}
