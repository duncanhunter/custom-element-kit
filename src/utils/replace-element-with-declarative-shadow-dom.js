// Note: Mock global definitions that only run in the browser.
global.HTMLElement = class HTMLElement {};
global.customElements = { define: () => {} };

export async function replaceElementWithDeclarativeShadowDom(htmlString) {
	const customElementRegex = /<ui-([a-z0-9-]+)\b([^>]*)>([\s\S]*?)<\/ui-\1>/gi;

	function parseAttributes(attributeString) {
		const attributes = {};
		const attrRegex =
			/([^\s=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g;
		let match;
		while (true) {
			match = attrRegex.exec(attributeString);
			if (match === null) {
				break;
			}
			const name = match[1];
			const value = match[2] || match[3] || match[4] || "";
			attributes[name] = value;
		}
		return attributes;
	}

	let resultHtml = "";
	let lastIndex = 0;
	let match;

	while (true) {
		match = customElementRegex.exec(htmlString);
		if (match === null) {
			break;
		}
		const [fullMatch, elementName, attributeString, innerContent] = match;
		const elementStartIndex = match.index;
		const elementEndIndex = customElementRegex.lastIndex;
		const attributes = parseAttributes(attributeString);

		resultHtml += htmlString.slice(lastIndex, elementStartIndex);
		lastIndex = elementEndIndex;

		let module;
		try {
			module = await import(`../components/${elementName}/${elementName}.js`);
		} catch (error) {
			console.error(
				`Failed to load module '../components/${elementName}/${elementName}.js':`,
				error,
			);
			resultHtml += fullMatch;
			continue;
		}

		function kebabToCamelCase(str) {
			return str.replace(/-./g, (match) => match.charAt(1).toUpperCase());
		}

		const templateName = `${kebabToCamelCase(elementName)}Template`;
		const stylesName = `${kebabToCamelCase(elementName)}Styles`;
		const template = module[templateName];
		const styles = module[stylesName];
		const props = ["value", "label", "help", "error"];

		const processedInnerContent =
			await replaceElementWithDeclarativeShadowDom(innerContent);
		const processedTemplate =
			await replaceElementWithDeclarativeShadowDom(template);

		let shadowDomContent = `<style>${styles}</style>${processedTemplate}`;
		let updatedAttributeString = attributeString;
		if (attributes.error) {
			if (!attributeString.includes("invalid")) {
				updatedAttributeString = updatedAttributeString.replace(
					/(error=["'][^"']*["'])/,
					"$1 invalid",
				);
			}
		}

		for (const prop of props) {
			if (attributes[prop]) {
				const id = prop === "value" ? "control" : prop;

				if (prop === "value") {
					const valueRegex = new RegExp(
						`(<[^>]*id\\s*=\\s*["']${id}["'][^>]*?)\\s*(/?>)`,
						"i",
					);
					shadowDomContent = shadowDomContent.replace(
						valueRegex,
						(match, p1, closing) =>
							`${p1} value="${attributes[prop]}"${closing}`,
					);
				} else {
					const slotRegex = new RegExp(
						`(<slot\\s+name=["']${id}["'][^>]*>)([^<]*)(</slot>)`,
						"i",
					);
					shadowDomContent = shadowDomContent.replace(
						slotRegex,
						`$1${attributes[prop]}$3`,
					);
				}
			}
		}

		const shadowRoot = `<template shadowrootmode="open">${shadowDomContent}</template>`;
		const resultElement = `<ui-${elementName}${updatedAttributeString}>${shadowRoot}${processedInnerContent}</ui-${elementName}>`;
		resultHtml += resultElement;
	}

	resultHtml += htmlString.slice(lastIndex);
	return resultHtml;
}
