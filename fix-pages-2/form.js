const t="\n\t<slot></slot>\n",e="\n";class r extends HTMLElement{static get observedAttributes(){return["loading","fetch-trigger","fetch-swap","fetch-target","fetch-indicator","fetch-confirm","fetch-redirect","fetch-replace-url"]}#t;#e;constructor(){super(),this.shadowRoot||(this.attachShadow({mode:"open"}),this.shadowRoot.innerHTML=`<style>\n</style>${t}`),this.#t=this.shadowRoot.querySelector("form")}attributeChangedCallback(t,e,r){"orientation"===t&&this.setAttribute("aria-orientation","horizontal"===r?"horizontal":"vertical")}connectedCallback(){this.#t.addEventListener("submit",this.#r),this.#t.validateOnChange=this.hasAttribute("validate-on-change")&&!1!==this.getAttribute("validate-on-change"),this.#t.validateOnInputAfterSubmit="false"!==this.getAttribute("validate-on-input-after-submit"),this.#e={trigger:this.getAttribute("fetch-trigger")??"submit",swap:this.getAttribute("fetch-swap")??"afterbegin",indicator:this.getAttribute("fetch-indicator")?this.getAttribute("fetch-indicator"):this.#t.querySelector("cek-button[type='submit']")??null,confirm:this.getAttribute("fetch-confirm")}}#r=t=>{console.log("handleSubmit > event",t);const e=document.querySelector("[role='alert']");e?.remove(),t.preventDefault(),this.#t.submitted=!0;const r=[];let o;for(const t of this.#t.elements)t.hasAttribute("name")&&(t.validate(),t.error&&r.push({message:t.error,name:t.getAttribute("name")}),t.checkValidity()||o||(o=t,this.showErrorSummary&&o.focus()));if(console.log("invalidMessages",r),r.length>=1&&!this.showErrorSummary){const t=this.#t.querySelector("[role='alert']");t&&t.remove();const e=document.createElement("div"),o=document.createElement("h2");o.textContent="There is a problem",e.appendChild(o),e.setAttribute("role","alert"),e.setAttribute("tabindex","-1");const i=document.createElement("ul");i.setAttribute("role","list"),e.appendChild(i);for(const{message:t,name:e}of r){const r=document.createElement("li");r.setAttribute("role","listitem");const o=document.createElement("button");o.setAttribute("type","button"),o.id=`error-${e}`,o.textContent=t,o.style.cursor="pointer",o.addEventListener("click",(()=>{const t=this.#t.querySelector(`[name="${e}"]`);t&&t.focus()})),i.appendChild(r),r.appendChild(o)}this.insertAdjacentElement("beforebegin",e);const n=document.querySelector(`button[id=error-${r[0].name}]`);n&&n.focus()}else if(1===r.length){const t=this.#t.querySelector(`[name="${r[0].name}"]`);t&&t.focus()}this.#t.checkValidity()}}customElements.define("cek-form",r);export{e as formStyles,t as formTemplate};