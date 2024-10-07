export const codeBlockTemplate = `
    <link id="hljs-theme" rel="stylesheet">
    <pre><code class=""></code></pre>
`;

export const codeBlockStyles = `
    pre {
        margin: 0;
    }
    code {
        white-space: pre-wrap;
    }
`;

export class CodeBlock extends HTMLElement {
	static get observedAttributes() {
		return ["lang", "theme", "no-trim"];
	}

	#observer;

	constructor() {
		super();
		if (this.parentElement.closest("cek-code-block")) {
			return; // Note: nested code blocks are not supported and are visual code and should inert.
		}

		if (!this.shadowRoot) {
			this.attachShadow({ mode: "open" });
			this.shadowRoot.innerHTML = `<style>${codeBlockStyles}</style>${codeBlockTemplate}`;
		}

		this.#observer = new MutationObserver(() => this.#handleMutations());
	}

	get serverRendered() {
		return this.hasAttribute("server-rendered");
	}

	connectedCallback() {
		if (this.parentElement.closest("cek-code-block")) {
			this.dataset.inert = true;
			return; // Note: nested code blocks are not supported and are visual code and should inert.
		}

		this.#observer.observe(this, {
			childList: true,
			characterData: true,
			subtree: true,
		});

		if (!this.serverRendered) {
			this.#updateCodeBlock();
		}
	}

	disconnectedCallback() {
		this.#observer.disconnect();
	}

	attributeChangedCallback(name, oldValue, newValue) {
		if (oldValue !== newValue && oldValue) {
			if (!this.serverRendered) {
				this.#updateCodeBlock();
			}
		}
	}

	#handleMutations() {
		if (!this.serverRendered) {
			this.#updateCodeBlock();
		}
	}

	async #updateCodeBlock() {
		this.removeAttribute("server-rendered");

		const codeElement = this.shadowRoot.querySelector("code");
		const lang = this.getAttribute("lang") || "plaintext";
		const theme = this.getAttribute("theme") || "github";
		const noTrim = this.getAttribute("no-trim") === "true";
		const rawContent = this.innerHTML;
		const formattedContent = noTrim
			? rawContent
			: this.#formatContent(rawContent);
		codeElement.removeAttribute("data-highlighted");
		codeElement.className = lang;
		codeElement.textContent = formattedContent;

		this.shadowRoot.querySelector("#hljs-theme").href =
			`https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.9.0/build/styles/${theme}.min.css`;
		try {
			const hljs = await import(
				"https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.9.0/build/es/highlight.min.js"
			);
			const langModule = await import(
				`https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.9.0/build/es/languages/${lang}.min.js`
			);
			hljs.default.registerLanguage(lang, langModule.default);
			hljs.default.highlightElement(codeElement, { language: lang });
		} catch (error) {
			console.error("Failed to highlight code:", error);
		}
	}

	#formatContent(content) {
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
}

customElements.define("cek-code-block", CodeBlock);
