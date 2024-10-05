import { FormElement } from "../../core/form-element.js";

export const textareaTemplate = /* html */ `
<label for="control" id="label" part="label"><slot name="label"></slot></label>
<div id="help" part="help"><slot name="help"></slot></div>
<div id="error" part="error"><slot name="error"></slot></div>
<textarea id="control" part="control" aria-describedby="help error"></textarea>
`;

export const textareaStyles = /* css */ `
:host {
	display: flex;
	flex-direction: column;
	font-size: var(--ui-font-size-1);
	font-family: var(--ui-font-family);
	color: var(--ui-text-color-0);
	
	#control {
		border: var(--ui-form-control-border);
		border-radius: var(--ui-border-radius);
		font-size: inherit;
		font-family: inherit;
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

:host([resize="none"]) #control {
	resize: none;
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

const textareaControlAttributes = [
	"rows",
	"resize",
	"value",
	"required",
	"name",
	"placeholder",
	"minlength",
	"maxlength",
	"pattern",
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

export class TextArea extends FormElement {
	static get observedAttributes() {
		return [...FormElement.observedAttributes, ...textareaControlAttributes];
	}

	get template() {
		return textareaTemplate;
	}
	get styles() {
		return textareaStyles;
	}

	get controlElement() {
		return this.shadowRoot.getElementById("control");
	}

	get controlAttributes() {
		return textareaControlAttributes;
	}
}

customElements.define("ui-textarea", TextArea);
