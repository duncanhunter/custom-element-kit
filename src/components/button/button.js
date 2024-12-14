export const buttonTemplate = /*html*/ `
  <button id="button" part="button">
    <slot name="start"></slot>
    <div id="label" part="label"><slot></slot></div>
    <slot name="end"></slot>
    <svg id="loading-icon" part="loading-icon" width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z" opacity=".25"/><path d="M10.14,1.16a11,11,0,0,0-9,8.92A1.59,1.59,0,0,0,2.46,12,1.52,1.52,0,0,0,4.11,10.7a8,8,0,0,1,6.66-6.61A1.42,1.42,0,0,0,12,2.69h0A1.57,1.57,0,0,0,10.14,1.16Z"><animateTransform attributeName="transform" type="rotate" dur="0.75s" values="0 12 12;360 12 12" repeatCount="indefinite"/></path></svg>
	<svg id="arrow-icon" part="arrow-icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">  <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" /></svg>
  </button>
`;

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

const controlAttributes = [
	"required",
	"type",
	"disabled",
	"button-aria-label",
	"value"
];

/**
 * A custom button element that can be used as a form-associated custom element.
 *
 * @element cek-button
 * @attribute {string} type - The type of the button. Defaults to `button`. Can be `button`, `submit`, or `reset`.
 * @attribute {boolean} disabled - Disables the button.
 * @attribute {boolean} loading - Shows a loading indicator when present.
 * @attribute {boolean} arrow - Displays an arrow icon when present.
 * @attribute {string} variant - Sets the styling variant of the button. Possible values are `primary`, `ascent`, `outline`, `text`, `link`.
 * @attribute {string} size - Sets the size of the button. Possible values are `small`, `medium`, `large`.
 * @attribute {boolean} icon-only - If present, styles the button for icon-only display.
 * @attribute {string} button-aria-label - ARIA label for accessibility.
 *
 * @slot default - The text content of the button.
 * @slot start - Content to display before the button's text (e.g., icons).
 * @slot end - Content to display after the button's text (e.g., icons).
 *
 * @csspart button - The native button element.
 * @csspart label - The label element inside the button.
 * @csspart loading-icon - The loading spinner displayed when `loading` is present.
 * @csspart arrow-icon - The arrow icon displayed when `arrow` is present.
 *
 * @event click - Dispatched when the button is activated.
 *
 * @method focus() - Moves keyboard focus to the button.
 */
export class Button extends HTMLElement {
	static get observedAttributes() {
		return ["loading", ...controlAttributes];
	}
	static formAssociated = true;

	#internals;

	constructor() {
		super();
		this.#internals = this.attachInternals();
		this.attachShadow({ mode: "open", delegatesFocus: true });
		this.shadowRoot.innerHTML = `<style>${buttonStyles}</style>${buttonTemplate}`;
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
		value ? this.setAttribute("disabled", "") : this.removeAttribute("disabled");
	}

	get #button() {
		return this.shadowRoot.getElementById("button");
	}

	connectedCallback() {
		this.#button.addEventListener("click", this.#onClick);
	}

	disconnectedCallback() {
		this.#button.removeEventListener("click", this.#onClick);
	}

	attributeChangedCallback(name, oldValue, newValue) {
		if (controlAttributes.includes(name)) {
			this.#copyControlAttributes();
		}
	}

	/**
	 * Form-associated callback when the form is disabled or enabled.
	 * @param {boolean} disabled Whether the form is disabled.
	 */
	formDisabledCallback(disabled) {
		if (disabled) {
			this.setAttribute("disabled", "");
		} else {
			this.removeAttribute("disabled");
		}
	}

	formResetCallback() {
		this.loading = false;
	}

	focus() {
		this.#button.focus();
	}

	#copyControlAttributes() {
		for (const attribute of controlAttributes) {
			const newAttribute =
				attribute === "button-aria-label" ? "aria-label" : attribute;
			if (this.hasAttribute(attribute)) {
				this.#button.setAttribute(newAttribute, this.getAttribute(attribute));
			} else if (attribute === "type") {
				this.#button.type = "text";
			} else {
				this.#button.removeAttribute(newAttribute);
			}
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
		this.dispatchEvent(new CustomEvent("click", { bubbles: true, composed: true }));
	};
}

customElements.define("cek-button", Button);