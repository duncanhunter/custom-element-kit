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
	"digit-input",
	"calendar",
	"select",
	"combobox",
	"option",
]);

const SKIPPED_COMPONENTS = new Set([]);

const moduleCache = new Map();

const camelCase = (str) =>
	str.replace(/-./g, (match) => match.charAt(1).toUpperCase());

async function getIcon(element) {
	const name = element.getAttribute("name");
	const size = element.getAttribute("size");

	if (!name) {
		return;
	}

	if (moduleCache.has("icons")) {
		const icon = moduleCache.get("icons")[camelCase(name)] || "";
		const updatedSVG = icon.replace(
			"<svg",
			`<svg height="${size}" width="${size}"`,
		);

		return updatedSVG;
	}

	try {
		const { default: icons } = await import("../components/icons/icons.js");
		moduleCache.set("icons", icons);
		const icon = icons[camelCase(name)] || "";
		const updatedSVG = icon.replace(
			"<svg",
			`<svg height="${size}" width="${size}"`,
		);

		return updatedSVG;
	} catch (error) {
		return console.error(
			"Failed to load module '../components/icons/icons.js':",
			error,
		);
	}
}

async function getTemplateAndStyles(elementName) {
	if (moduleCache.has(elementName)) {
		return moduleCache.get(elementName);
	}

	const parentElementName = elementName.startsWith("tab")
		? "tabs"
		: elementName;

	try {
		const module = await import(
			`../components/${parentElementName}/${parentElementName}.js`
		);
		const styles = module[`${camelCase(elementName)}Styles`] || "";
		const template = module[`${camelCase(elementName)}Template`] || "";
		const arrowIcon = module?.arrowIcon || "";
		const templateAndStyles = { styles, template, arrowIcon };
		moduleCache.set(elementName, templateAndStyles);
		return templateAndStyles;
	} catch (error) {
		console.error(
			`Failed to load module '../components/${parentElementName}/${parentElementName}.js':`,
			error,
		);
		return null;
	}
}

function isWithinComponents(element, components) {
	let parent = element.parentElement;
	while (parent) {
		if (parent.tagName?.toLowerCase().startsWith("cek-")) {
			const parentComponentName = parent.tagName.toLowerCase().slice(4);
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

const arrowsToAdd = new Set();

async function processElement(element, document) {
	const tagName = element.tagName.toLowerCase();
	const elementName = tagName.slice(4).trim();
	const attributes = getAttributes(element);

	let { template, styles } = await getTemplateAndStyles(elementName);

	if (FORM_COMPONENTS.has(elementName)) {
		const propsToHandle = ["value", "label", "help", "error", "type"];

		for (const prop of propsToHandle) {
			if (attributes[prop]) {
				const id = prop === "value" || prop === "type" ? "control" : prop;
				if (prop === "value") {
					template = template.replace(
						new RegExp(`(<[^>]*id\\s*=\\s*["']${id}["'][^>]*?)\\s*(/?>)`, "i"),
						(match, p1, closing) =>
							`${p1} value="${attributes[prop]}"${closing}`,
					);
				} else if (prop === "type") {
					template = template.replace(
						new RegExp(`(<[^>]*id\\s*=\\s*["']${id}["'][^>]*?)\\s*(/?>)`, "i"),
						(match, p1, closing) => {
							if (p1.match(/type\s*=\s*["'][^"']*["']/i)) {
								return (
									p1.replace(
										/type\s*=\s*["'][^"']*["']/i,
										`type="${attributes[prop]}"`,
									) + closing
								);
							}
							return `${p1} type="${attributes[prop]}"${closing}`;
						},
					);
					if (attributes[prop] === "password") {
						console.log({ prop, id, elementName });
						console.log({ template });
					}
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

	if (elementName === "icon") {
		template = await getIcon(element);
	}

	if (elementName === "button" && attributes.arrow === "") {
		const { arrowIcon } = await getTemplateAndStyles("button");
		const buttonRegex = /(<button[^>]*>)([\s\S]*?)(<\/button>)/gi;
		template = template.replace(buttonRegex, (match, p1, p2, p3) => {
			return `${p1}${p2}${arrowIcon}${p3}`;
		});
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
	newElement.removeAttribute("ssr-id");
	originalElement.replaceWith(newElement);
}

export async function replaceElementWithDeclarativeShadowDom(htmlString) {
	const { document } = parseHTML(htmlString);
	const allElements = document.querySelectorAll("*");

	const customElementsList = Array.from(allElements).filter((element) => {
		const tagName = element.tagName.toLowerCase();
		if (
			!tagName.startsWith("cek-") ||
			SKIPPED_COMPONENTS.has(tagName.slice(4)) ||
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
		if (element.tagName.toLowerCase() === "cek-code-block") {
			const { styles, template } = await getTemplateAndStyles(
				element.tagName.toLowerCase().slice(4),
			);
			await processCodeBlockElement(
				document,
				getAttributes(element),
				element,
				styles,
				template,
			);
		} else {
			await processElement(element, document);
		}
	}

	return `<!DOCTYPE html><html lang="en">${document.documentElement.outerHTML}`;
}
