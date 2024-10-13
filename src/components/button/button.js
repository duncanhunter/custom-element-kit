export const arrowIcon = /*html*/ `<svg aria-hidden="true" part="arrow-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">  <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" /></svg>`;

export const buttonTemplate = /*html*/ `
  <button part="button">
    <slot name="start"></slot>
    <div part="label"><slot></slot></div>
    <slot name="end"></slot>
    <svg part="loading-icon" width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z" opacity=".25"/><path d="M10.14,1.16a11,11,0,0,0-9,8.92A1.59,1.59,0,0,0,2.46,12,1.52,1.52,0,0,0,4.11,10.7a8,8,0,0,1,6.66-6.61A1.42,1.42,0,0,0,12,2.69h0A1.57,1.57,0,0,0,10.14,1.16Z"><animateTransform attributeName="transform" type="rotate" dur="0.75s" values="0 12 12;360 12 12" repeatCount="indefinite"/></path></svg>
  </button>
`;

export const buttonStyles = /*css*/ `
:host {
	display: inline-block;
}

button {
	position: relative;
	-webkit-appearance: none;
	appearance: none;
	border: var(--border);
	background: transparent;
	padding: 0;
	margin: 0;
	font: inherit;
	color: inherit;
	text-align: inherit;
	font-family: var(--cek-font-family);
	line-height: var(--cek-line-height);
	display: flex;
	justify-content: center;
	align-items: center;
	box-sizing: border-box;
	min-height: var(--cek-height-medium);
}

:host([variant])::part(button) {
	display: inline-flex;
	align-items: center;
	border: var(--border);
	padding-block: var(--cek-padding-block);
	padding-inline: var(--cek-padding-inline);
	border-radius: var(--cek-border-radius);
	cursor: pointer;
}

:host([variant])::part(button):where(:hover) {
	filter: brightness(85%);
}

:host([variant])::part(button):focus {
	outline: var(--cek-focus-ring);
	outline-offset: var(--cek-focus-ring-offset);
}
	
:host([loading])::part(button) {
	background-color: lightgray;
	color: rgba(0, 0, 0, 0.5);
}

:host([size="small"])::part(button) {
	font-size: var(--cek-font-size-0);
	line-height: var(--cek-line-height);
}

:host(:not([size]))::part(button),
:host([size="medium"])::part(button) {
	font-size: var(--cek-font-size-1);
	line-height: var(--cek-line-height);
}

:host([size="large"])::part(button) {
	font-size: var(--cek-font-size-2);
	line-height: var(--cek-line-height);
}

:host([variant="primary"])::part(button) {
	background-color: var(--cek-color-primary-500);
	color: white;
}

:host([variant="ascent"])::part(button) {
	background-color: var(--cek-surface-color-3);
	color: var(--cek-text-color-1);
}

:host([variant="outline"])::part(button) {
	background-color: transparent;
	border: 1px solid var(--cek-border-color-2);
	color: var(--cek-text-color-1);
}

:host([variant="text"])::part(button) {
	background-color: transparent;
	color: var(--cek-text-color-1);
}

:host([variant="text"])::part(button):hover {
	background-color: var(--cek-surface-color-2);
}

:host([variant="link"])::part(button) {
	background-color: transparent;
	color: var(--cek-color-primary-500);
	text-decoration: underline;
}

:host([variant])::part(label) {
	display: contents;
}

:host([icon-only])::part(button) {
	padding-inline: 0.8ch;
}

:host([disabled])::part(button) {
	background-color: #ccc;
	color: rgba(0, 0, 0, 0.5);
	cursor: not-allowed;
}

[name="end"]::slotted(*) {
	margin-inline-start: 0.5ch;
}

[name="start"]::slotted(*) {
	margin-inline-end: 0.5ch;
}

[part=loading-icon] {
	position: absolute;
	display: none;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
}

[part=arrow-icon] {
	height: 1em;
	width: 1em;
	margin-inline-start: 0.5ch;
}
`;

