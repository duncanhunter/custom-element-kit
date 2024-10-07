import { FormElement } from "../../core/form-element.js";

export const checkboxTemplate = /* html */ `
<input type="checkbox" id="control" part="control" aria-describedby="help error"/>
<div>
	<label for="control" id="label" part="label"><slot name="label"></slot></label>
	<div id="help" part="help"><slot name="help"></slot></div>
	<div id="error" part="error"><slot name="error"></slot></div>
</div>
`;

export const checkboxStyles = /* css */ `
:host {
	display: flex;
	align-items: flex-start;
	font-size: var(--cek-font-size-1);
	font-family: var(--cek-font-family);
	color: var(--cek-text-color-0);
  
	#control {
	  border: none;
	  outline: none;
	  accent-color: var(--cek-color-primary-300);
	  width: var(--cek-space-6);
	  height: var(--cek-space-6);
	}
  
	#error {
		color: var(--cek-text-color-error);
	}

	&[help] #help,
	&[error] #error {
	  margin-block-start: var(--cek-space-2);
	}
}

:host(:focus-within) {
  outline: var(--cek-focus-ring);
  outline-offset: var(--cek-focus-ring-offset);
}

:host([invalid]:focus-within) {
  outline-color: var(--cek-border-color-error);
}
`;

const checkboxControlAttributes = [
	"value",
	"required",
	"name",
	"autofocus",
	"title",
	"disabled",
	"readonly",
	"control-aria-label",
];

export class Checkbox extends FormElement {
	static get observedAttributes() {
		return [...FormElement.observedAttributes, ...checkboxControlAttributes];
	}

	constructor() {
		super(checkboxStyles, checkboxTemplate);
	}

	get controlElement() {
		return this.shadowRoot.getElementById("control");
	}

	get controlAttributes() {
		return checkboxControlAttributes;
	}

	get checked() {
		return this.controlElement.checked;
	}

	set checked(value) {
		this.controlElement.checked = value;
	}

	connectedCallback() {
		super.connectedCallback();
		if (this.closest("cek-checkbox-group")) {
			this.formDisabled = true;
		}
	}
}

customElements.define("cek-checkbox", Checkbox);
