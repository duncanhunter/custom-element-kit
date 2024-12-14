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
	font-size: var(--cek-font-size-1);
	font-family: var(--cek-font-family);
	color: var(--cek-text-color-0);
}
	
#control {
	border: var(--cek-form-control-border);
	border-radius: var(--cek-border-radius);
	font-size: inherit;
	font-family: inherit;
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

:host([error]) #control {
border-color: var(--cek-border-color-error);
}

:host([error]) #control:focus {
  outline-color: var(--cek-border-color-error);
}

:host([resize="none"]) #control {
	resize: none;
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

	constructor() {
		super(textareaStyles, textareaTemplate);
	}

	get controlElement() {
		return this.shadowRoot.getElementById("control");
	}

	get controlAttributes() {
		return textareaControlAttributes;
	}
}

customElements.define("cek-textarea", TextArea);
