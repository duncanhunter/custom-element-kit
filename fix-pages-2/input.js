const t='\n<style>\n:host {\n\tdisplay: block;\n\tfont-family: var(--cek-font-family);\n}\n\n#container {\n\tdisplay: flex;\n\talign-items: center;\n\tborder: var(--cek-form-control-border);\n\tborder-radius: var(--cek-border-radius);\n\tbox-sizing: border-box;\n}\n\n#container:has(input:focus) {\n\toutline: var(--cek-focus-ring);\n\toutline-offset: var(--cek-focus-ring-offset);\n}\n\n#control {\n\tborder: none;\n\tpadding: 0;\n\toutline: none;\n\tflex: 1;\n\tfont-size: inherit;\n\tfont-family: inherit;\n\tcolor: inherit;\n\tmargin-inline: var(--cek-space-2);\n\tbackground-color: var(--cek-surface-color-0);\n}\n\n:host([size="small"]) #container {\n\tmin-height: var(--cek-height-small);\n}\n\n:host([label][size="small"]) #label,\n:host([help][size="small"]) #help,\n:host([error][size="small"]) #error,\n:host([size="small"]) #control::placeholder {\n\tfont-size: var(--cek-font-size-0);\n}\n\n:host(:not([size])) #container,\n:host([size="medium"]) #container {\n\tmin-height: var(--cek-height-medium);\n}\n\n:host([label][size="medium"]) #label,\n:host([help][size="medium"]) #help,\n:host([error][size="medium"]) #error,\n:host([size="medium"]) #control::placeholder {\n\tfont-size: var(--cek-font-size-1);\n}\n\n:host([size="large"]) #container {\n\tmin-height: var(--cek-height-large);\n}\n\n:host([label][size="large"]) #label,\n:host([help][size="large"]) #help,\n:host([error][size="large"]) #error,\n:host([size="large"]) #control::placeholder {\n\tfont-size: var(--cek-font-size-2);\n}\n\n#help {\n\tcolor: var(--cek-text-color-3);\n}\n\n#error {\n\tcolor: var(--cek-text-color-error);\n}\n  \n:host([label]) #label,\n:host([help]) #help,\n:host([error]) #error {\n\tdisplay: block;\n\tmargin-block-end: var(--cek-space-2);\n}\n\n:host([error]) #container {\n\tborder-color: var(--cek-border-color-error);\n}\n  \n:host([error]) #container:has(input:focus) {\n\toutline-color: var(--cek-border-color-error);\n}\n\n[name="start"]::slotted(cek-icon),\n[name="end"]::slotted(cek-icon) {\n\tmargin: var(--cek-space-2);\n}\n[name="start"]::slotted(cek-button),\n[name="end"]::slotted(cek-button) {\n\tmargin: var(--cek-space-3);\n}\n\n[name="start"]::slotted(kbd), [name="end"]::slotted(kbd) {\n\tpadding: var(--cek-space-1) var(--cek-space-2);\n\tmargin: var(--cek-space-2);\n\tborder: var(--cek-border);\n\tborder-radius: var(--cek-border-radius);\n\tcolor: var(--cek-text-color-3);\n}\n\n[part="password-button"] [part="hide-password-icon"] {\n\t\tdisplay: none;\n}\n\n[part="password-button"], [part="clear-button"] {\n\tdisplay: none;\n\tborder: none;\n\tbackground: none;\n\tcursor: pointer;\n\tpadding: 0 var(--cek-space-1);\n\tmargin-inline: var(--cek-space-3);\n\n\t&:focus {\n\t\tborder-radius: var(--cek-border-radius);\n\t\toutline: var(--cek-focus-ring);\n\t\toutline-offset: var(--cek-focus-ring-offset);\n\t}\n\t\n\t&[part="hide-password-icon"] {\n\t\tdisplay: none;\n\t}\n\n\tsvg {\n\t\tfont-size: var(--cek-font-size-1);\n\t\theight: 1em;\n\t\twidth: 1em;\n\t}\n}\n</style>',e='\n<label for="control" id="label" part="label"><slot name="label"></slot></label>\n<div id="help" part="help"><slot name="help"></slot></div>\n<div id="error" part="error"><slot name="error"></slot></div>\n<div id="container" part="container">\n\t<slot name="start"></slot>\n\t<input part="control" id="control" type="text" aria-describedby="help error">\n\t<button part="password-button" aria-label="show password toggle">\n\t\t<svg part="hide-password-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">\n\t\t\t<path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />\n\t\t</svg>\n\t\t<svg part="show-password-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">\n\t\t\t<path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />\n\t\t\t<path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />\n\t\t</svg>\n\t</button>\n\t<button part="clear-button" aria-label="clear">\n\t\t<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">\n\t\t\t<path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />\n \t\t </svg>  \n\t</button>\n\t<slot name="end"></slot>\n</div>\n',n=["required","type","disabled","inputmode","placeholder","min","max","minlength","maxlength","pattern","step","autocomplete","autofocus","title","spellcheck","input-aria-label"];class r extends HTMLElement{static get observedAttributes(){return["input-aria-label","label","help","error",...n]}static formAssociated=!0;#t=null;constructor(){if(super(),this.#t=this.attachInternals(),!this.shadowRoot){this.attachShadow({mode:"open",delegatesFocus:!0}).innerHTML=`${t}${e}`}}get#e(){return this.shadowRoot.querySelector("input")}get#n(){return this.shadowRoot.querySelector("[part=password-button]")}get#r(){return this.shadowRoot.querySelector("[part=clear-button]")}get value(){return this.#e.value}set value(t){console.log("set value",t),this.#e.value!==t&&(this.#e.value=t),this.#t.setFormValue(t)}get name(){return this.getAttribute("name")}get validity(){return this.#e.validity}get validationMessage(){return this.#t.validationMessage}connectedCallback(){this.#e.value=this.getAttribute("value")||"",this.hasAttribute("password-button")&&(this.#n.style.display="flex"),this.#o(),this.#e.addEventListener("input",this.#i),this.#e.addEventListener("change",this.#s),this.#n.addEventListener("click",this.#a),this.#r.addEventListener("click",this.#l)}disconnectedCallback(){this.#e.removeEventListener("input",this.#i),this.#e.removeEventListener("change",this.#s),this.#t.form.removeEventListener("submit",this.#u),this.#e.removeEventListener("keyup",this.#h),this.#n.removeEventListener("click",this.#a),this.#r.removeEventListener("click",this.#l)}formAssociatedCallback(t){t&&(t.addEventListener("submit",this.#u),this.#e.addEventListener("keyup",this.#h))}formDisabledCallback(t){t?this.setAttribute("disabled",""):this.removeAttribute("disabled")}formResetCallback(){this.value=this.getAttribute("value")||"",this.removeAttribute("error"),this.#t.form.removeAttribute("submitted"),this.#t.setFormValue(""),this.#t.setValidity({}),this.#o(),this.#c()}attributeChangedCallback(t,e,r){n.includes(t)&&this.#d(),["label","help","error"].includes(t)&&(this.shadowRoot.getElementById(t).textContent=r)}focus(){this.controlElement.focus()}#d(){for(const t of n){const e="input-aria-label"===t?"aria-label":t;this.hasAttribute(t)?this.#e.setAttribute(e,this.getAttribute(t)):"type"===t?this.#e.type="text":"autocomplete"===t?this.#e.setAttribute("autocomplete","off"):this.#e.removeAttribute(e)}}#i=t=>{this.value=this.#e.value,this.#p(),this.#o(),this.dispatchEvent(new t.constructor(t.type,t))};#s=t=>{this.hasAttribute("validate-on-change")&&(this.#p(!0),this.dispatchEvent(new t.constructor(t.type,t)))};#u=t=>{this.#t.form.setAttribute("submitted",""),this.#p()||(t.preventDefault(),this.#t.form.querySelector(":invalid")===this&&this.#e.focus())};#h=t=>{"Enter"===t.key&&(t.preventDefault(),this.#t.form.requestSubmit())};#l=t=>{t.preventDefault(),t.stopImmediatePropagation(),this.#e.value="",this.#o(),setTimeout((()=>this.#e.focus()),200)};#a=()=>{"password"===this.#e.type?(this.#e.type="text",this.shadowRoot.querySelector("[part='hide-password-icon']").style.display="block",this.shadowRoot.querySelector("[part='show-password-icon']").style.display="none"):this.#c()};#c(){this.hasAttribute("password-button")&&(this.#e.type="password",this.shadowRoot.querySelector("[part='hide-password-icon']").style.display="none",this.shadowRoot.querySelector("[part='show-password-icon']").style.display="block")}#o(){this.value.length>0&&this.hasAttribute("clear-button")?this.#r.style.display="flex":this.#r.style.display="none"}#p(t=!1){this.#t.setValidity({}),this.removeAttribute("error");for(const e of["valueMissing","tooShort","tooLong","typeMismatch","rangeUnderflow","rangeOverflow","patternMismatch"])if(this.#e.validity[e]){const n=this.getAttribute(e)||e.replace(/([A-Z])/g," $1").replace(/^\w/,(t=>t.toUpperCase()));return this.#t.setValidity({[e]:!0},n,this.#e),(this.#t.form.hasAttribute("submitted")||t||this.hasAttribute("error"))&&this.setAttribute("error",n),!1}return!0}}customElements.define("cek-input",r);export{t as inputStyles,e as inputTemplate};
