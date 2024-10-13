import{FormElement as e}from"./form-element.js";const t='\n<label for="control" id="label" part="label"><slot name="label"></slot></label>\n<div id="help" part="help"><slot name="help"></slot></div>\n<div id="error" part="error"><slot name="error"></slot></div>\n<input type="text" id="control" part="control" aria-describedby="help error"/>\n',r="\n:host {\n\tdisplay: flex;\n\tflex-direction: column;\n\tfont-size: var(--cek-font-size-1);\n\tfont-family: var(--cek-font-family);\n\tcolor: var(--cek-text-color-0);\n}\n\n#control {\n\tborder: var(--cek-form-control-border);\n\tborder-radius: var(--cek-border-radius);\n\theight: var(--cek-form-control-height-medium);\n\tfont-size: inherit;\n\tcolor: inherit;\n}\n\n#control:focus {\n\t\toutline: var(--cek-focus-ring);\n\t\toutline-offset: var(--cek-focus-ring-offset);\n}\n\n#error {\n\tcolor: var(--cek-text-color-error);\n}\n  \n:host([help]) #help,\n:host([error]) #error {\n\tmargin-block-start: var(--cek-space-2);\n}\n\n:host([invalid]) #control {\n\tborder-color: var(--cek-border-color-error);\n}\n  \n:host([invalid]) #control:focus {\n\t  outline-color: var(--cek-border-color-error);\n}\n",o=["type","value","required","name","placeholder","min","max","minlength","maxlength","pattern","step","autocomplete","autofocus","title","spellcheck","disabled","inputmode","enterkeyhint","autocomplete","autocapitalize","readonly"];class n extends e{static get observedAttributes(){return[...e.observedAttributes,...o]}constructor(){super(r,t)}get controlElement(){return this.shadowRoot.getElementById("control")}get controlAttributes(){return o}connectedCallback(){super.connectedCallback(),this.controlElement.addEventListener("keyup",this.#e)}disconnectedCallback(){super.disconnectedCallback(),this.controlElement.removeEventListener("keyup",this.#e)}#e=e=>{"Enter"===e.key&&this.form?.contains(this)&&(e.preventDefault(),this.form.requestSubmit())}}customElements.define("cek-input",n);export{n as Input,r as inputStyles,t as inputTemplate};
