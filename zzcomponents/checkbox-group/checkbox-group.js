export const checkboxGroupTemplate = /* html */ `
<fieldset>
	<legend>
		<label for="control" id="label" part="label"><slot name="label"></slot></label>
		<div id="help" part="help"><slot name="help"></slot></div>
		<div id="error" part="error"><slot name="error"></slot></div>
		</legend>
	<div part="container">
		<slot></slot>
	</div>
</fieldset>
`;

export const checkboxGroupStyles = /* css */ `
:host {
	display: flex;
	flex-direction: column;
	font-size: var(--cek-font-size-1);
	font-family: var(--cek-font-family);
	color: var(--cek-text-color-0);
}

fieldset {
	border: none;
	margin: 0;
	padding: 0;
	min-inline-size: 0;
	height: auto;
	display: contents;
}

legend {
	margin: 0;
    padding: 0;
}

#control {
  border: var(--cek-form-control-border);
  border-radius: var(--cek-border-radius);
  height: var(--cek-height-medium);
  font-size: inherit;
  color: inherit;
}

#control:focus {
	outline: var(--cek-focus-ring);
	outline-offset: var(--cek-focus-ring-offset);
}

#error {
	color: var(--cek-text-color-error);
}

:host([help]) #help,
:host([error]) #error {
	margin-block-start: var(--cek-space-2);
}

[part="container"] {
  display: flex;
  flex-direction: column;
  margin-block: var(--cek-space-4);
  gap: var(--cek-space-4);
}

:host([error])  #control {
	border-color: var(--cek-border-color-error);
}	

:host([error])  #control:focus {
	outline-color: var(--cek-border-color-error);
}
`;

export class CheckboxGroup extends HTMLElement {
	static formAssociated = true;
	static get observedAttributes() {
		return [
			"value",
			"error",
			"label",
			"help",
			"disabled",
			"autofocus",
			"required",
			"name",
			"min-selections",
			"max-selections",
			"exact-selections",
		];
	}

	#internals;
	#errorElement;
	#labelElement;
	#helpElement;
	#fieldsetElement;
	#slot;

	constructor() {
		super();
		this.pristine = true;
		this.#internals = this.attachInternals();
		if (!this.shadowRoot) {
			this.attachShadow({ mode: "open" });
			this.shadowRoot.innerHTML = `<style>${checkboxGroupStyles}</style>${checkboxGroupTemplate}`;
		}
		this.#errorElement = this.shadowRoot.getElementById("error");
		this.#labelElement = this.shadowRoot.getElementById("label");
		this.#helpElement = this.shadowRoot.getElementById("help");
		this.#fieldsetElement = this.shadowRoot.querySelector("fieldset");
		this.#slot = this.shadowRoot.querySelector("slot");
	}

	get value() {
		return this.checkedValues.join(",");
	}

