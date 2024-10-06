export const codeBlockTemplate = /* html */ `
<div part="container"><slot></slot></div>
`;

export const codeBlockStyles = /* css */ `
pre {
    padding: var(--ui-space-6);
}
code {
    white-space: pre-wrap;
}
`;

export class CodeBlock extends HTMLElement {
	static get observedAttributes() {
		return ["lang", "theme", "no-trim"];
	}

	#slot;

	constructor() {
		super();
		if (!this.shadowRoot) {
			this.attachShadow({ mode: "open" });
			this.shadowRoot.innerHTML = `<style>${codeBlockStyles}</style>${codeBlockTemplate}`;
		}
		this.#slot = this.shadowRoot.querySelector("slot");
	}

	connectedCallback() {
		if (this.hasAttribute('server-rendered')) {
			this.#slot.addEventListener('slotchange', this.#handleSlotChange);
		} else {
			// this.#updateCodeBlock();
		}
	}

	disconnectedCallback() {
		this.#slot.removeEventListener('slotchange', this.#handleSlotChange);
	}

	attributeChangedCallback(name, oldValue, newValue) {
		if (oldValue !== newValue) {
			// this.#updateCodeBlock();
		}
	}

	#handleSlotChange = () => {
		this.removeAttribute('server-rendered');
		// this.#updateCodeBlock();
	}

	async #updateCodeBlock() {
		console.log('updateCodeBlock');
		const containerElement = this.shadowRoot.querySelector("[part=container]");
		const slotContent = this.#getSlotContentAsHTML(this.#slot);
		const lang = this.getAttribute("lang") || "html";
		const theme = this.getAttribute("theme") || "github-dark";

		try {
			const { codeToHtml } = ""//await import("https://esm.sh/shiki@1.0.0");
			containerElement.innerHTML = ""//await codeToHtml(slotContent, { lang, theme });
		} catch (error) {
			console.error("Failed to highlight code:", error);
			return;
		}
	}

	#getSlotContentAsHTML(slot) {
		const assignedNodes = slot.assignedNodes({ flatten: true });
		let htmlString = "";
		for (const node of assignedNodes) {
			if (node.nodeType === Node.ELEMENT_NODE) {
				htmlString += node.outerHTML;
			} else if (node.nodeType === Node.TEXT_NODE) {
				htmlString += node.textContent;
			}
		}
		return this.getAttribute("no-trim") ? htmlString : this.#formatContent(htmlString);
	}

	#formatContent(content) {
		const lines = content.split('\n');
		const minLeadingWhitespace = Math.min(
			...lines.filter(line => line.trim().length > 0).map(line => line.match(/^\s*/)[0].length)
		);
		const filteredLines = lines.filter((line, index) => !(index === 0 && line.trim() === ''));
		return filteredLines.map(line => line.slice(minLeadingWhitespace)).join('\n');
	}
}

customElements.define("ui-code-block", CodeBlock);
