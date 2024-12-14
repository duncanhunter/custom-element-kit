export const buttonTemplate = (isLink) => {
	const tag = isLink ? "a" : "button";
	return /*html*/ `
		<${tag} id="button" part="button">
		<slot name="start"></slot>
		<div id="label" part="label"><slot></slot></div>
		<slot name="end"></slot>
		<svg id="loading-icon" part="loading-icon" width="24" height="24" viewBox="0 0 24 24" 
			xmlns="http://www.w3.org/2000/svg">
			<path d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z" opacity=".25"/>
			<path d="M10.14,1.16a11,11,0,0,0-9,8.92A1.59,1.59,0,0,0,2.46,12,1.52,1.52,0,0,0,4.11,10.7
			a8,8,0,0,1,6.66-6.61A1.42,1.42,0,0,0,12,2.69h0A1.57,1.57,0,0,0,10.14,1.16Z">
			<animateTransform attributeName="transform" type="rotate" dur="0.75s" 
				values="0 12 12;360 12 12" repeatCount="indefinite"/>
			</path>
		</svg>
		<svg id="arrow-icon" part="arrow-icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" 
			fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">  
			<path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
		</svg>
		</${tag}>
	`;
};

export const buttonStyles = /*css*/ `
:host {
  display: inline-block;
  font-family: var(--cek-font-family);
  line-height: var(--cek-line-height);
  box-sizing: border-box;
}

#button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
  background: transparent;
  border: none;
  padding: 0;
  margin: 0;
  font: inherit;
  color: inherit;
  cursor: pointer;
  box-sizing: border-box;
  text-decoration: none;
}

:host([variant]) #button {
  border-radius: var(--cek-border-radius);
  padding-inline: var(--cek-padding-inline);
}

:host([variant]) #button:hover {
  filter: brightness(85%);
}

:host([variant]) #button:focus {
  outline: var(--cek-focus-ring);
  outline-offset: var(--cek-focus-ring-offset);
}

:host([loading]) #button,
:host([disabled]) #button {
  cursor: not-allowed;
  pointer-events: none;
}

:host([loading]) #button {
  background-color: lightgray;
  color: rgba(0, 0, 0, 0.5);
}

:host([disabled][variant]) #button {
  background-color: #ccc;
  color: rgba(0, 0, 0, 0.5);
}

:host([size="small"]) #button {
  min-height: var(--cek-height-small);
  font-size: var(--cek-font-size-0);
}

:host(:not([size])) #button, 
:host([size="medium"]) #button {
  min-height: var(--cek-height-medium);
  font-size: var(--cek-font-size-1);
}

:host([size="large"]) #button {
  min-height: var(--cek-height-large);
  font-size: var(--cek-font-size-2);
}

:host([variant="primary"]) #button {
  background-color: var(--cek-color-primary-500);
  color: white;
}

:host([variant="ascent"]) #button {
  background-color: var(--cek-surface-color-3);
  color: var(--cek-text-color-1);
}

:host([variant="outline"]) #button {
  background-color: transparent;
  border: 1px solid var(--cek-border-color-2);
  color: var(--cek-text-color-1);
}

:host([variant="text"]) #button {
  background: transparent;
  color: var(--cek-text-color-1);
}

:host([variant="text"]) #button:hover {
  background-color: var(--cek-surface-color-2);
}

:host([variant="link"]) #button {
  background-color: transparent;
  color: var(--cek-color-primary-500);
  text-decoration: underline;
}

[name="end"]::slotted(*) {
  margin-inline-start: 0.5ch;
}

[name="start"]::slotted(*) {
  margin-inline-end: 0.5ch;
}

#loading-icon {
  position: absolute;
  display: none;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

:host([loading]) #loading-icon {
  display: block;
}

:host([icon-only]) #button {
  padding-inline: 0.8ch;
}

#arrow-icon {
  display: none;
  height: 1em;
  width: 1em;
  margin-inline-start: 0.5ch;
}

:host([arrow]) #arrow-icon {
  display: block;
}
`;

