import hljs from "highlight.js";

const languageModuleCache = new Map();
const themeCssCache = new Map();
const registeredLanguages = new Set();

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

export async function processCodeBlockElement(
	document,
	attributes,
	element,
	styles,
	template,
) {
	const lang = attributes.lang || "xml";
	const theme = attributes.theme || "github-dark";
	const noTrim = attributes["no-trim"] === "true";
	const innerContent = element.innerHTML;
	const formattedContent = noTrim ? innerContent : formatContent(innerContent);

	try {
		if (!languageModuleCache.has(lang)) {
			const langModule = await import(`highlight.js/lib/languages/${lang}`);
			languageModuleCache.set(lang, langModule.default);
		}

		if (!registeredLanguages.has(lang)) {
			hljs.registerLanguage(lang, languageModuleCache.get(lang));
			registeredLanguages.add(lang);
		}

		const highlightedCode = hljs.highlight(formattedContent, {
			language: lang,
		}).value;

		if (!themeCssCache.has(theme)) {
			const response = await fetch(
				`https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/styles/${theme}.min.css`,
			);
			if (!response.ok) {
				throw new Error(
					`Failed to fetch CSS for theme "${theme}": ${response.statusText}`,
				);
			}
			const css = await response.text();
			themeCssCache.set(theme, css);
		}
		const css = themeCssCache.get(theme);

		const codeRegex = /<code[^>]*>[\s\S]*?<\/code>/im;
		const highlightedTemplate = template.replace(
			codeRegex,
			`<code part="code" class="${lang} hljs language-${lang}" data-highlighted="yes">${highlightedCode}</code>`,
		);

		const newElement = document.createElement(element.tagName.toLowerCase());
		newElement.setAttribute("server-rendered", "");
		newElement.innerHTML = `<template shadowrootmode="open"><style>${styles}${css}</style>${highlightedTemplate}</template>${element.innerHTML}`;

		element.replaceWith(newElement);
		element.removeAttribute("ssr-id");
	} catch (error) {
		console.error("Failed to highlight code:", error);
	}
}
