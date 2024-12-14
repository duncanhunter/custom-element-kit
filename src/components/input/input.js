/**
 * A custom input element that can be used as a form-associated custom element.
 *
 * @element cek-input
 * @attribute {string} name - The name of the control, used for form submission.
 * @attribute {string} label - Label text for the input.
 * @attribute {string} help - Help text or description for the input.
 * @attribute {string} error - Error message displayed when the input is invalid.
 * @attribute {string} required - Marks the input as required.
 * @attribute {string} type - The type of the input. Defaults to `text`. Can be `text`, `password`, `number` etc.
 * @attribute {boolean} disabled - Disables the input.
 * @attribute {string} inputmode - A hint to the browser for which keyboard to display.
 * @attribute {string} placeholder - The placeholder text.
 * @attribute {string} min - Minimum value (used for date, number inputs).
 * @attribute {string} max - Maximum value (used for date, number inputs).
 * @attribute {number} minlength - Minimum length of the input value.
 * @attribute {number} maxlength - Maximum length of the input value.
 * @attribute {string} pattern - A regex pattern the input's value must match.
 * @attribute {string|number} step - Step value for numeric or date-time inputs.
 * @attribute {string} autocomplete - Autocomplete attribute for the input.
 * @attribute {boolean} autofocus - Focuses the input automatically when the page loads.
 * @attribute {string} title - Advisory information for the input.
 * @attribute {boolean} spellcheck - Whether spell checking is enabled for the input.
 * @attribute {string} input-aria-label - Aria-label attribute for the input control.
 * @attribute {boolean} password-button - If present, toggles a show/hide password button.
 * @attribute {boolean} clear-button - If present, shows a clear button when the input has a value.
 * @attribute {boolean} validate-on-change - If present, the input is validated on change events.
 * @attribute {string} value-missing-message - Custom message for value missing validation.
 * @attribute {string} too-short-message - Custom message for too short validation.
 * @attribute {string} too-long-message - Custom message for too long validation.
 * @attribute {string} type-mismatch-message - Custom message for type mismatch validation.
 * @attribute {string} range-underflow-message - Custom message for range underflow validation.
 * @attribute {string} range-overflow-message - Custom message for range overflow validation.
 * @attribute {string} pattern-mismatch-message - Custom message for pattern mismatch validation.
 *
 * @slot label - The label text node.
 * @slot help - The help or description text node.
 * @slot error - The error message text node.
 * @slot start - Content to display before the input (e.g., icons).
 * @slot end - Content to display after the input (e.g., icons).
 */

const inputAttributes = [
	"required",
	"type",
	"disabled",
	"inputmode",
	"placeholder",
	"min",
	"max",
	"minlength",
	"maxlength",
	"pattern",
	"step",
	"autocomplete",
	"autofocus",
	"title",
	"spellcheck",
	"input-aria-label",
	"value",
];

export const inputTemplate = (attributes = {}) => {
	console.log("inputTemplate", attributes);
	const inputAtts = inputAttributes
		.filter((attr) => attributes[attr] !== undefined)
		.map(
			(attr) =>
				`${attr === "input-aria-label" ? "aria-label" : attr}="${attributes[attr]}"`,
		)
		.join(" ");
	const labelText = attributes.label ?? "";
	const helpText = attributes.help ?? "";
	const errorText = attributes.error ?? "";
	const showPasswordButton = attributes["password-button"] !== undefined;
	const showClearButton =
		attributes["clear-button"] !== undefined &&
		(attributes.value ?? "").length > 0;
	const passwordButtonStyle = showPasswordButton
		? "display:flex;"
		: "display:none;";
	const clearButtonStyle = showClearButton ? "display:flex;" : "display:none;";

	return /*html*/ `
		<label for="input" id="label" part="label">
			<slot name="label">${labelText}</slot>
		</label>
		<div id="help" part="help">
			<slot name="help">${helpText}</slot>
		</div>
		<div id="error" part="error">
			<slot name="error">${errorText}</slot>
		</div>
		<div id="container" part="container">
			<slot name="start"></slot>
			<input part="input" id="input" ${inputAtts} aria-describedby="help error">
			<button part="password-button" id="password-button" aria-label="show password toggle" style="${passwordButtonStyle}">
				<svg part="hide-password-icon" id="hide-password-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
				</svg>
				<svg part="show-password-icon" id="show-password-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
					<path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
				</svg>
			</button>
			<button part="clear-button" id="clear-button" aria-label="clear" style="${clearButtonStyle}">
				<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
				</svg>
			</button>
			<slot name="end"></slot>
		</div>
		`;
};

