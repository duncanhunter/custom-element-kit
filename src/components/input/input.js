import { FormElement } from "../../core/form-element.js";

export const inputTemplate = /* html */ `
<label for="control" id="label" part="label"><slot name="label"></slot></label>
<div id="help" part="help"><slot name="help"></slot></div>
<div id="error" part="error"><slot name="error"></slot></div>
<input type="text" id="control" part="control" aria-describedby="help error"/>
`;

export const inputStyles = /* css */ `
:host {
	display: flex;
	flex-direction: column;
	font-size: var(--cek-font-size-1);
	font-family: var(--cek-font-family);
	color: var(--cek-text-color-0);
  
	#control {
	  border: var(--cek-form-control-border);
	  border-radius: var(--cek-border-radius);
	  height: var(--cek-form-control-height-medium);
	  font-size: inherit;
	  color: inherit;
  
	  &:focus {
		outline: var(--cek-focus-ring);
		outline-offset: var(--cek-focus-ring-offset);
	  }
	}

	#error {
		color: var(--cek-text-color-error);
	}
  
	&[help] #help,
	&[error] #error {
	  margin-block-start: var(--cek-space-2);
	}
}

:host([invalid]) {
  #control {
	border-color: var(--cek-border-color-error);
  
	&:focus {
	  outline-color: var(--cek-border-color-error);
	}
  }
}
`;

const inputControlAttributes = [
	"type",
	"value",
	"required",
	"name",
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
	"disabled",
	"inputmode",
	"enterkeyhint",
	"autocomplete",
	"autocapitalize",
	"readonly",
];

export class Input extends FormElement {
	static get observedAttributes() {
		return [...FormElement.observedAttributes, ...inputControlAttributes];
	}

	constructor() {
		super(inputStyles, inputTemplate);
	}

	get controlElement() {
		return this.shadowRoot.getElementById("control");
	}

	get controlAttributes() {
		return inputControlAttributes;
	}

	connectedCallback() {
		super.connectedCallback();
		this.controlElement.addEventListener("keyup", this.#handleControlKeyUp);
	}

	disconnectedCallback() {
		super.disconnectedCallback();
		this.controlElement.removeEventListener("keyup", this.#handleControlKeyUp);
	}

	#handleControlKeyUp = (event) => {
		if (event.key === "Enter" && this.form?.contains(this)) {
			event.preventDefault();
			this.form.requestSubmit();
		}
	};
}

customElements.define("cek-input", Input);
