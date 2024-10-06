global.HTMLElement = class HTMLElement {};
global.customElements = { define: () => {} };

import hljs from "highlight.js";
import { parseHTML } from "linkedom";

function formatContent(content) {
	const lines = content.split("\n");
	const minLeadingWhitespace = Math.min(
		...lines
			.filter((line) => line.trim().length > 0)
			.map((line) => line.match(/^\s*/)[0].length),
	);
	const filteredLines = lines.filter(
		(line, index) => !(index === 0 && line.trim() === ""),
	);
	return filteredLines
		.map((line) => line.slice(minLeadingWhitespace))
		.join("\n");
}

function getAttributes(element) {
	const attributes = {};
	for (const { name, value } of element.attributes) {
		attributes[name] = value;
	}
	return attributes;
}

function generateUniqueId() {
	return `id-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 9)}`;
}

export async function replaceElementWithDeclarativeShadowDom(htmlString) {
	const { document } = parseHTML(htmlString);
	const allElements = document.querySelectorAll("*");
	const customElements = Array.from(allElements).filter((element) =>
		element.tagName.toLowerCase().startsWith("ui-"),
	);

	for (const element of customElements) {
		if (
			element.hasAttribute("server-rendered") ||
			element.parentElement.closest("ui-code-block")
		) {
			continue;
		}
		element.setAttribute("data-parse-id", generateUniqueId());
		const tagName = element.tagName.toLowerCase();
		const elementName = tagName.slice(3);
		const attributes = getAttributes(element);
		const parseId = element.getAttribute("data-parse-id");

		let module;
		try {
			module = await import(`../components/${elementName}/${elementName}.js`);
		} catch (error) {
			console.error(
				`Failed to load module '../components/${elementName}/${elementName}.js':`,
				error,
			);
			continue;
		}

		const camelCase = (str) =>
			str.replace(/-./g, (match) => match.charAt(1).toUpperCase());
		const styles = module[`${camelCase(elementName)}Styles`];
		const props = ["value", "label", "help", "error"];
		let template = module[`${camelCase(elementName)}Template`];

		if (elementName === "code-block") {
			const lang = attributes.lang || "xml";
			const theme = attributes.theme || "github-dark";
			const noTrim = attributes["no-trim"] === "true";
			const innerContent = element.innerHTML;
			const formattedContent = noTrim
				? innerContent
				: formatContent(innerContent);

			let highlightedCode;
			let css;
			try {
				const langModule = await import(`highlight.js/lib/languages/${lang}`);
				hljs.registerLanguage(lang, langModule.default);

				highlightedCode = hljs.highlight(formattedContent, {
					language: `${lang}`,
				}).value;

				const response = await fetch(
					`https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/styles/${theme}.min.css`,
				);
				if (!response.ok) {
					throw new Error(
						`Failed to fetch CSS for theme "${theme}": ${response.statusText}`,
					);
				}
				css = await response.text();
			} catch (error) {
				console.error("Failed to highlight code:", error);
				continue;
			}

			const shadowDomContent = `<style>${styles}${css}</style><link id="hljs-theme" rel="stylesheet"><pre><code class="${lang} hljs language-${lang}" data-highlighted="yes">${highlightedCode}</code></pre>`;
			const shadowRootTemplate = `<template shadowrootmode="open">${shadowDomContent}</template>`;

			const newElement = document.createElement(tagName);
			for (const [key, value] of Object.entries(attributes)) {
				newElement.setAttribute(key, value);
			}
			newElement.setAttribute("server-rendered", "");
			newElement.innerHTML = shadowRootTemplate;
			element.replaceWith(newElement);
			element.removeAttribute("data-parse-id");
			continue;
		}

		for (const prop of props) {
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

		const shadowDomContent = `<style>${styles}</style>${template}`;

		const shadowRoot = `<template shadowrootmode="open">${shadowDomContent}</template>${element.innerHTML}`;

		const newElement = document.createElement(tagName);
		for (const [key, value] of Object.entries(attributes)) {
			newElement.setAttribute(key, value);
		}
		newElement.setAttribute("server-rendered", "");
		newElement.innerHTML = shadowRoot;
		const originalElement = document.querySelector(
			`[data-parse-id="${parseId}"]`,
		);
		if (originalElement) {
			newElement.removeAttribute("data-parse-id");
			originalElement.replaceWith(newElement);
		}
	}

	return document.documentElement.outerHTML;
}
