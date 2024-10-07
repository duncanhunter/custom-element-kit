import{FormElement as e}from"./form-element.js";const t='\n<input type="checkbox" id="control" part="control" aria-describedby="help error"/>\n<div>\n\t<label for="control" id="label" part="label"><slot name="label"></slot></label>\n\t<div id="help" part="help"><slot name="help"></slot></div>\n\t<div id="error" part="error"><slot name="error"></slot></div>\n</div>\n',r="\n:host {\n\tdisplay: flex;\n\talign-items: flex-start;\n\tfont-size: var(--cek-font-size-1);\n\tfont-family: var(--cek-font-family);\n\tcolor: var(--cek-text-color-0);\n  \n\t#control {\n\t  border: none;\n\t  outline: none;\n\t  accent-color: var(--cek-color-primary-300);\n\t  width: var(--cek-space-6);\n\t  height: var(--cek-space-6);\n\t}\n  \n\t#error {\n\t\tcolor: var(--cek-text-color-error);\n\t}\n\n\t&[help] #help,\n\t&[error] #error {\n\t  margin-block-start: var(--cek-space-2);\n\t}\n}\n\n:host(:focus-within) {\n  outline: var(--cek-focus-ring);\n  outline-offset: var(--cek-focus-ring-offset);\n}\n\n:host([invalid]:focus-within) {\n  outline-color: var(--cek-border-color-error);\n}\n",o=["value","required","name","autofocus","title","disabled","readonly","control-aria-label"];class n extends e{static get observedAttributes(){return[...e.observedAttributes,...o]}constructor(){super(r,t)}get controlElement(){return this.shadowRoot.getElementById("control")}get controlAttributes(){return o}get checked(){return this.controlElement.checked}set checked(e){this.controlElement.checked=e}connectedCallback(){super.connectedCallback(),this.closest("cek-checkbox-group")&&(this.formDisabled=!0)}}customElements.define("cek-checkbox",n);export{n as Checkbox,r as checkboxStyles,t as checkboxTemplate};