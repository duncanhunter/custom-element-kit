const styles = /* css */ `
<style>
:host {
	display: flex;
	flex-direction: column;
	font-size: var(--cek-font-size-1);
	font-family: var(--cek-font-family);
	color: var(--cek-text-color-0);
}

#container {
	display: flex;
	align-items: center;
	border: var(--cek-form-control-border);
	border-radius: var(--cek-border-radius);
}

#container:focus-within:not(:has(button:focus)) {
	outline: var(--cek-focus-ring);
	outline-offset: var(--cek-focus-ring-offset);
}

#control {
	border: none;
	outline: none;
	flex: 1;
	height: var(--cek-form-control-height-medium);
	font-size: inherit;
	font-family: inherit;
	color: inherit;
	margin-inline: var(--cek-space-2);
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
	margin-block-end: var(--cek-space-2);
}

:host([error]) #container {
	border-color: var(--cek-border-color-error);
}
  
:host([error]) #container:focus-within {
	outline-color: var(--cek-border-color-error);
}

[name="end"]::slotted(kbd) {
	padding: var(--cek-space-1) var(--cek-space-2);
	margin: var(--cek-space-2);
	border: var(--cek-border);
	border-radius: var(--cek-border-radius);
	color: var(--cek-text-color-2);
	font-size: var(--cek-font-size-00);
}

[part="password-button"], [part="clear-button"] {
	display: none;
	border: none;
	background: none;
	cursor: pointer;
	padding: 0 var(--cek-space-1);
	margin-inline: var(--cek-space-3);

	&:focus {
		border-radius: var(--cek-border-radius);
		outline: var(--cek-focus-ring);
		outline-offset: var(--cek-focus-ring-offset);
	}
	
	[part="hide-password-icon"] {
		display: none;
	}

	svg {
		font-size: var(--cek-font-size-1);
		height: 1em;
		width: 1em;
	}
}
</style>`;

const template = /* html */ `
<label for="control" id="label" part="label"><slot name="label"></slot></label>
<div id="help" part="help"><slot name="help"></slot></div>
<div id="error" part="error"><slot name="error"></slot></div>
<div id="container" part="container">
	<slot name="start"></slot>
	<input part="control" id="control" type="text" aria-describedby="help error">
	<button part="password-button" aria-label="show password toggle">
		<svg part="hide-password-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
			<path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
		</svg>
		<svg part="show-password-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
			<path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
			<path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
		</svg>
	</button>
	<button part="clear-button" aria-label="clear">
		<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
			<path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
 		 </svg>  
	</button>
	<slot name="end"></slot>
</div>
`;

/*
NEXT
inline icon and button and dropdown
sm, md,lg
*/

const controlAttributes = [
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
];

class Input extends HTMLElement {
	static get observedAttributes() {
		return ["input-aria-label", "label", "help", "error", ...controlAttributes];
	}
	static formAssociated = true;
	#internals = null;

	constructor() {
		super();
		this.#internals = this.attachInternals();

		if (!this.shadowRoot) {
			const root = this.attachShadow({ mode: "open", delegatesFocus: true });
			root.innerHTML = `${styles}${template}`;
		}
	}

	get #input() {
		return this.shadowRoot.querySelector("input");
	}

	get #passwordButton() {
		return this.shadowRoot.querySelector("[part=password-button]");
	}

	get #clearButton() {
		return this.shadowRoot.querySelector("[part=clear-button]");
	}

	get value() {
		return this.#input.value;
	}

	set value(value) {
		console.log("set value", value);
		if (this.#input.value !== value) {
			this.#input.value = value;
		}
		this.#internals.setFormValue(value);
	}

	get name() {
		return this.getAttribute("name");
	}

	get validity() {
		return this.#input.validity;
	}

	get validationMessage() {
		return this.#internals.validationMessage;
	}

	connectedCallback() {
		this.#input.value = this.getAttribute("value") || "";
		if (this.hasAttribute("password-button")) {
			this.#passwordButton.style.display = "flex";
		}
		this.#updateClearButtonVisibility();
		this.#input.addEventListener("input", this.#onInput);
		this.#input.addEventListener("change", this.#onChange);
		this.#passwordButton.addEventListener("click", this.#onPasswordButtonClick);
		this.#clearButton.addEventListener("click", this.#onClearButtonClick);
	}

	disconnectedCallback() {
		this.#input.removeEventListener("input", this.#onInput);
		this.#input.removeEventListener("change", this.#onChange);
		this.#internals.form.removeEventListener("submit", this.#onFormSubmit);
		this.#input.removeEventListener("keyup", this.#onKeyUp);
		this.#passwordButton.removeEventListener("click", this.#onPasswordButtonClick);
		this.#clearButton.removeEventListener("click", this.#onClearButtonClick);
	}

	formAssociatedCallback(form) {
		if (form) {
			form.addEventListener("submit", this.#onFormSubmit);
			this.#input.addEventListener("keyup", this.#onKeyUp);
		}
	}

	formDisabledCallback(disabled) {
		if (disabled) {
			this.setAttribute("disabled", "");
		} else {
			this.removeAttribute("disabled");
		}
	}

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
		if (controlAttributes.includes(name)) {
			this.#copyControlAttributes();
		}
		if (["label", "help", "error"].includes(name)) {
			this.shadowRoot.getElementById(name).textContent = newValue;
		}
	}

	focus() {
		this.controlElement.focus();
	}

	#copyControlAttributes() {
		for (const attribute of controlAttributes) {
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
		};
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
	}

	#onPasswordButtonClick = () => {
		if (this.#input.type === "password") {
			this.#input.type = "text";
			this.shadowRoot.querySelector("[part='hide-password-icon']").style.display = "block";
			this.shadowRoot.querySelector("[part='show-password-icon']").style.display = "none";
		} else {
			this.#resetPasswordButton();
		}
	}

	#resetPasswordButton() {
		if (this.hasAttribute("password-button")) {
			this.#input.type = "password";
			this.shadowRoot.querySelector("[part='hide-password-icon']").style.display = "none";
			this.shadowRoot.querySelector("[part='show-password-icon']").style.display = "block";
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
					this.getAttribute(state) ||
					state
						.replace(/([A-Z])/g, " $1")
						.replace(/^\w/, (c) => c.toUpperCase());
				this.#internals.setValidity(
					{ [state]: true },
					errorMessage,
					this.#input,
				);
				if (this.#internals.form.hasAttribute("submitted") || (showError || this.hasAttribute("error"))) {
					this.setAttribute("error", errorMessage);
				}
				return false;
			}
		}

		return true;
	}
}

customElements.define("cek-input", Input);
