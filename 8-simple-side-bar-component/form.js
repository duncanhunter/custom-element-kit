class t extends HTMLElement{static get observedAttributes(){return["loading","fetch-trigger","fetch-swap","fetch-target","fetch-indicator","fetch-confirm","fetch-redirect","fetch-replace-url"]}#t;#e;constructor(){super();const t=document.createElement("style");t.innerHTML="\n\t\t\tform {\n\t\t\t\tdisplay: grid;\n\t\t\t\tgrid-template-columns: 1fr;\n\t\t\t\tgrid-gap: var(--cek-space-4);\n\t\t\t\tmargin-block: var(--cek-space-4);\n\t\t\t}",this.appendChild(t),this.#t=document.createElement("form"),this.#t.setAttribute("novalidate","")}get showErrorSummary(){const t=this.getAttribute("show-error-summary");return null!==t&&"false"!==t}get loading(){return this.getAttribute("loading")}set loading(t){t?this.setAttribute("loading",""):this.removeAttribute("loading")}connectedCallback(){this.#i(),this.#t.addEventListener("submit",this.#r),this.#t.validateOnChange=this.hasAttribute("validate-on-change")&&!1!==this.getAttribute("validate-on-change"),this.#t.validateOnInputAfterSubmit="false"!==this.getAttribute("validate-on-input-after-submit"),this.#e={trigger:this.getAttribute("fetch-trigger")??"submit",swap:this.getAttribute("fetch-swap")??"afterbegin",indicator:this.getAttribute("fetch-indicator")?this.getAttribute("fetch-indicator"):this.#t.querySelector("cek-button[type='submit']")??null,confirm:this.getAttribute("fetch-confirm")}}handleEvent(){this.hasAttribute("disabled")}attributeChangedCallback(t,e,i){"disabled"===t&&(this.#t.disabled=null!==i),"id"===t&&this.#t.setAttribute("id",i)}formData(){return new FormData(this.#t)}formValues(){return Object.fromEntries(new FormData(this.#t).entries())}#n(){if(this.getAttribute("fetch")){const[t,...e]=this.getAttribute("fetch").split(":"),i=e.join(":");this.#e.path=i,this.#e.method=t;const r=()=>{this.#e.indicator.loading=!0,this.#e.target=this.#o(),this.loading=!0,fetch(this.#e.path,{method:this.#e.method,body:this.formData()}).then((t=>{if(!t.ok)throw new Error("Fetch failed");return t.text()})).then((t=>{if("innerHTML"===this.#e.swap)this.#e.target.innerHTML=t;else if("outerHTML"===this.#e.swap)this.#e.target.outerHTML=t;else if("beforeend"===this.#e.swap)this.#e.target.insertAdjacentHTML("beforeend",t);else if("afterend"===this.#e.swap)this.#e.target.insertAdjacentHTML("afterend",t);else if("beforebegin"===this.#e.swap)this.#e.target.insertAdjacentHTML("beforebegin",t);else if("afterbegin"===this.#e.swap)this.#e.target.insertAdjacentHTML("afterbegin",t);else{document.querySelector(this.#e.swap).innerHTML=t}this.#e.indicator.loading=!1,this.loading=!1})).catch((t=>{console.error(t),this.#e.indicator.loading=!1}))};if(this.#e.data=this.formValues(),this.#e.confirm){const t=`\n\t\t\t\t\t\t\t<cek-dialog>\n\t\t\t\t\t\t\t\t${this.#e.confirm}\n\t\t\t\t\t\t\t\t<button id="yes" type="button">Yes</button>\n\t\t\t\t\t\t\t</cek-dialog>\n\t\t\t\t\t\t`;this.insertAdjacentHTML("beforeend",t);const e=this.querySelector("cek-dialog"),i=()=>{e.close("yes"),e.remove(),r()};e.showModal();const n=this.querySelector("#yes");n.addEventListener("keydown",(t=>{"Enter"===t.key&&(t.preventDefault(),t.stopImmediatePropagation(),i())})),n.addEventListener("click",(t=>{i()}))}else r()}}#o(){let t;return t=this.getAttribute("fetch-target")?this.querySelector(this.getAttribute("fetch-target"))?this.querySelector(this.getAttribute("fetch-target")):document.querySelector(this.getAttribute("fetch-target")):this,t}#i(){for(const t of Array.from(this.querySelectorAll(":scope > *")))this.#t.appendChild(t);this.appendChild(this.#t)}#r=t=>{console.log("handleSubmit > event",t);const e=document.querySelector("[role='alert']");e?.remove(),t.preventDefault(),this.#t.submitted=!0;const i=[];let r;for(const t of this.#t.elements)t.hasAttribute("name")&&(t.validate(),t.error&&i.push({message:t.error,name:t.getAttribute("name")}),t.checkValidity()||r||(r=t,this.showErrorSummary&&r.focus()));if(console.log("invalidMessages",i),i.length>=1&&!this.showErrorSummary){const t=this.#t.querySelector("[role='alert']");t&&t.remove();const e=document.createElement("div"),r=document.createElement("h2");r.textContent="There is a problem",e.appendChild(r),e.setAttribute("role","alert"),e.setAttribute("tabindex","-1");const n=document.createElement("ul");n.setAttribute("role","list"),e.appendChild(n);for(const{message:t,name:e}of i){const i=document.createElement("li");i.setAttribute("role","listitem");const r=document.createElement("button");r.setAttribute("type","button"),r.id=`error-${e}`,r.textContent=t,r.style.cursor="pointer",r.addEventListener("click",(()=>{const t=this.#t.querySelector(`[name="${e}"]`);t&&t.focus()})),n.appendChild(i),i.appendChild(r)}this.insertAdjacentElement("beforebegin",e);const o=document.querySelector(`button[id=error-${i[0].name}]`);o&&o.focus()}else if(1===i.length){const t=this.#t.querySelector(`[name="${i[0].name}"]`);t&&t.focus()}this.#t.checkValidity()&&this.#n()}}customElements.define("cek-form",t);export{t as Form};