export class Button extends HTMLElement {
	static get observedAttributes() {
		return ["type", "loading", "disabled", "button-aria-label", "arrow"];
	}
	static formAssociated = true;

	constructor() {
		super();
		if (!this.shadowRoot) {
			this.attachShadow({ mode: "open", delegatesFocus: true });
			this.shadowRoot.innerHTML = `<style>${buttonStyles}</style>${buttonTemplate}`;
		}
		this.internals = this.attachInternals();
		this.buttonElement = this.shadowRoot.querySelector("[part=button]");
		this.loadingIconElement = this.shadowRoot.querySelector(
			"[part=loading-icon]",
		);
	}

	get type() {
		return this.getAttribute("type");
	}
	get loading() {
		return this.getAttribute("loading");
	}
	set loading(value) {
		value ? this.setAttribute("loading", "") : this.removeAttribute("loading");
	}

	connectedCallback() {
		// this.addEventListener("click", this);
		this.buttonElement.addEventListener("click", this.onClick);
		if (!this.type) {
			this.buttonElement.setAttribute("button", "button");
		} else if (this.type === "submit") {
			this.buttonElement.type = "submit";
		} else if (this.type === "reset") {
			this.buttonElement.type = "reset";
		}
	}

	handleEvent(event) {
		if (this.hasAttribute("disabled")) {
			return;
		}
		if (!this.contains(event.srcElement)) {
			return;
		}
		if (event.type === "click") {
			this.onClick(event);
		}
	}

	attributeChangedCallback(name, oldValue, newValue) {
		if (newValue === oldValue) return;
		if (name.startsWith("fetch-trigger") && oldValue !== newValue)
			addFetchTriggerEventListener(this, newValue);
		if (name === "loading") this.loadingAttributeChanged(newValue);
		if (name === "type") this.typeChanged(oldValue, newValue);
		if (name === "button-aria-label") {
			this.buttonElement.setAttribute("aria-label", newValue);
		}
		if (name === "arrow") {
			const arrowElement = this.shadowRoot?.querySelector(
				"svg[part=arrow-icon]",
			);
			if (arrowElement && newValue !== "" && newValue !== "true") {
				arrowIconElement?.remove();
			} else if (!arrowElement) {
				this.#insertArrowIcon();
			}
		}
	}

	onClick = (event) => {
		event.stopImmediatePropagation();
		event.stopPropagation();
		if (this.hasAttribute("loading") || this.hasAttribute("disabled")) {
			return;
		}
		// event.preventDefault();
		// this.dispatchEvent(new CustomEvent("cek-click"));
		const clone = new event.constructor(event.type, event);
		this.dispatchEvent(clone);
	};

	loadingAttributeChanged(newValue) {
		// const loadingIcon = this.shadowRoot.querySelector("loading-icon");

		if (newValue === null) {
			this.loadingIconElement.style.display = "none";
		} else {
			this.loadingIconElement.style.display = "block";
			if (!this.loadingIconElement?.getAttribute("name")) {
				this.loadingIconElement.setAttribute("name", "loading");
			}
		}
	}

	typeChanged(oldValue, newValue) {
		if (oldValue === "submit") {
			this.removeEventListener("click", this.#onSubmit);
		} else if (oldValue === "reset") {
			this.removeEventListener("click", this.#onReset);
		}

		if (newValue === "submit") {
			this.addEventListener("click", this.#onSubmit);
		} else if (newValue === "reset") {
			this.addEventListener("click", this.#onReset);
		}
	}

	#onSubmit() {
		if (this.internals.form) {
			this.internals.form.requestSubmit();
		}
	}

	#onReset = () => {
		this.internals.form?.reset();
	};

	#insertArrowIcon() {
		this.shadowRoot?.insertAdjacentHTML("beforeend", arrowIcon);
	}

	focus() {
		this.buttonElement.focus();
	}
}

customElements.define("cek-button", Button);
