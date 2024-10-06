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
	font-size: var(--ui-font-size-1);
	font-family: var(--ui-font-family);
	color: var(--ui-text-color-0);
  
	#control {
	  border: var(--ui-form-control-border);
	  border-radius: var(--ui-border-radius);
	  height: var(--ui-form-control-height-medium);
	  font-size: inherit;
	  color: inherit;
  
	  &:focus {
		outline: var(--ui-focus-ring);
		outline-offset: var(--ui-focus-ring-offset);
	  }
	}

	#error {
		color: var(--ui-text-color-error);
	}
  
	&[help] #help,
	&[error] #error {
	  margin-block-start: var(--ui-space-2);
	}
}

:host([invalid]) {
  #control {
	border-color: var(--ui-border-color-error);
  
	&:focus {
	  outline-color: var(--ui-border-color-error);
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
		super();
		if (!this.shadowRoot) {
			this.attachShadow({ mode: "open" });
			this.shadowRoot.innerHTML = `<style>${inputStyles}</style>${inputTemplate}`;
		}
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

customElements.define("ui-input", Input);
