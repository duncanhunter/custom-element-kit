global.HTMLElement = class HTMLElement {};
global.customElements = { define: () => {} };

import hljs from "highlight.js";

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
) {
	const lang = attributes.lang || "xml";
	const theme = attributes.theme || "github-dark";
	const noTrim = attributes["no-trim"] === "true";
	const innerContent = element.innerHTML;
	const formattedContent = noTrim ? innerContent : formatContent(innerContent);

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
		const newElement = document.createElement(element.tagName.toLowerCase());
		newElement.setAttribute("server-rendered", "");
		newElement.innerHTML = `<template shadowrootmode="open"><style>${styles}${css}</style><link id="hljs-theme" rel="stylesheet"><pre><code class="${lang} hljs language-${lang}" data-highlighted="yes">${highlightedCode}</code></pre></template>${element.innerHTML}`;
		element.replaceWith(newElement);
		element.removeAttribute("ssr-id");
		return;
	} catch (error) {
		console.error("Failed to highlight code:", error);
		return;
	}
}
