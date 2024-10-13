const arrowIcon = /*html*/ `<svg aria-hidden="true" part="arrow-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">  <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" /></svg>`;

export const menuItemTemplate = /*html*/ `
<button part="button" tabindex="-1" role="menuitem">
    <span part="checked">
		<svg aria-hidden="true" part="check-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
			<path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
  		</svg>
		<svg aria-hidden="true" part="circle-icon" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        	<circle cx="50" cy="50" r="50" fill="currentColor" />
    	</svg>
  	</span>
	<slot name="start"></slot>
	<slot></slot>
	<slot name="end"></slot>
</button>
<slot name="submenu"></slot>
`;

export const menuItemStyles = /*css*/ `
:host {
	display: flex;
}

:host([open]) :where(a, button) {
	background-color: var(--cek-surface-color-0);
}

svg[part=arrow-icon] {
	width: 1em;
	height: 1em;
	margin-inline: var(--cek-space-2);
}

button, a {
	position: relative;
	appearance: none;
	border: 0;
	border-radius: var(--cek-border-radius);
	background-color: var(--cek-surface-color-0);	
	padding: var(--cek-space-2) var(--cek-space-3);;
	margin: var(--cek-space-2);
	font: inherit;
	color: var(--cek-text-color-2);
	text-align: inherit;
	flex: auto;
	font-family: var(--cek-font-family);
	line-height: var(--cek-line-height);
	display: flex;
	justify-content: center;
	align-items: center;
	cursor: pointer;
	box-sizing: border-box;
	text-decoration: none;
	min-height: var(--cek-height-small);

	&:focus {
	    background-color: var(--cek-surface-color-1);
		outline: none;
	}
	
	&[aria-expanded=true]:hover {
		background-color: var(--cek-surface-color-1);
	}
}

:host [part=checked] svg {
	display: none;
}

:host(:is([type=checkbox], [type=radio])) [part=checked] {
	width: var(--cek-space-7);
}

:host([type="checkbox"][checked=""]) [part=check-icon] {
	display: flex;
	width: 0.9em;
	height: 0.9em;
}

:host([type="radio"][checked=""]) [part=circle-icon] {
	display: flex;
	width: 0.5em;
	height: 0.5em;
}

slot[name=start], slot[name=end] {
    flex: 0 0 auto;
}

slot {
    flex: 1 1 auto;
    display: inline-block;
	margin-inline: var(--cek-space-2);
}

slot[name=submenu] {
    display: contents;
}

::slotted(cek-icon) {
	margin-inline: var(--cek-space-1);
}

::slotted(cek-icon) {
	font-size: 1.3em;
}
`;

export class MenuItem extends HTMLElement {
	static get observedAttributes() {
		return ["href", "target", "type", "checked"];
	}

	#anchorElement;
	#buttonElement;

	constructor() {
		super();
		if (!this.shadowRoot) {
			this.attachShadow({ mode: "open", delegatesFocus: true });
			this.shadowRoot.innerHTML = `<style>${menuItemStyles}</style>${menuItemTemplate}`;
		}
		this.#initAnchorOrButton();
	}

	get href() {
		return this.getAttribute("href");
	}

	get target() {
		return this.getAttribute("target") ?? "_self";
	}

	get type() {
		return this.getAttribute("type");
	}

	get value() {
		return this.getAttribute("value");
	}

	get #anchorOrButton() {
		return this.href ? this.#anchorElement : this.#buttonElement;
	}

	attributeChangedCallback(name, _oldValue, newValue) {
		if (name === "checked") {
			if (newValue === "") {
				this.#anchorOrButton.setAttribute("aria-checked", "true");
			} else {
				this.#anchorOrButton.removeAttribute("aria-checked");
			}
		}
	}

	connectedCallback() {
		this.#initArrowIcon();
	}

	#initArrowIcon() {
		const submenuElement = this.querySelector("[slot=submenu]");

		if (!submenuElement) {
			return;
		}

		this.placement = submenuElement.getAttribute("placement") ?? "right";
		const iconPosition = this.placement.startsWith("right")
			? "beforeend"
			: "afterbegin";
		const rotation = this.placement.startsWith("right") ? "-90deg" : "90deg";
		this.#anchorOrButton.insertAdjacentHTML(iconPosition, arrowIcon);
		const arrowIconElement = this.#anchorOrButton.querySelector(
			"svg[part=arrow-icon]",
		);
		arrowIconElement.style.transform = `rotate(${rotation})`;
	}

	#initAnchorOrButton() {
		this.#buttonElement = this.shadowRoot.querySelector("button");
		const ariaRole =
			this.type === "radio"
				? "menuitemradio"
				: this.type === "checkbox"
					? "menuitemcheckbox"
					: "menuitem";

		if (this.href) {
			const anchor = document.createElement("a");
			anchor.setAttribute("role", ariaRole);
			anchor.href = this.href;
			anchor.target = this.target;
			anchor.setAttribute("tabindex", "-1");
			anchor.setAttribute("part", "anchor");
			while (this.#buttonElement.firstChild) {
				anchor.appendChild(this.#buttonElement.firstChild);
			}
			this.#buttonElement.replaceWith(anchor);
			this.#buttonElement = null;
			this.#anchorElement = anchor;
		} else {
			this.#buttonElement.setAttribute("role", ariaRole);
		}
	}

	focus() {
		this.#anchorOrButton.focus();
	}
}

customElements.define("cek-menu-item", MenuItem);