	set value(newValue) {
		for (const checkbox of this.checkboxes) {
			const checked = newValue.split(",").includes(checkbox.value);
			if (checkbox.checked !== checked) {
				checkbox.checked = checked;
			}
		}

		this.#internals.setFormValue(this.value);
		this.#validate();
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

	get error() {
		return this.getAttribute("error");
	}

	set error(value) {
		value ? this.setAttribute("error", value) : this.removeAttribute("error");
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

	get checkedValues() {
		return Array.from(this.checkboxes)
			.filter((checkbox) => checkbox.checked)
			.map((checkbox) => checkbox.getAttribute("value") || "");
	}

	get checkboxes() {
		return this.querySelectorAll("cek-checkbox");
	}

	get required() {
		return this.hasAttribute("required");
	}

	set required(value) {
		if (value) {
			this.setAttribute("required", "");
		} else {
			this.removeAttribute("required");
		}
	}

	get minSelections() {
		return Number.parseInt(this.getAttribute("min-selections"), 10) || 0;
	}

	set minSelections(value) {
		if (value !== null && value !== undefined) {
			this.setAttribute("min-selections", value);
		} else {
			this.removeAttribute("min-selections");
		}
	}

	get maxSelections() {
		const attrValue = this.getAttribute("max-selections");
		return attrValue !== null
			? Number.parseInt(attrValue, 10)
			: Number.POSITIVE_INFINITY;
	}

	set maxSelections(value) {
		if (value !== null && value !== undefined) {
			this.setAttribute("max-selections", value);
		} else {
			this.removeAttribute("max-selections");
		}
	}

	get exactSelections() {
		const attrValue = this.getAttribute("exact-selections");
		return attrValue !== null ? Number.parseInt(attrValue, 10) : null;
	}

	set exactSelections(value) {
		if (value !== null && value !== undefined) {
			this.setAttribute("exact-selections", value);
		} else {
			this.removeAttribute("exact-selections");
		}
	}

	connectedCallback() {
		this.addEventListener("input", this.#handleInput);
		this.addEventListener("change", this.#handleChange);
		this.#slot.addEventListener("slotchange", (e) => {
			this.#validate();
		});

		if (this.form) {
			this.form.addEventListener("submit", this.#handleFormSubmit);
		}

		if (this.hasAttribute("autofocus")) {
			this.focus();
		}

		if (this.error) {
			this.#internals.setValidity({ customError: true }, this.error);
		}
	}

	disconnectedCallback() {
		this.removeEventListener("input", this.#handleInput);
		this.removeEventListener("change", this.#handleChange);

		if (this.#internals.form) {
			this.#internals.form.removeEventListener(
				"submit",
				this.#handleFormSubmit,
			);
		}
	}

	attributeChangedCallback(name, oldValue, newValue) {
		if (name === "value" && this.value !== newValue) {
			this.#internals.setFormValue(newValue);
		}
		if (name === "error" && newValue !== oldValue) {
			this.#errorElement.textContent = newValue;
		}
		if (name === "label") {
			this.#labelElement.textContent = newValue;
		}
		if (name === "help") {
			this.#helpElement.textContent = newValue;
		}
	}

	formDisabledCallback(disabled) {
		if (disabled) {
			this.#fieldsetElement.setAttribute("aria-disabled", "true");
		} else {
			this.#fieldsetElement.removeAttribute("aria-disabled");
		}

		for (const checkbox of this.checkboxes) {
			checkbox.disabled = disabled;
		}
	}

	formResetCallback() {
		for (const checkbox of this.checkboxes) {
			checkbox.checked = false;
		}
		// todo: check default value and for reset working
		this.#internals.setFormValue("");
		this.#internals.setValidity({});
		this.error = "";
	}

	reportValidity() {
		return this.#validate({ showError: true });
	}

	focus() {
		this.checkboxes[0]?.focus();
	}

	checkValidity() {
		this.#validate();
	}

	#validate = ({ showError = false } = {}) => {
		const selectedCount = this.checkedValues.length;
		this.error = "";

		const setValidityAndError = (validity, message) => {
			this.#internals.setValidity(validity, message);
			if (showError) {
				this.error = message;
			}
			return false;
		};

		if (
			this.exactSelections !== null &&
			selectedCount !== this.exactSelections
		) {
			return setValidityAndError(
				{ customError: true },
				`Select exactly ${this.exactSelections} options.`,
			);
		}

		if (selectedCount < this.minSelections) {
			return setValidityAndError(
				{ rangeUnderflow: true },
				`Select at least ${this.minSelections} options.`,
			);
		}

		if (selectedCount > this.maxSelections) {
			return setValidityAndError(
				{ rangeOverflow: true },
				`Select no more than ${this.maxSelections} options.`,
			);
		}

		if (this.required && selectedCount === 0) {
			return setValidityAndError(
				{ valueMissing: true },
				"Select at least one option.",
			);
		}

		this.#internals.setValidity({});
		return true;
	};

	#handleInput = (event) => {
		if (
			event.target.matches("cek-checkbox") &&
			this.#internals.form?.validateOnInputAfterSubmit &&
			this.#internals.form.submitted
		) {
			event.preventDefault();
			event.stopPropagation();
			this.pristine = false;
			this.#validate({ showError: true });
		}
		// TODO this.dispatchEvent(new event.constructor(event.type, event));
	};

	#handleChange = (event) => {
		if (event.target.matches("cek-checkbox") && this.validateOnChange) {
			event.preventDefault();
			event.stopPropagation();

			this.pristine = false;

			this.#internals.setFormValue(this.value);
			this.#validate({ showError: true });
		}
		// TODO this.dispatchEvent(new event.constructor(event.type, event));
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
}

customElements.define("cek-checkbox-group", CheckboxGroup);
