const e='\n    <link id="hljs-theme" rel="stylesheet">\n    <pre><code class=""></code></pre>\n',t="\n    pre {\n        margin: 0;\n    }\n    code {\n        white-space: pre-wrap;\n    }\n";class s extends HTMLElement{static get observedAttributes(){return["lang","theme","no-trim"]}#e;constructor(){super(),this.parentElement.closest("cek-code-block")||(this.shadowRoot||(this.attachShadow({mode:"open"}),this.shadowRoot.innerHTML=`<style>${t}</style>${e}`),this.#e=new MutationObserver((()=>this.#t())))}get serverRendered(){return this.hasAttribute("server-rendered")}connectedCallback(){this.parentElement.closest("cek-code-block")?this.dataset.inert=!0:(this.#e.observe(this,{childList:!0,characterData:!0,subtree:!0}),this.serverRendered||this.#s())}disconnectedCallback(){this.#e.disconnect()}attributeChangedCallback(e,t,s){t!==s&&t&&(this.serverRendered||this.#s())}#t(){this.serverRendered||this.#s()}async#s(){this.removeAttribute("server-rendered");const e=this.shadowRoot.querySelector("code"),t=this.getAttribute("lang")||"plaintext",s=this.getAttribute("theme")||"github",r="true"===this.getAttribute("no-trim"),i=this.innerHTML,n=r?i:this.#r(i);e.removeAttribute("data-highlighted"),e.className=t,e.textContent=n,this.shadowRoot.querySelector("#hljs-theme").href=`https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.9.0/build/styles/${s}.min.css`;try{const s=await import("https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.9.0/build/es/highlight.min.js"),r=await import(`https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.9.0/build/es/languages/${t}.min.js`);s.default.registerLanguage(t,r.default),s.default.highlightElement(e,{language:t})}catch(e){console.error("Failed to highlight code:",e)}}#r(e){const t=e.split("\n"),s=Math.min(...t.filter((e=>e.trim().length>0)).map((e=>e.match(/^\s*/)[0].length)));return t.filter(((e,t)=>!(0===t&&""===e.trim()))).map((e=>e.slice(s))).join("\n")}}customElements.define("cek-code-block",s);export{s as CodeBlock,t as codeBlockStyles,e as codeBlockTemplate};
