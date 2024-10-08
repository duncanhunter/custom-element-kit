export const codeBlockTemplate = `
<link id="hljs-theme" rel="stylesheet">
<pre><code part="code"></code></pre>
<button part="copy-button" aria-label="Copy code block">
	<svg part="copy-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
		<path stroke-linecap="round" stroke-linejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
	</svg>
	<svg part="check-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  		<path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
	</svg>
</button>
<div id="aria-live-region" aria-live="polite" role="status"></div>
`;

export const codeBlockStyles = /* css */ `
:host {
	position: relative;
}

pre {
    margin: 0;
}

code {
    white-space: pre-wrap;
}

[part=copy-button] {
	display: flex;
	justify-content: center;
	position: absolute;
	top: var(--cek-space-4);
	right: var(--cek-space-4);
	background-color: var(--cek-color-gray-800);
	border: none;
	border-radius: var(--cek-border-radius-2);
	padding: var(--cek-space-3);
	cursor: pointer;
	color: white;
}

[part=check-icon] {
	display: none;
}

[part=copy-button] svg {
	width: var(--cek-space-6);
	height: var(--cek-space-6);
}

[part=copy-button]:hover {
	background-color: var(--cek-color-gray-600);
}

[part=copy-button]:focus {
	outline: var(--cek-focus-ring);
	outline-offset: var(--cek-focus-ring-offset);
}

#aria-live-region {
	position: absolute;
	width: 1px;
	height: 1px;
	padding: 0;
	margin: -1px;
	overflow: hidden;
	clip: rect(0, 0, 0, 0);
	border: 0;
}
`;

export class CodeBlock extends HTMLElement {
	static get observedAttributes() {
		return ["lang", "theme", "no-trim"];
	}

	#observer;
	#codeElement;
	#copyButtonElement;
	#checkIconElement;
	#copyIconElement;
	#ariaLiveRegionElement;

	constructor() {
		super();
		if (this.parentElement.closest("cek-code-block")) {
			return; // Note: nested cek-code-block's are visual visual text and should be inert.
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
			return; // Note: nested cek-code-block's are visual visual text and should be inert.
		}

		this.#observer.observe(this, {
			childList: true,
			characterData: true,
			subtree: true,
		});
		this.#copyButtonElement =
			this.shadowRoot.querySelector("[part=copy-button]");
		this.#checkIconElement = this.shadowRoot.querySelector("[part=check-icon]");
		this.#copyIconElement = this.shadowRoot.querySelector("[part=copy-icon]");
		this.#codeElement = this.shadowRoot.querySelector("[part=code]");
		this.#ariaLiveRegionElement =
			this.shadowRoot.querySelector("#aria-live-region");
		this.#copyButtonElement.addEventListener(
			"click",
			this.#handleCopyButtonClick,
		);

		if (!this.serverRendered) {
			this.#updateCodeBlock();
		}
	}

	disconnectedCallback() {
		this.#observer.disconnect();
		this.#copyButtonElement.removeEventListener(
			"click",
			this.#handleCopyButtonClick,
		);
	}

	attributeChangedCallback(name, oldValue, newValue) {
		if (oldValue !== newValue && oldValue) {
			if (!this.serverRendered) {
				this.#updateCodeBlock();
			}
		}
	}

	#handleCopyButtonClick = () => {
		navigator.clipboard.writeText(this.#codeElement.textContent);
		this.#copyIconElement.style.display = "none";
		this.#checkIconElement.style.display = "block";

		// Note: Clearing the text content or removing and adding back the element will not trigger the aria-live region to announce the new text, so change the text content to '...copying' and then back to 'code copied to clipboard' to trigger the announcement.
		this.#ariaLiveRegionElement.textContent = "Copying...";
		setTimeout(() => {
			this.#ariaLiveRegionElement.textContent = "Code copied to clipboard";
		}, 100);

		setTimeout(() => {
			this.#copyIconElement.style.display = "block";
			this.#checkIconElement.style.display = "none";
			this.#ariaLiveRegionElement.textContent = " ";
		}, 1000);
	};

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
