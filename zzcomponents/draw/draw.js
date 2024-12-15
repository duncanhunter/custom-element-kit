import { config, css, html, mixins } from "../core.js";

const fragment = html`
  <dialog part="dialog" id="dialog">
	<div part="header">
		<slot name=header></slot>
		<button part="close" type="button" autofocus>Close</button>
	</div>
	<div part="content">
    	<slot></slot>
	</div>
	<div part="actions">
		<slot name=actions></slot>
	</div>
  </dialog>
`;

const styles = css`
	:host {
		--size: 10rem;
	}

	:host::part(close) {
		font-size: var(--ui-font-size-6);
		line-height: var(--ui-line-height);
	}

	:host([close-hidden])::part(close) {
		display: none;
	}

	:host([placement="start"]) dialog,
	:host(:not([placement])) dialog {
		width: var(--size);
		height: 100%;
	}
	
	:host([placement="end"]) dialog{
		width: var(--size);
		height: 100%;
		margin-inline-start: auto;
	}

	:host([placement="top"]) dialog{
		height: var(--size);
		width: 100%;
	}

	:host([placement="bottom"]) dialog{
		height: var(--size);
		width: 100%;
		margin-block-start: auto;
	}

	dialog {
		margin: 0;
		max-width: 100%;
		max-height: 100%;
		box-shadow: var(--ui-shadow-2);
	}
`;

export class Draw extends HTMLElement {
	static get observedAttributes() {
		return ["trigger-id", "contained", "close-above"];
	}

	get dialog() {
		return this.shadowRoot.getElementById("dialog");
	}

	get triggerId() {
		return this.getAttribute("trigger-id");
	}

	set triggerId(value) {
		this.setAttribute("trigger-id", value);
	}

	get contained() {
		return this.hasAttribute("contained");
	}

	set contained(value) {
		this.toggleAttribute("contained", value);
	}

	get closeAbove() {
		return config.getConfig().breakpoints[this.getAttribute("close-above")];
	}

	set closeAbove(value) {
		this.setAttribute("close-above", value);
	}

	constructor() {
		super();
		this.attachShadow({ mode: "open" });
		this.shadowRoot.appendChild(fragment.cloneNode(true));
		this.shadowRoot.adoptedStyleSheets = [styles];
	}

	connectedCallback() {
		this.dialog.addEventListener("close", (event) => {
			this.close(event.detail ?? "cancel");
		});
		const closeButton = this.shadowRoot.querySelector("[part='close']");
		closeButton.addEventListener("click", (event) => {
			event.preventDefault();
			this.close("cancel");
		});
	}

	attributeChangedCallback(name, oldValue, newValue) {
		if (name === "trigger-id" && oldValue !== newValue) {
			this.triggerIdChanged(newValue);
		}
		if (name === "close-above" && oldValue !== newValue) {
			this.closeAboveChanged();
		}
	}

	closeAboveChanged() {
		if (this.closeAbove) {
			const mql = window.matchMedia(`(min-width: ${this.closeAbove})`);
			const closeDialog = (mq) => {
				if (mq.matches) {
					this.close("cancel");
				}
			};
			mql.addEventListener("change", closeDialog);
		}
	}

	triggerIdChanged(triggerId) {
		const trigger = document.getElementById(triggerId);
		trigger.addEventListener("click", (event) => {
			event.preventDefault();
			this.toggleDraw();
		});
	}

	toggleDraw() {
		this.dialog.open ? this.close("cancel") : this.showModal();
	}

	close(result) {
		document.body.toggleAttribute("inert", false);
		document.body.classList.remove("ui-scroll-lock");
		this.dialog.close(result);
		if (this.triggerId) {
			const trigger = document.getElementById(this.triggerId);
			trigger.focus();
		}
	}

	showModal() {
		this.dialog.showModal();
		document.body.toggleAttribute("inert", true);
		document.body.classList.add("ui-scroll-lock");
	}
}

customElements.define("ui-draw", Draw);
