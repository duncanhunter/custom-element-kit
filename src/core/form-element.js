export class FormElement extends HTMLElement {
	static formAssociated = true;

	#internals;
	#errorElement;
	#labelElement;
	#helpElement;
	#errorMessages = {
		valueMissing: `${this.label} is required`,
		tooShort: `${this.label} is too short`,
		tooLong: `${this.label} is too long`,
		typeMismatch: `${this.label} is invalid`,
		rangeUnderflow: `${this.label} is too low`,
		rangeOverflow: `${this.label} is too high`,
		patternMismatch: `${this.label} is invalid`,
	};

	constructor(styles, template) {
		super();
		this.pristine = true;
		this.#internals = this.attachInternals();
		if (!this.shadowRoot) {
			this.attachShadow({ mode: "open" });
			this.shadowRoot.innerHTML = `<style>${styles}</style>${template}`;
			// console.log("attached shadowRoot");
		} else {
			// console.log("shadowRoot already exists");
		}
		this.#errorElement = this.shadowRoot.getElementById("error");
		this.#labelElement = this.shadowRoot.getElementById("label");
		this.#helpElement = this.shadowRoot.getElementById("help");
	}

	get template() {
		throw new Error("template getter must be implemented");
	}

	get styles() {
		throw new Error("styles getter must be implemented");
	}

	static get observedAttributes() {
		return [
			"value",
			"error",
			"label",
			"help",
			"disabled",
			"title",
			"autofocus",
			"required",
			"name",
		];
	}

	get controlAttributes() {
		return [];
	}

	get controlElement() {
		throw new Error("controlElement getter must be implemented");
	}

	get value() {
		return this.controlElement.value;
	}

	set value(value) {
		this.controlElement.value = value;
		this.#internals.setFormValue(value);
	}

	get invalid() {
		return this.getAttribute("invalid");
	}

	set invalid(value) {
		value ? this.setAttribute("invalid", "") : this.removeAttribute("invalid");
	}

	get label() {
		return this.getAttribute("label");
	}

	set label(value) {
		value ? this.setAttribute("label", value) : this.removeAttribute("label");
	}

	get help() {
		return this.getAttribute("help");
	}

	set help(value) {
		value ? this.setAttribute("help", value) : this.removeAttribute("help");
	}

	get form() {
		return this.#internals.form;
	}

	get name() {
		return this.getAttribute("name");
	}

	get type() {
		return this.localName;
	}

	get validity() {
		return this.#internals.validity;
	}

	get validationMessage() {
		return this.#internals.validationMessage;
	}

	get willValidate() {
		return this.#internals.willValidate;
	}

	get validateOnChange() {
		return this.hasAttribute("validate-on-change");
	}

	set validateOnChange(value) {
		value
			? this.setAttribute("validate-on-change", "")
			: this.removeAttribute("validate-on-change");
	}

	get validateOnInputAfterSubmitted() {
		return this.hasAttribute("validate-on-input-after-submitted");
	}

	set validateOnInputAfterSubmitted(value) {
		value
			? this.setAttribute("validate-on-input-after-submitted", "")
			: this.removeAttribute("validate-on-input-after-submitted");
	}

	set formDisabled(value) {
		this.#internals.formDisabled = value;
	}

	connectedCallback() {
		this.#copyHostAttributesToControl();
		this.controlElement.addEventListener("input", this.#handleControlInput);
		this.controlElement.addEventListener("change", this.#handleControlChange);
		this.controlElement.addEventListener("keyup", this.handleControlKeyUp);

		if (this.#internals.form) {
			this.#internals.form.addEventListener("submit", this.#handleFormSubmit);
		}

		const error = this.getAttribute("error");
		if (error) {
			this.#setCustomError(error);
		} else {
			this.#validate();
		}

		if (this.hasAttribute("autofocus")) {
			this.focus();
		}
	}

	disconnectedCallback() {
		this.controlElement.removeEventListener("input", this.#handleControlInput);
		this.controlElement.removeEventListener(
			"change",
			this.#handleControlChange,
		);
		this.controlElement.removeEventListener("keyup", this.handleControlKeyUp);
		if (this.#internals.form) {
			this.#internals.form.removeEventListener(
				"submit",
				this.#handleFormSubmit,
			);
		}
	}

	attributeChangedCallback(name, oldValue, newValue) {
		if (name === "value" && this.controlElement.value !== newValue) {
			this.controlElement.value = newValue;
			this.#internals.setFormValue(newValue);
		}
		if (this.controlAttributes.includes(name)) {
			this.#copyHostAttributesToControl();
		}
		if (name === "error" && newValue !== oldValue) {
			this.error = newValue;
			this.#setCustomError(this.error);
		}
		if (name === "label") {
			this.#labelElement.textContent = newValue;
		}
		if (name === "help") {
			this.#helpElement.textContent = newValue;
		}
	}

	formResetCallback() {
		this.controlElement.value = this.getAttribute("value") ?? "";
		this.#clearError();
	}

	formDisabledCallback(disabled) {
		if (disabled) {
			this.controlElement.setAttribute("disabled", "true");
			this.setAttribute("aria-disabled", "true");
		} else {
			this.controlElement.removeAttribute("disabled");
			this.removeAttribute("aria-disabled");
		}
	}

	checkValidity() {
		return this.#internals.checkValidity();
	}

	reportValidity() {
		return this.#internals.reportValidity();
	}

	focus() {
		this.controlElement.focus();
	}

	#handleControlChange = (event) => {
		if (this.validateOnChange) {
			this.pristine = false;
			this.#validate({ showError: true });
		}
		this.dispatchEvent(new event.constructor(event.type, event));
	};

	#handleControlInput = (event) => {
		this.value = this.controlElement.value;
		if (
			this.#internals.form?.validateOnInputAfterSubmit &&
			this.#internals.form.submitted
		) {
			this.pristine = false;
			this.#validate({ showError: true });
		}
		this.dispatchEvent(new event.constructor(event.type, event));
	};

	#handleFormSubmit = (event) => {
		this.#validate({ showError: true });
		if (this.error) {
			event.preventDefault();
			for (const control of this.#internals.form.elements) {
				if (!control.validity.valid) {
					if (control === this) {
						this.#internals.form.submitted = true;
						control.focus();
					}
					break;
				}
			}
		}
	};

	#copyHostAttributesToControl() {
		const attributes = this.controlAttributes || [];
		for (const attribute of attributes) {
			if (this.hasAttribute(attribute)) {
				if (attribute === "control-aria-label") {
					this.controlElement.setAttribute(
						"aria-label",
						this.getAttribute(attribute),
					);
				} else {
					this.controlElement.setAttribute(
						attribute,
						this.getAttribute(attribute),
					);
				}
			}
		}
	}

	#setCustomError(error) {
		if (error) {
			this.invalid = true;
			this.#errorElement.textContent = error ?? "";
			this.controlElement.setCustomValidity(error);
			this.#internals.setValidity(
				this.controlElement.validity,
				error ?? "",
				this.controlElement,
			);
		}
	}

	#clearError() {
		this.controlElement.setCustomValidity("");
		this.removeAttribute("error");
		this.error = "";
		this.#errorElement.textContent = "";
		this.invalid = false;
		this.#internals.setValidity({});
	}

	#validate({ showError = false } = {}) {
		this.#clearError();
		if (!this.controlElement.validity.valid) {
			let error = "";
			for (const state in this.controlElement.validity) {
				if (this.controlElement.validity[state]) {
					error = this.hasAttribute(state.toString())
						? this.getAttribute(state.toString())
						: this.#errorMessages[state.toString()];
				}
			}
			this.#internals.setValidity(
				this.controlElement.validity,
				error,
				this.controlElement,
			);
			if (showError) {
				this.error = error;
				this.#errorElement.textContent = error;
				this.invalid = true;
				this.dispatchEvent(
					new CustomEvent("invalid", {
						bubbles: true,
						cancelable: true,
						detail: { error },
					}),
				);
			}
		}
	}
}