export const inputStyles = /* css */ `
:host {
	display: block;
	font-family: var(--cek-font-family);
}

#container {
	display: flex;
	align-items: stretch;
	border: var(--cek-form-control-border);
	border-radius: var(--cek-border-radius);
	box-sizing: border-box;
}

#container:has(#input:focus) {
	outline: var(--cek-focus-ring);
	outline-offset: var(--cek-focus-ring-offset);
}

#input {
	border: none;
	padding: 0;
	outline: none;
	flex: 1;
	font-size: inherit;
	font-family: inherit;
	color: inherit;
	margin-inline: var(--cek-space-2);
	background-color: var(--cek-surface-color-0);
}

:host([size="small"]) #container {
	min-height: var(--cek-height-small);
}

:host([label][size="small"]) #label,
:host([help][size="small"]) #help,
:host([error][size="small"]) #error,
:host([size="small"]) #input::placeholder {
	font-size: var(--cek-font-size-0);
}

:host(:not([size])) #container,
:host([size="medium"]) #container {
	min-height: var(--cek-height-medium);
}

:host([label][size="medium"]) #label,
:host([help][size="medium"]) #help,
:host([error][size="medium"]) #error,
:host([size="medium"]) #input::placeholder {
	font-size: var(--cek-font-size-1);
}

:host([size="large"]) #container {
	min-height: var(--cek-height-large);
}

:host([label][size="large"]) #label,
:host([help][size="large"]) #help,
:host([error][size="large"]) #error,
:host([size="large"]) #input::placeholder {
	font-size: var(--cek-font-size-2);
}

#help {
	color: var(--cek-text-color-3);
}

#error {
	color: var(--cek-text-color-error);
}
  
:host([label]) #label,
:host([help]) #help,
:host([error]) #error {
	display: block;
	margin-block-end: var(--cek-space-2);
}

:host([error]) #container {
	border-color: var(--cek-border-color-error);
}
  
:host([error]) #container:has(#input:focus) {
	outline-color: var(--cek-border-color-error);
}

[name="start"]::slotted(cek-icon),
[name="end"]::slotted(cek-icon) {
	margin: var(--cek-space-2);
	align-self: center;
}
[name="start"]::slotted(cek-button),
[name="end"]::slotted(cek-button) {
	margin: var(--cek-space-3);
	align-self: center;
}

[name="start"]::slotted(kbd), [name="end"]::slotted(kbd) {
	padding: var(--cek-space-1) var(--cek-space-2);
	margin: var(--cek-space-2);
	border: var(--cek-border);
	border-radius: var(--cek-border-radius);
	color: var(--cek-text-color-2);
	align-self: center;
}

#password-button #hide-password-icon {
	display: none;
}

#password-button, #clear-button {
	display: none;
	border: none;
	background: none;
	cursor: pointer;
	padding: 0 var(--cek-space-1);
	margin-inline: var(--cek-space-3);
	align-self: center;
}

#password-button:focus, #clear-button:focus {
	border-radius: var(--cek-border-radius);
	outline: var(--cek-focus-ring);
	outline-offset: var(--cek-focus-ring-offset);
}

#password-button #hide-password-icon {
	display: none;
}

#password-button svg, #clear-button svg {
	font-size: var(--cek-font-size-1);
	color: var(--cek-text-color-1);
	height: 1em;
	width: 1em;
}`;

class Input extends HTMLElement {
	static get observedAttributes() {
		return ["label", "help", "error", ...inputAttributes];
	}
	static formAssociated = true;

	#internals = null;

	constructor() {
		super();
		this.#internals = this.attachInternals();

		if (!this.shadowRoot) {
			this.attachShadow({ mode: "open", delegatesFocus: true });
			this.shadowRoot.innerHTML = `<style>${inputStyles}</style>${inputTemplate(this.#attributes)}`;
		}
	}

	/**
	 * The current value of the input.
	 * @type {string}
	 */
	get value() {
		return this.#input.value;
	}

	set value(value) {
		if (this.#input.value !== value) {
			this.#input.value = value;
		}
		this.#internals.setFormValue(value);
	}

	/**
	 * The name of the input, used during form submission.
	 * @type {string|null}
	 */
	get name() {
		return this.getAttribute("name");
	}

	/**
	 * The validity state of the input.
	 * @type {ValidityState}
	 * @readonly
	 */
	get validity() {
		return this.#input.validity;
	}

	/**
	 * The validation message of the input if invalid.
	 * @type {string}
	 * @readonly
	 */
	get validationMessage() {
		return this.#internals.validationMessage;
	}

