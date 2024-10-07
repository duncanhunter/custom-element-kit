global.HTMLElement = class HTMLElement {};
global.customElements = { define: () => {} };

// Note: initial use of module is is slower likely due to the import and will require testing on request repsponse usage versus static site generation.
import { parseHTML } from "linkedom";
import { processCodeBlockElement } from "./process-code-block-element.mjs";

const FORM_COMPONENTS = new Set([
	"input",
	"textarea",
	"checkbox",
	"checkbox-group",
	"range",
	"button",
	"radio-group",
	"radio",
	"date-picker",
	"date-input",
	"calendar",
	"select",
	"combobox",
	"option",
]);

const SKIPPED_COMPONENTS = new Set([]);

const moduleCache = new Map();

async function getTemplateAndStyles(elementName) {
	if (moduleCache.has(elementName)) {
		return moduleCache.get(elementName);
	}

	try {
		const module = await import(
			`../components/${elementName}/${elementName}.js`
		);
		const camelCase = (str) =>
			str.replace(/-./g, (match) => match.charAt(1).toUpperCase());
		const styles = module[`${camelCase(elementName)}Styles`] || "";
		const template = module[`${camelCase(elementName)}Template`] || "";
		const templateAndStyles = { styles, template };
		moduleCache.set(elementName, templateAndStyles);
		return templateAndStyles;
	} catch (error) {
		console.error(
			`Failed to load module '../components/${elementName}/${elementName}.js':`,
			error,
		);
		return null;
	}
}

function isWithinComponents(element, components) {
	let parent = element.parentElement;
	while (parent) {
		if (parent.tagName?.toLowerCase().startsWith("ui-")) {
			const parentComponentName = parent.tagName.toLowerCase().slice(3);
			if (components.has(parentComponentName)) {
				return true;
			}
		}
		parent = parent.parentElement;
	}
	return false;
}

function getAttributes(element) {
	const attributes = {};
	for (const { name, value } of element.attributes) {
		attributes[name] = value;
	}
	return attributes;
}

function generateUniqueId(prefix = "id") {
	return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}

async function processElement(element, document) {
	const tagName = element.tagName.toLowerCase();
	const elementName = tagName.slice(3).trim();
	const attributes = getAttributes(element);

	let { template, styles } = await getTemplateAndStyles(elementName);

	if (FORM_COMPONENTS.has(elementName)) {
		const propsToHandle = ["value", "label", "help", "error"];

		for (const prop of propsToHandle) {
			if (attributes[prop]) {
				const id = prop === "value" ? "control" : prop;
				if (prop === "value") {
					template = template.replace(
						new RegExp(`(<[^>]*id\\s*=\\s*["']${id}["'][^>]*?)\\s*(/?>)`, "i"),
						(match, p1, closing) =>
							`${p1} value="${attributes[prop]}"${closing}`,
					);
				} else {
					template = template.replace(
						new RegExp(
							`(<slot\\s+name=["']${id}["'][^>]*>)([^<]*)(</slot>)`,
							"i",
						),
						`$1${attributes[prop]}$3`,
					);
				}
			}
		}

		if (attributes.error && !attributes.invalid) {
			template = template.replace(/(error=["'][^"']*["'])/, "$1 invalid");
		}
	}

	const shadowDomContent = `<style>${styles}</style>${template}`;
	const newElement = document.createElement(tagName);
	newElement.setAttribute("server-rendered", "");
	for (const { name, value } of element.attributes) {
		newElement.setAttribute(name, value);
	}
	newElement.innerHTML = `<template shadowrootmode="open">${shadowDomContent}</template>${element.innerHTML}`;
	const ssrId = element.getAttribute("ssr-id");
	const originalElement = document.querySelector(`[ssr-id="${ssrId}"]`);
	originalElement.replaceWith(newElement);
	originalElement.removeAttribute("ssr-id");
}

export async function replaceElementWithDeclarativeShadowDom(htmlString) {
	const { document } = parseHTML(htmlString);
	const allElements = document.querySelectorAll("*");

	const customElementsList = Array.from(allElements).filter((element) => {
		const tagName = element.tagName.toLowerCase();
		if (
			!tagName.startsWith("ui-") ||
			SKIPPED_COMPONENTS.has(tagName.slice(3)) ||
			isWithinComponents(element, SKIPPED_COMPONENTS) ||
			element.hasAttribute("skip-server-render") ||
			isWithinComponents(element, new Set(["code-block"]))
		) {
			return false;
		}
		return true;
	});

	for (const element of customElementsList) {
		const ssrId = generateUniqueId("ssr");
		element.setAttribute("ssr-id", ssrId);
	}

	if (customElementsList.length === 0) {
		return htmlString;
	}

	for (const element of customElementsList) {
		if (element.tagName.toLowerCase() === "ui-code-block") {
			const { styles } = await getTemplateAndStyles(
				element.tagName.toLowerCase().slice(3),
			);
			await processCodeBlockElement(
				document,
				getAttributes(element),
				element,
				styles,
			);
		} else {
			await processElement(element, document);
		}
	}

	return document.documentElement.outerHTML;
}
