export const detailsTemplate = /*html*/ `
<details part="details">
	<summary part="summary">
		<div part="summary-heading"><slot name="summary"></slot></div>
		<div part="icon-expanded">
			<slot name="icon-expanded">
				<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>	  
			</slot>
		</div>
		<div part="icon-collapsed">
			<slot name="icon-collapsed">
				<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">  <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" /></svg>
			</slot>
		</div>
	</summary>
	<div part="content">
		<slot></slot>
	</div>
</details>
`;

export const detailsStyles = /*css*/ `
  	:host {
   		display: block;
		margin-bottom: var(--cek-space-2);
  	}
	
	details summary::-webkit-details-marker {
		display:none;
	}

	summary {
		display: flex;
		align-items: center;
		justify-content: space-between;
		border-radius: var(--cek-border-radius-2);
		border: 2px solid var(--cek-border-color-0);
		color: var(--cek-text-color-1);
		padding: var(--cek-space-2);
		user-select: none;
		cursor: pointer;

		&:focus {
			outline: var(--cek-focus-ring);
			outline-offset: -2px;
		}
	}

	[part="content"] {
		padding: var(--cek-space-2);
	}

	details[open] {
		& [part="icon-collapsed"] {
			display: inline-flex;
			height: 1rem;
			width: 1rem;
		}
		& [part="icon-expanded"] {
			display: none;
			height: 0rem;
			width: 0rem;
		}
	}
	details:not([open]) {
		& [part="icon-collapsed"] {
			display: none;
			height: 0rem;
			width: 0rem;
		}
		& [part="icon-expanded"] {
			display: inline-flex;
			height: 1rem;
			width: 1rem;
		}
	}
`;

class Details extends HTMLElement {
	static get observedAttributes() {
		return ["summary", "name", "open", "heading-level"];
	}

	#summary;

	constructor() {
		super();
		// this.attachShadow({ mode: "open" });
		if (!this.shadowRoot) {
			this.attachShadow({ mode: "open" });
			this.shadowRoot.innerHTML = `<style>${detailsStyles}</style>${detailsTemplate}`;
		}
		this.#summary = this.shadowRoot.querySelector("[part=summary]");
	}

	get summary() {
		return this.getAttribute("summary");
	}

	set summary(value) {
		this.setAttribute("summary", value);
	}

	get name() {
		return this.getAttribute("name");
	}

	set name(value) {
		this.setAttribute("name", value);
	}

	get open() {
		return this.hasAttribute("open");
	}

	set open(value) {
		this.setAttribute("open", value);
	}

	get detailsElement() {
		return this.shadowRoot.querySelector("details");
	}

	get detailsElements() {
		return Array.from(
			document.querySelectorAll(`cek-details[name="${this.name}"]` ?? []),
		);
	}

	get headingLevel() {
		return this.getAttribute("heading-level") ?? "h3";
	}

	set headingLevel(value) {
		this.setAttribute("heading-level", value);
	}

	connectedCallback() {
		this.#initOnDetailsElementOpen();
		this.#initExclusiveAccordion();
	}

	disconnectedCallback() {
		this.detailsElement.removeEventListener("toggle", this.#onToggle);
	}

	attributeChangedCallback(name, oldValue, newValue) {
		if (name === "summary") {
			const summary = this.shadowRoot.querySelector("[name='summary']");
			summary.innerHTML = newValue;
		}
		if (name === "name") {
			this.shadowRoot.querySelector("details").setAttribute("name", newValue);
		}
		if (name === "open") {
			if (oldValue === null || newValue === oldValue) return;
			this.detailsElement.toggleAttribute("open", newValue);
			this.dispatchEvent(
				new CustomEvent("cek-toggle", {
					bubbles: true,
					composed: true,
					cancelable: true,
					detail: { open: this.open },
				}),
			);
		}
		if (name === "heading-level") {
			this.#updateHeadingLevel(newValue);
		}
	}

	#updateHeadingLevel(headingLevel) {
		const isInvalidHeadingLevel = +headingLevel >= 1 && +headingLevel <= 6;
		if (!isInvalidHeadingLevel) return;
		const summaryElement = this.shadowRoot.querySelector(
			"[part=summary-heading]",
		);
		summaryElement.setAttribute("role", "heading");
		summaryElement.setAttribute("aria-level", headingLevel);
	}

	#initExclusiveAccordion() {
		if (!this.name) return;

		const globalEventListenerName = `${this.name.replace(
			/\s+/g,
			"",
		)}UiDetailsToggleEventListener`;

		if (!window[globalEventListenerName]) {
			window[globalEventListenerName] = true;
			window.addEventListener("cek-toggle", this.#onToggle);
		}
	}

	#onToggle = ({ target: details }) => {
		if (
			details.tagName === "cek-DETAILS" &&
			details.open &&
			details.name === this.name
		) {
			for (const otherDetails of this.detailsElements) {
				if (otherDetails !== details) {
					otherDetails.removeAttribute("open");
				}
			}
		}
	};

	#initOnDetailsElementOpen() {
		this.detailsElement.toggleAttribute("open", this.open);
		this.detailsElement.addEventListener("toggle", (event) => {
			this.toggleAttribute("open", event.target.open);
			this.dispatchEvent(
				new CustomEvent("cek-toggle", {
					bubbles: true,
					composed: true,
					cancelable: true,
					detail: { open: this.open },
				}),
			);
		});
	}

	focus() {
		this.#summary.focus();
	}
}

customElements.define("cek-details", Details);
