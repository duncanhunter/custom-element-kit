import { codeToHtml } from "https://esm.sh/shiki@1.0.0";

export const codeBlockTemplate = /* html */ `
<div part="container"><slot></slot></div>
`;

export const codeBlockStyles = /* css */ `
pre {
	padding: var(--ui-space-6);
}
code {
    white-space: normal;
}
`;

export class CodeBlock extends HTMLElement {
	static get observedAttributes() {
		return ["lang", "theme"];
	}

	constructor() {
		super();
		if (!this.shadowRoot) {
			this.attachShadow({ mode: "open" });
			this.shadowRoot.innerHTML = `<style>${codeBlockStyles}</style>${codeBlockTemplate}`;
		}
	}

	connectedCallback() {
		this.updateCodeBlock();
	}

	attributeChangedCallback(name, oldValue, newValue) {
		if (oldValue !== newValue) {
			this.updateCodeBlock();
		}
	}

	async updateCodeBlock() {
		const slot = this.shadowRoot.querySelector("slot");
		const containerElement = this.shadowRoot.querySelector("[part=container]");
		const slotContent = this.getSlotContentAsHTML(slot);
		const lang = this.getAttribute("lang") || "html";
		const theme = this.getAttribute("theme") || "github-dark";
		containerElement.innerHTML = await codeToHtml(slotContent, { lang, theme });
	}

	getSlotContentAsHTML(slot) {
		const assignedNodes = slot.assignedNodes({ flatten: true });
		let htmlString = "";
		for (const node of assignedNodes) {
			if (node.nodeType === Node.ELEMENT_NODE) {
				htmlString += node.outerHTML;
			} else if (node.nodeType === Node.TEXT_NODE) {
				htmlString += node.textContent;
			}
		}
		return htmlString;
	}
}

customElements.define("ui-code-block", CodeBlock);