const buttonAttributes = [
	"required",
	"type",
	"disabled",
	"button-aria-label",
	"value",
	"href",
	"target",
];

export class Button extends HTMLElement {
	static formAssociated = true;
	static get observedAttributes() {
		return ["loading", ...buttonAttributes];
	}

	#internals;

	constructor() {
		super();
		this.#internals = this.attachInternals();
		if (!this.shadowRoot) {
			this.attachShadow({ mode: "open", delegatesFocus: true });
			this.shadowRoot.innerHTML = `<style>${buttonStyles}</style>${buttonTemplate(this.hasAttribute("href"))}`;
		}
	}

	get type() {
		return this.getAttribute("type") || "button";
	}

	set type(value) {
		this.setAttribute("type", value);
	}

	get loading() {
		return this.hasAttribute("loading");
	}

	set loading(value) {
		value ? this.setAttribute("loading", "") : this.removeAttribute("loading");
	}

	get disabled() {
		return this.hasAttribute("disabled");
	}

	set disabled(value) {
		value
			? this.setAttribute("disabled", "")
			: this.removeAttribute("disabled");
	}

	get #button() {
		return this.shadowRoot.getElementById("button");
	}

	connectedCallback() {
		this.#maybeTransformToAnchor();
		// For button only, since anchor doesn't need the form submission logic
		if (!this.hasAttribute("href")) {
			this.#button.addEventListener("click", this.#onClick);
		}
		this.#copyButtonAttributes();
	}

	disconnectedCallback() {
		this.#button?.removeEventListener("click", this.#onClick);
	}

	attributeChangedCallback(name, oldValue, newValue) {
		if (buttonAttributes.includes(name) || name === "loading") {
			this.#maybeTransformToAnchor();
			this.#copyButtonAttributes();
		}
	}

	formDisabledCallback(disabled) {
		this.disabled = disabled;
	}

	formResetCallback() {
		this.loading = false;
	}

	focus() {
		this.#button.focus();
	}

	#copyButtonAttributes() {
		const button = this.#button;
		const isLink = this.hasAttribute("href");

		if (this.hasAttribute("button-aria-label")) {
			button.setAttribute("aria-label", this.getAttribute("button-aria-label"));
		} else {
			button.removeAttribute("aria-label");
		}

		if (isLink) {
			button.removeAttribute("type");
			button.removeAttribute("disabled");

			const hrefValue = this.getAttribute("href");
			button.setAttribute("href", hrefValue);

			const targetValue = this.getAttribute("target") || "_self";
			button.setAttribute("target", targetValue);
		} else {
			button.removeAttribute("href");
			button.removeAttribute("target");

			button.setAttribute("type", this.getAttribute("type") || "button");

			if (this.disabled) {
				button.setAttribute("disabled", "");
			} else {
				button.removeAttribute("disabled");
			}
		}
	}

	#maybeTransformToAnchor() {
		const button = this.#button;
		const shouldBeLink = this.hasAttribute("href");

		if (shouldBeLink && button.tagName.toLowerCase() === "button") {
			const anchor = document.createElement("a");
			anchor.id = "button";
			anchor.part.add("button");

			while (button.firstChild) {
				anchor.appendChild(button.firstChild);
			}

			button.replaceWith(anchor);
		} else if (!shouldBeLink && button.tagName.toLowerCase() === "a") {
			const button = document.createElement("button");
			button.id = "button";
			button.part.add("button");

			while (button.firstChild) {
				button.appendChild(button.firstChild);
			}

			button.replaceWith(button);
			button.addEventListener("click", this.#onClick);
		}
	}

	#onClick = (event) => {
		if (this.disabled || this.loading) {
			event.preventDefault();
			return;
		}
		if (this.type === "submit") {
			this.#internals.form?.requestSubmit();
		} else if (this.type === "reset") {
			this.#internals.form?.reset();
		}
		this.dispatchEvent(
			new CustomEvent("click", { bubbles: true, composed: true }),
		);
	};
}

customElements.define("cek-button", Button);
