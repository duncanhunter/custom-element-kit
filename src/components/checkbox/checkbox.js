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
	font-size: var(--ui-font-size-1);
	font-family: var(--ui-font-family);
	color: var(--ui-text-color-0);
  
	#control {
	  border: none;
	  outline: none;
	  accent-color: var(--ui-color-primary-300);
	  width: var(--ui-space-6);
	  height: var(--ui-space-6);
	}
  
	#error {
		color: var(--ui-text-color-error);
	}

	&[help] #help,
	&[error] #error {
	  margin-block-start: var(--ui-space-2);
	}
}

:host(:focus-within) {
  outline: var(--ui-focus-ring);
  outline-offset: var(--ui-focus-ring-offset);
}

:host([invalid]:focus-within) {
  outline-color: var(--ui-border-color-error);
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
		super();
		if (!this.shadowRoot) {
			this.attachShadow({ mode: "open" });
			this.shadowRoot.innerHTML = `<style>${checkboxStyles}</style>${checkboxTemplate}`;
		}
	}

	connectedCallback() {
		super.connectedCallback();
		if (this.closest("ui-checkbox-group")) {
			this.formDisabled = true;
		}
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
}

customElements.define("ui-checkbox", Checkbox);
