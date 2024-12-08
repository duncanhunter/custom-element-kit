const t="\n<style>\n:host {\n  display: flex;\n  font-family: var(--cek-font-family, sans-serif);\n  font-size: var(--cek-font-size-1, 14px);\n  color: var(--cek-text-color-0, #000);\n}\n\n/* Container that holds both tabs and panels */\n#container {\n  display: flex;\n  flex: 1;\n  position: relative;\n}\n\n#tablist-container {\n  display: flex;\n  position: relative;\n  overflow: hidden;\n  flex-shrink: 0;\n}\n\n#tablist {\n  display: flex;\n  gap: 4px;\n  align-items: center;\n  background: #f0f0f0; /* Light grey background for the tab container */\n  border-radius: var(--cek-border-radius, 4px);\n  padding: 4px;\n  flex-shrink: 0;\n  scroll-behavior: smooth;\n}\n\n::slotted(cek-tab) {\n  flex: 0 0 auto;\n}\n\n/* Panels container */\n#panels {\n  flex: 1 1 auto;\n  display: flex;\n}\n\n[hidden] {\n  display: none !important;\n}\n\n/* Arrow buttons for scrolling */\n.scroll-button {\n  background: #ccc;\n  border: none;\n  padding: 0.25em;\n  cursor: pointer;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  position: absolute;\n  z-index: 1;\n  opacity: 0.8;\n}\n.scroll-button:hover {\n  opacity: 1;\n}\n\n.scroll-button[hidden] {\n  display: none;\n}\n\n#container {\n    display: flex;\n    flex: 1 1 auto;\n    position: relative;\n    /* Ensure the container doesn't grow beyond the viewport width */\n    max-width: 100%; \n    overflow: hidden; /* This ensures the arrow buttons overlay nicely */\n  }\n  \n  #tablist-container {\n    display: flex;\n    position: relative;\n    flex-shrink: 1;\n    flex-grow: 1;\n    max-width: 100%;\n    /* We keep overflow hidden here so the arrow buttons can position over the tablist. \n       The actual scrolling will be enabled on #tablist. */\n    overflow: hidden;\n  }\n  \n  #tablist {\n    display: inline-flex;\n    gap: 4px;\n    align-items: center;\n    background: #f0f0f0; /* Light grey background for the tab container */\n    border-radius: var(--cek-border-radius, 4px);\n    padding: 4px;\n    /* Enable horizontal scrolling on the tablist itself */\n    overflow-x: auto;\n    overflow-y: hidden;\n    white-space: nowrap;\n    flex: 1 1 auto; \n    /* Make sure the tablist does not grow indefinitely and stays within container */\n    max-width: 100%;\n    scrollbar-width: thin; /* optional for Firefox */\n  }\n  \n  /* Tabs themselves remain flex items that do not wrap */\n  ::slotted(cek-tab) {\n    flex: 0 0 auto;\n    overflow: hidden;\n    text-overflow: ellipsis;\n    white-space: nowrap;\n  }\n  \n</style>\n",e='\n<div id="container">\n  <button id="scroll-prev" class="scroll-button" hidden aria-label="Scroll previous">\n    <span>◀</span>\n  </button>\n  <button id="scroll-next" class="scroll-button" hidden aria-label="Scroll next">\n    <span>▶</span>\n  </button>\n  <div id="tablist-container">\n    <div id="tablist" role="tablist" aria-orientation="horizontal">\n      <slot name="tab"></slot>\n    </div>\n  </div>\n  <div id="panels">\n    <slot name="panel"></slot>\n  </div>\n</div>\n',n="\n<style>\n:host {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  cursor: pointer;\n  padding: 8px 12px;\n  background: transparent;\n  border: none;\n  border-radius: var(--cek-border-radius, 4px);\n  font-family: inherit;\n  font-size: inherit;\n  color: inherit;\n  outline: none;\n  position: relative;\n  transition: background 0.2s ease, color 0.2s ease;\n}\n\n:host([active]) {\n  background: var(--cek-surface-1, #fff);\n  font-weight: bold;\n  color: #333; /* Darker font for active tab */\n  border-bottom: 2px solid var(--cek-border-color, #333);\n}\n\n:host(:focus) {\n  outline: 2px solid var(--cek-border-color, #333);\n}\n</style>\n",o="\n<slot></slot>\n",i="\n<style>\n:host {\n  display: none;\n  flex: 1 1 auto;\n}\n:host([active]) {\n  display: block;\n}\n\n\n</style>\n",s="\n<slot></slot>\n";function r(t){switch(t){case"start":return{orientation:"vertical",containerFlexDirection:"row",tablistOrder:"1",panelOrder:"2",scrollButtonsPos:{prev:"top:0;left:0;",next:"top:auto;bottom:0;left:0;"}};case"end":return{orientation:"vertical",containerFlexDirection:"row-reverse",tablistOrder:"1",panelOrder:"2",scrollButtonsPos:{prev:"top:0;right:0;",next:"bottom:0;right:0;"}};case"bottom":return{orientation:"horizontal",containerFlexDirection:"column-reverse",tablistOrder:"1",panelOrder:"2",scrollButtonsPos:{prev:"left:0;bottom:0;",next:"right:0;bottom:0;"}};default:return{orientation:"horizontal",containerFlexDirection:"column",tablistOrder:"1",panelOrder:"2",scrollButtonsPos:{prev:"left:0;top:0;",next:"right:0;top:0;"}}}}class l extends HTMLElement{#t=[];#e=[];#n="horizontal";#o=!1;#i="top";#s=null;#r=null;#l=t=>{const{key:e}=t,n=this.#t.indexOf(document.activeElement);if(-1===n)return;let o=null;if("horizontal"===this.#n?"ArrowRight"===e?o=(n+1)%this.#t.length:"ArrowLeft"===e&&(o=(n-1+this.#t.length)%this.#t.length):"ArrowDown"===e?o=(n+1)%this.#t.length:"ArrowUp"===e&&(o=(n-1+this.#t.length)%this.#t.length),"Home"===e?o=0:"End"===e&&(o=this.#t.length-1),null!==o)return t.preventDefault(),this.#a(this.#t[o]),this.#o||this.#c(this.#t[o]),void this.#h(this.#t[o]);"Enter"!==e&&" "!==e||!this.#o||(t.preventDefault(),this.#c(document.activeElement))};#d=t=>{const e=t.target.closest("cek-tab");e&&(this.#c(e),e.focus(),this.#h(e))};#b=()=>{const t=this.shadowRoot.querySelector("#tablist"),e="horizontal"===this.#n?t.clientWidth/2:t.clientHeight/2;"horizontal"===this.#n?t.scrollLeft-=e:t.scrollTop-=e};#u=()=>{const t=this.shadowRoot.querySelector("#tablist"),e="horizontal"===this.#n?t.clientWidth/2:t.clientHeight/2;"horizontal"===this.#n?t.scrollLeft+=e:t.scrollTop+=e};#p=()=>{this.#f()};constructor(){if(super(),!this.shadowRoot){this.attachShadow({mode:"open",delegatesFocus:!0}).innerHTML=`${t}${e}`}}static get observedAttributes(){return["direction","manual"]}attributeChangedCallback(t,e,n){"direction"===t?(this.#i=n||"top",this.#v()):"manual"===t&&(this.#o=this.hasAttribute("manual"))}connectedCallback(){this.#i=this.getAttribute("direction")||"top",this.#o=this.hasAttribute("manual");const{orientation:t}=r(this.#i);this.#n=t,this.#x(),this.#y(),this.addEventListener("keydown",this.#l),this.addEventListener("click",this.#d);this.shadowRoot.querySelector("#tablist").addEventListener("scroll",this.#p),this.#s=new MutationObserver((()=>{this.#x(),this.#f()})),this.#s.observe(this,{childList:!0,subtree:!0}),this.#r=new ResizeObserver((()=>{this.#f()})),this.#r.observe(this),this.#v(),this.#f()}disconnectedCallback(){this.removeEventListener("keydown",this.#l),this.removeEventListener("click",this.#d),this.shadowRoot.querySelector("#tablist").removeEventListener("scroll",this.#p),this.#s&&this.#s.disconnect(),this.#r&&this.#r.disconnect()}#v(){const t=r(this.#i),e=this.shadowRoot.querySelector("#container"),n=this.shadowRoot.querySelector("#tablist-container"),o=this.shadowRoot.querySelector("#panels"),i=this.shadowRoot.querySelector("#tablist"),s=this.shadowRoot.querySelector("#scroll-prev"),l=this.shadowRoot.querySelector("#scroll-next");i.setAttribute("aria-orientation",t.orientation),e.style.flexDirection=t.containerFlexDirection,"horizontal"===t.orientation?(n.style.flexDirection="row",o.style.flex="1 1 auto",s.style=`position:absolute;${t.scrollButtonsPos.prev}`,l.style=`position:absolute;${t.scrollButtonsPos.next}`):(n.style.flexDirection="column",o.style.flex="1 1 auto",s.style=`position:absolute;${t.scrollButtonsPos.prev}`,l.style=`position:absolute;${t.scrollButtonsPos.next}`),this.#f()}#x(){const t=this.shadowRoot.querySelector('slot[name="tab"]'),e=this.shadowRoot.querySelector('slot[name="panel"]');this.#t=t?t.assignedElements():[],this.#e=e?e.assignedElements():[],this.#t.forEach(((t,e)=>{const n=this.#e[e],o=t.id||`tab-${e}`,i=n&&n.id||`panel-${e}`;t.id=o,n&&(n.id=i),t.setAttribute("role","tab"),n&&(t.setAttribute("aria-controls",i),n.setAttribute("role","tabpanel"),n.setAttribute("aria-labelledby",o)),t.hasAttribute("active")||t.hasAttribute("aria-selected")||t.setAttribute("tabindex",0===e?"0":"-1")}))}#y(){let t=this.#t.find((t=>t.hasAttribute("active")));t||(t=this.#t.find((t=>"true"===t.getAttribute("aria-selected")))),!t&&this.#t.length>0&&(t=this.#t[0],t.setAttribute("active","")),t&&this.#c(t)}#c(t){t&&this.#t.forEach(((e,n)=>{const o=e===t;o?(e.setAttribute("aria-selected","true"),e.setAttribute("active",""),e.setAttribute("tabindex","0")):(e.removeAttribute("aria-selected"),e.removeAttribute("active"),e.setAttribute("tabindex","-1"));const i=this.#e[n];i&&(o?(i.setAttribute("active",""),i.setAttribute("tabindex","0")):(i.removeAttribute("active"),i.setAttribute("tabindex","-1")))}))}#a(t){t.focus()}#h(t){const e=this.shadowRoot.querySelector("#tablist"),n=t.getBoundingClientRect(),o=e.getBoundingClientRect();"horizontal"===this.#n?n.left<o.left?e.scrollLeft-=o.left-n.left:n.right>o.right&&(e.scrollLeft+=n.right-o.right):n.top<o.top?e.scrollTop-=o.top-n.top:n.bottom>o.bottom&&(e.scrollTop+=n.bottom-o.bottom),this.#f()}#f(){const t=this.shadowRoot.querySelector("#tablist"),e=this.shadowRoot.querySelector("#scroll-prev"),n=this.shadowRoot.querySelector("#scroll-next");if("horizontal"===this.#n){const o=t.scrollLeft>0,i=t.scrollWidth-t.clientWidth>t.scrollLeft+1;e.hidden=!o,n.hidden=!i,e.querySelector("span").textContent="◀",n.querySelector("span").textContent="▶"}else{const o=t.scrollTop>0,i=t.scrollHeight-t.clientHeight>t.scrollTop+1;e.hidden=!o,n.hidden=!i,e.querySelector("span").textContent="▲",n.querySelector("span").textContent="▼"}}}class a extends HTMLElement{static get observedAttributes(){return["active"]}constructor(){if(super(),!this.shadowRoot){this.attachShadow({mode:"open"}).innerHTML=`${n}${o}`}}}class c extends HTMLElement{constructor(){if(super(),!this.shadowRoot){this.attachShadow({mode:"open"}).innerHTML=`${i}${s}`}}}customElements.define("cek-tabs",l),customElements.define("cek-tab",a),customElements.define("cek-tab-panel",c);export{i as tabPanelStyles,s as tabPanelTemplate,n as tabStyles,o as tabTemplate,t as tabsStyles,e as tabsTemplate};
