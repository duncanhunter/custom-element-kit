global.HTMLElement = class HTMLElement { };
global.customElements = { define: () => { } };

import { parseHTML } from 'linkedom';
import { codeToHtml } from 'shiki';

function formatContent(content) {
	const lines = content.split('\n');
	const minLeadingWhitespace = Math.min(
		...lines.filter(line => line.trim().length > 0).map(line => line.match(/^\s*/)[0].length)
	);
	const filteredLines = lines.filter((line, index) => !(index === 0 && line.trim() === ''));
	return filteredLines.map(line => line.slice(minLeadingWhitespace)).join('\n');
}

function getAttributes(element) {
	const attributes = {};
	for (const { name, value } of element.attributes) {
		attributes[name] = value;
	}
	return attributes;
}

export async function replaceElementWithDeclarativeShadowDom(htmlString) {
	const { document } = parseHTML(htmlString);
	const allElements = document.querySelectorAll('*');
	const customElements = Array.from(allElements).filter(element => element.tagName.toLowerCase().startsWith('ui-'));

	customElements.forEach((element, index) => {
		element.setAttribute('data-parse-id', index);
	});

	for (const element of customElements) {
		if (element.hasAttribute('server-rendered') || element.parentElement.closest('ui-code-block')) { continue };

		const tagName = element.tagName.toLowerCase();
		const elementName = tagName.slice(3);
		const attributes = getAttributes(element);
		const parseId = element.getAttribute('data-parse-id');

		let module;
		try {
			module = await import(`../components/${elementName}/${elementName}.js`);
		} catch (error) {
			console.error(`Failed to load module '../components/${elementName}/${elementName}.js':`, error);
			continue;
		}


		const camelCase = str => str.replace(/-./g, match => match.charAt(1).toUpperCase());
		const styles = module[`${camelCase(elementName)}Styles`];
		const props = ["value", "label", "help", "error"];
		let template = module[`${camelCase(elementName)}Template`];

		if (elementName === 'code-block') {
			console.log('found code block');
			const lang = attributes.lang || 'html';
			const theme = attributes.theme || 'github-dark';
			const noTrim = attributes['no-trim'] === 'true';
			const innerContent = element.innerHTML;
			const formattedContent = noTrim ? innerContent : formatContent(innerContent);

			let highlightedCode;
			try {
				highlightedCode = await codeToHtml(formattedContent, { lang, theme });
			} catch (error) {
				console.error("Failed to highlight code:", error);
				continue;
			}

			const shadowDomContent = `<style>${styles}</style><div part="container">${highlightedCode}</div>`;
			const shadowRootTemplate = `<template shadowrootmode="open"><slot>${shadowDomContent}</slot></template>`;

			const newElement = document.createElement(tagName);
			for (const [key, value] of Object.entries(attributes)) {
				newElement.setAttribute(key, value);
			}
			newElement.setAttribute('server-rendered', '');
			newElement.innerHTML = shadowRootTemplate;
			newElement.removeAttribute('data-parse-id');
			element.replaceWith(newElement);
			continue;
		}

		for (const prop of props) {
			if (attributes[prop]) {
				const id = prop === "value" ? "control" : prop;
				if (prop === "value") {
					template = template.replace(
						new RegExp(`(<[^>]*id\\s*=\\s*["']${id}["'][^>]*?)\\s*(/?>)`, "i"),
						(match, p1, closing) => `${p1} value="${attributes[prop]}"${closing}`
					);
				} else {
					template = template.replace(
						new RegExp(`(<slot\\s+name=["']${id}["'][^>]*>)([^<]*)(</slot>)`, "i"),
						`$1${attributes[prop]}$3`
					);
				}
			}
		}

		if (attributes.error && !attributes.invalid) {
			template = template.replace(
				/(error=["'][^"']*["'])/,
				'$1 invalid'
			);
		}

		const shadowDomContent = `<style>${styles}</style>${template}`;

		const shadowRoot = `<template shadowrootmode="open">${shadowDomContent}</template>${element.innerHTML}`;

		const newElement = document.createElement(tagName);
		for (const [key, value] of Object.entries(attributes)) {
			newElement.setAttribute(key, value);
		}
		newElement.setAttribute('server-rendered', '');
		newElement.innerHTML = shadowRoot;
		const originalElement = document.querySelector(`[data-parse-id="${parseId}"]`);
		if (originalElement) {
			newElement.removeAttribute('data-parse-id');
			originalElement.replaceWith(newElement);
		}
	}

	return document.documentElement.outerHTML;
}