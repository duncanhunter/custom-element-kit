const t='\n<div part="container">\n\t<link id="hljs-theme" rel="stylesheet">\n\t<pre><code part="code"></code></pre>\n\t<button part="copy-button" aria-label="Copy code block">\n\t\t<svg part="copy-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">\n\t\t\t<path stroke-linecap="round" stroke-linejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />\n\t\t</svg>\n\t\t<svg part="check-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">\n\t\t\t<path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />\n\t\t</svg>\n\t</button>\n\t<div id="aria-live-region" aria-live="polite" role="status"></div>\n</div>\n',e="\n:host {\n\tposition: relative;\n}\n\n[part=container] {\n\tposition: relative;\n}\n\npre { \n    margin: 0;\n}\n\ncode {\n    white-space: pre-wrap;\n\tborder-radius: var(--cek-border-radius);\n}\n\n[part=container] pre > code.hljs {\n\tpadding: 1.1em;\n}\n\n[part=copy-button] {\n\tdisplay: flex;\n\tjustify-content: center;\n\tposition: absolute;\n\ttop: var(--cek-space-4);\n\tright: var(--cek-space-4);\n\tbackground-color: var(--cek-color-gray-800);\n\tborder: none;\n\tborder-radius: var(--cek-border-radius-2);\n\tpadding: var(--cek-space-3);\n\tcursor: pointer;\n\tcolor: white;\n}\n\n[part=check-icon] {\n\tdisplay: none;\n}\n\n[part=copy-button] svg {\n\twidth: var(--cek-space-6);\n\theight: var(--cek-space-6);\n}\n\n[part=copy-button]:hover {\n\tbackground-color: var(--cek-color-gray-600);\n}\n\n[part=copy-button]:focus {\n\toutline: var(--cek-focus-ring);\n\toutline-offset: var(--cek-focus-ring-offset);\n}\n\n#aria-live-region {\n\tposition: absolute;\n\twidth: 1px;\n\theight: 1px;\n\tpadding: 0;\n\tmargin: -1px;\n\toverflow: hidden;\n\tclip: rect(0, 0, 0, 0);\n\tborder: 0;\n}\n";class n extends HTMLElement{static get observedAttributes(){return["lang","theme","no-trim"]}#t;#e;#n;#o;#i;#r;constructor(){super(),this.parentElement.closest("cek-code-block")||(this.shadowRoot||(this.attachShadow({mode:"open"}),this.shadowRoot.innerHTML=`<style>${e}</style>${t}`),this.#t=new MutationObserver((()=>this.#s())))}get serverRendered(){return this.hasAttribute("server-rendered")}connectedCallback(){this.parentElement.closest("cek-code-block")?this.dataset.inert=!0:(this.#t.observe(this,{childList:!0,characterData:!0,subtree:!0}),this.#n=this.shadowRoot.querySelector("[part=copy-button]"),this.#o=this.shadowRoot.querySelector("[part=check-icon]"),this.#i=this.shadowRoot.querySelector("[part=copy-icon]"),this.#e=this.shadowRoot.querySelector("[part=code]"),this.#r=this.shadowRoot.querySelector("#aria-live-region"),this.#n.addEventListener("click",this.#c),this.serverRendered||this.#a())}disconnectedCallback(){this.#t.disconnect(),this.#n.removeEventListener("click",this.#c)}attributeChangedCallback(t,e,n){e!==n&&e&&(this.serverRendered||this.#a())}#c=()=>{navigator.clipboard.writeText(this.#e.textContent),this.#i.style.display="none",this.#o.style.display="block",this.#r.textContent="Copying...",setTimeout((()=>{this.#r.textContent="Code copied to clipboard"}),100),setTimeout((()=>{this.#i.style.display="block",this.#o.style.display="none",this.#r.textContent=" "}),1e3)};#s(){!this.serverRendered&&this.innerHTML.trim().length>0&&this.#a()}async#a(){this.removeAttribute("server-rendered");const t=this.shadowRoot.querySelector("code"),e=this.getAttribute("lang")||"plaintext",n=this.getAttribute("theme")||"github",o="true"===this.getAttribute("no-trim");let i=this.innerHTML;const r=i.match(/\s*<template>([\s\S]*?)<\/template>\s*/);r&&(i=r[1]);const s=o?i:this.#l(i);t.removeAttribute("data-highlighted"),t.className=e;const c=s.replace(/(\b\w+\b)=""/g,"$1");t.textContent=c,this.shadowRoot.querySelector("#hljs-theme").href=`https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.9.0/build/styles/${n}.min.css`;try{const n=await import("https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.9.0/build/es/highlight.min.js"),o=await import(`https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.9.0/build/es/languages/${e}.min.js`);n.default.registerLanguage(e,o.default),n.default.highlightElement(t,{language:e})}catch(t){console.error("Failed to highlight code:",t)}}#l(t){const e=t.split("\n"),n=Math.min(...e.filter((t=>t.trim().length>0)).map((t=>t.match(/^\s*/)[0].length)));return e.filter(((t,e)=>!(0===e&&""===t.trim()))).map((t=>t.slice(n))).join("\n")}}customElements.define("cek-code-block",n);export{n as CodeBlock,e as codeBlockStyles,t as codeBlockTemplate};