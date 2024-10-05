class t extends HTMLElement{static formAssociated=!0;#t;#e;#i;#r;#s={valueMissing:`${this.label} is required`,tooShort:`${this.label} is too short`,tooLong:`${this.label} is too long`,typeMismatch:`${this.label} is invalid`,rangeUnderflow:`${this.label} is too low`,rangeOverflow:`${this.label} is too high`,patternMismatch:`${this.label} is invalid`};constructor(){super(),this.pristine=!0,this.#t=this.attachInternals(),this.shadowRoot||(this.attachShadow({mode:"open"}),this.shadowRoot.innerHTML=`<style>${this.styles}</style>${this.template}`),this.#e=this.shadowRoot.getElementById("error"),this.#i=this.shadowRoot.getElementById("label"),this.#r=this.shadowRoot.getElementById("help")}get template(){throw new Error("template getter must be implemented")}get styles(){throw new Error("styles getter must be implemented")}static get observedAttributes(){return["value","error","label","help","disabled","title","autofocus","required","name"]}get controlAttributes(){return[]}get controlElement(){throw new Error("controlElement getter must be implemented")}get value(){return this.controlElement.value}set value(t){this.controlElement.value=t,this.#t.setFormValue(t)}get invalid(){return this.getAttribute("invalid")}set invalid(t){t?this.setAttribute("invalid",""):this.removeAttribute("invalid")}get label(){return this.getAttribute("label")}set label(t){t?this.setAttribute("label",t):this.removeAttribute("label")}get help(){return this.getAttribute("help")}set help(t){t?this.setAttribute("help",t):this.removeAttribute("help")}get form(){return this.#t.form}get name(){return this.getAttribute("name")}get type(){return this.localName}get validity(){return this.#t.validity}get validationMessage(){return this.#t.validationMessage}get willValidate(){return this.#t.willValidate}get validateOnChange(){return this.hasAttribute("validate-on-change")}set validateOnChange(t){t?this.setAttribute("validate-on-change",""):this.removeAttribute("validate-on-change")}get validateOnInputAfterSubmitted(){return this.hasAttribute("validate-on-input-after-submitted")}set validateOnInputAfterSubmitted(t){t?this.setAttribute("validate-on-input-after-submitted",""):this.removeAttribute("validate-on-input-after-submitted")}set formDisabled(t){this.#t.formDisabled=t}connectedCallback(){this.#l(),this.controlElement.addEventListener("input",this.#n),this.controlElement.addEventListener("change",this.#o),this.controlElement.addEventListener("keyup",this.handleControlKeyUp),this.#t.form&&this.#t.form.addEventListener("submit",this.#a);const t=this.getAttribute("error");t?this.#h(t):this.#u(),this.hasAttribute("autofocus")&&this.focus()}disconnectedCallback(){this.controlElement.removeEventListener("input",this.#n),this.controlElement.removeEventListener("change",this.#o),this.controlElement.removeEventListener("keyup",this.handleControlKeyUp),this.#t.form&&this.#t.form.removeEventListener("submit",this.#a)}attributeChangedCallback(t,e,i){"value"===t&&this.controlElement.value!==i&&(this.controlElement.value=i,this.#t.setFormValue(i)),this.controlAttributes.includes(t)&&this.#l(),"error"===t&&i!==e&&(this.error=i,this.#h(this.error)),"label"===t&&(this.#i.textContent=i),"help"===t&&(this.#r.textContent=i)}formResetCallback(){this.controlElement.value=this.getAttribute("value")??"",this.#d()}formDisabledCallback(t){t?(this.controlElement.setAttribute("disabled","true"),this.setAttribute("aria-disabled","true")):(this.controlElement.removeAttribute("disabled"),this.removeAttribute("aria-disabled"))}checkValidity(){return this.#t.checkValidity()}reportValidity(){return this.#t.reportValidity()}focus(){this.controlElement.focus()}#o=t=>{this.validateOnChange&&(this.pristine=!1,this.#u({showError:!0})),this.dispatchEvent(new t.constructor(t.type,t))};#n=t=>{this.value=this.controlElement.value,this.#t.form?.validateOnInputAfterSubmit&&this.#t.form.submitted&&(this.pristine=!1,this.#u({showError:!0})),this.dispatchEvent(new t.constructor(t.type,t))};#a=t=>{if(this.#u({showError:!0}),console.log(this.#t.form.elements.length),this.error){t.preventDefault();for(const t of this.#t.form.elements)if(!t.validity.valid){t===this&&(this.#t.form.submitted=!0,t.focus());break}}};#l(){const t=this.controlAttributes||[];for(const e of t)this.hasAttribute(e)&&("control-aria-label"===e?this.controlElement.setAttribute("aria-label",this.getAttribute(e)):this.controlElement.setAttribute(e,this.getAttribute(e)))}#h(t){t&&(this.invalid=!0,this.#e.textContent=t??"",this.controlElement.setCustomValidity(t),this.#t.setValidity(this.controlElement.validity,t??"",this.controlElement))}#d(){this.controlElement.setCustomValidity(""),this.removeAttribute("error"),this.error="",this.#e.textContent="",this.invalid=!1,this.#t.setValidity({})}#u({showError:t=!1}={}){if(this.#d(),!this.controlElement.validity.valid){let e="";for(const t in this.controlElement.validity)this.controlElement.validity[t]&&(e=this.hasAttribute(t.toString())?this.getAttribute(t.toString()):this.#s[t.toString()]);this.#t.setValidity(this.controlElement.validity,e,this.controlElement),t&&(this.error=e,this.#e.textContent=e,this.invalid=!0,this.dispatchEvent(new CustomEvent("invalid",{bubbles:!0,cancelable:!0,detail:{error:e}})))}}}export{t as FormElement};