	get #input() {
		return this.shadowRoot.getElementById("input");
	}

	get #passwordButton() {
		return this.shadowRoot.getElementById("password-button");
	}

	get #clearButton() {
		return this.shadowRoot.getElementById("clear-button");
	}

	get #attributes() {
		const attributes = {};
		for (const { name, value } of this.attributes) {
			attributes[name] = value;
		}
		return attributes;
	}

	connectedCallback() {
		this.#attachEvents();
	}

	disconnectedCallback() {
		this.#detachEvents();
	}

	/**
	 * Form-associated callback when the element is associated with a form.
	 * @param {HTMLFormElement|null} form The form element or null if disassociated.
	 */
	formAssociatedCallback(form) {
		if (form) {
			form.addEventListener("submit", this.#onFormSubmit);
			this.#input.addEventListener("keyup", this.#onKeyUp);
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

	/**
	 * Form-associated callback when the form is reset.
	 */
	formResetCallback() {
		this.value = this.getAttribute("value") || "";
		this.removeAttribute("error");
		this.#internals.form.removeAttribute("submitted");
		this.#internals.setFormValue("");
		this.#internals.setValidity({});
		this.#updateClearButtonVisibility();
		this.#resetPasswordButton();
	}

	attributeChangedCallback(name, _oldValue, newValue) {
		if (inputAttributes.includes(name)) {
			this.#copyInputAttributes();
		}
		if (["label", "help", "error"].includes(name)) {
			this.shadowRoot.getElementById(name).textContent = newValue;
		}
	}

	/**
	 * Sets focus to the input control.
	 */
	focus() {
		this.#input.focus();
	}

	#attachEvents() {
		this.#input.addEventListener("input", this.#onInput);
		this.#input.addEventListener("change", this.#onChange);
		this.#passwordButton.addEventListener("click", this.#onPasswordButtonClick);
		this.#clearButton.addEventListener("click", this.#onClearButtonClick);
	}

	#detachEvents() {
		this.#input.removeEventListener("input", this.#onInput);
		this.#input.removeEventListener("change", this.#onChange);
		this.#internals.form?.removeEventListener("submit", this.#onFormSubmit);
		this.#input.removeEventListener("keyup", this.#onKeyUp);
		this.#passwordButton.removeEventListener(
			"click",
			this.#onPasswordButtonClick,
		);
		this.#clearButton.removeEventListener("click", this.#onClearButtonClick);
	}

	#copyInputAttributes() {
		for (const attribute of inputAttributes) {
			const newAttribute =
				attribute === "input-aria-label" ? "aria-label" : attribute;
			if (this.hasAttribute(attribute)) {
				this.#input.setAttribute(newAttribute, this.getAttribute(attribute));
			} else if (attribute === "type") {
				this.#input.type = "text";
			} else if (attribute === "autocomplete") {
				this.#input.setAttribute("autocomplete", "off");
			} else {
				this.#input.removeAttribute(newAttribute);
			}
		}
	}

	#onInput = (event) => {
		this.value = this.#input.value;
		this.#validate();
		this.#updateClearButtonVisibility();
		this.dispatchEvent(new event.constructor(event.type, event));
	};

	#onChange = (event) => {
		if (this.hasAttribute("validate-on-change")) {
			this.#validate(true);
			this.dispatchEvent(new event.constructor(event.type, event));
		}
	};

	#onFormSubmit = (event) => {
		this.#internals.form.setAttribute("submitted", "");
		if (!this.#validate()) {
			event.preventDefault();
			if (this.#internals.form.querySelector(":invalid") === this) {
				this.#input.focus();
			}
		}
	};

	#onKeyUp = (event) => {
		if (event.key === "Enter") {
			event.preventDefault();
			this.#internals.form.requestSubmit();
		}
	};

	#onClearButtonClick = (event) => {
		event.preventDefault();
		event.stopImmediatePropagation();
		this.#input.value = "";
		this.#updateClearButtonVisibility();
		setTimeout(() => this.#input.focus(), 200);
	};

	#onPasswordButtonClick = () => {
		if (this.#input.type === "password") {
			this.#input.type = "text";
			this.shadowRoot.getElementById("hide-password-icon").style.display =
				"block";
			this.shadowRoot.getElementById("show-password-icon").style.display =
				"none";
		} else {
			this.#resetPasswordButton();
		}
	};

	#resetPasswordButton() {
		if (this.hasAttribute("password-button")) {
			this.#input.type = "password";
			this.shadowRoot.getElementById("hide-password-icon").style.display =
				"none";
			this.shadowRoot.getElementById("show-password-icon").style.display =
				"block";
		}
	}

	#updateClearButtonVisibility() {
		if (this.value.length > 0 && this.hasAttribute("clear-button")) {
			this.#clearButton.style.display = "flex";
		} else {
			this.#clearButton.style.display = "none";
		}
	}

	#validate(showError = false) {
		this.#internals.setValidity({});
		this.removeAttribute("error");

		for (const state of [
			"valueMissing",
			"tooShort",
			"tooLong",
			"typeMismatch",
			"rangeUnderflow",
			"rangeOverflow",
			"patternMismatch",
		]) {
			if (this.#input.validity[state]) {
				const errorMessage =
					this.getAttribute(
						`${state.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase()}-message`,
					) ||
					state
						.replace(/([A-Z])/g, " $1")
						.replace(/^\w/, (c) => c.toUpperCase());
				this.#internals.setValidity(
					{ [state]: true },
					errorMessage,
					this.#input,
				);
				if (
					this.#internals.form?.hasAttribute("submitted") ||
					showError ||
					this.hasAttribute("error")
				) {
					this.setAttribute("error", errorMessage);
				}
				return false;
			}
		}

		return true;
	}
}

customElements.define("cek-input", Input);
