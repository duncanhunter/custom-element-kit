import { createPopover } from "../../core/popover.js";

const arrowIcon = /*html*/ `<svg aria-hidden="true" part="arrow-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">  <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" /></svg>`;

export const menuHtml = /*html*/ `
<slot name="trigger"></slot>
<dialog tabindex="-1" part="popover" role="menu">
	<slot></slot>
</dialog>
`;

/*
DSD
badge in menu for count
screenshot light and dark
dark sections? and new dark theme html specs
*/

export const menuStyles = /*css*/ `
:host {
	display: inline-block;
}

dialog {
	position: fixed;
	outline: none;
	padding: 0;
	margin: 0;
	border: var(--ui-border);
	box-shadow:  var(--ui-shadow-3);
	border-radius: var(--ui-border-radius);
	background-color: var(--ui-surface-color-00);
}
`;

export class Menu extends HTMLElement {
	static get observedAttributes() {
		return ["placement", "trigger", "modal", "open", "arrow", "popover-width"];
	}

	#popoverElement;
	#triggerHostElement;
	#triggerButtonElement;
	#isSubmenu;
	#popover;
	#searchString = "";
	#searchTimeout = null;

	constructor() {
		super();
		if (!this.shadowRoot) {
			this.attachShadow({ mode: "open", delegatesFocus: true });
			this.shadowRoot.innerHTML = `<style>${menuStyles}</style>${menuHtml}`;
		}
		this.#initializeElements();
		this.#initializePopover();
	}

	get placement() {
		return this.getAttribute("placement") ?? "bottom-start";
	}

	get trigger() {
		return this.getAttribute("trigger") ?? "click";
	}

	get offset() {
		return +this.getAttribute("offset") ?? 0;
	}

	get menuItems() {
		return Array.from(this.querySelectorAll(":scope > ui-menu-item"));
	}

	get modal() {
		return this.hasAttribute("modal") && this.getAttribute("modal") !== "false";
	}

	set modal(value) {
		this.setAttribute("modal", value);
	}

	get open() {
		return this.hasAttribute("open");
	}

	get arrow() {
		return this.getAttribute("arrow");
	}

	get popoverWidth() {
		return this.getAttribute("popover-width") ?? "content-width";
	}

	attributeChangedCallback(name, oldValue, newValue) {
		if (name === "modal") {
			if (["true", null].includes(newValue)) {
				this.#popoverElement = this.shadowRoot.querySelector("[part=popover]");
				this.#popoverElement?.setAttribute("popover", "manual");
			} else if (this.#popoverElement?.hasAttribute("popover")) {
				this.#popoverElement?.removeAttribute("popover");
			}
		} else if (name === "open") {
			if (
				[null, "false"].includes(oldValue) &&
				window.getComputedStyle(this.#popoverElement).display === "none"
			) {
				this.show({ focusOnMenuItem: false, force: true });
			}
		} else if (name === "arrow") {
			const arrowElement = this.#triggerButtonElement.querySelector(
				"svg[part=arrow-icon]",
			);
			if (arrowElement && newValue !== "" && newValue !== "true") {
				arrowIconElement?.remove();
			} else if (!arrowElement && !this.#isSubmenu) {
				this.#insertArrowIcon();
			}
		}
	}

	connectedCallback() {
		this.#setPopoverZIndex();
		this.#addEventListeners();
	}

	disconnectedCallback() {
		this.#removeEventListeners();
	}

	#addEventListeners() {
		this.addEventListener("keydown", this.#handleKeyDown);
		this.#popoverElement.addEventListener(
			"mouseout",
			this.#handlePopoverMouseOut,
		);
		this.addEventListener("focusout", this.#handlePopoverFocusOut);
		this.addEventListener("click", this.#handleSelectClick);
		this.#popoverElement.addEventListener(
			"mouseover",
			this.#handlePopoverMouseOverOrFocusIn,
		);
		this.addEventListener("focusin", this.#handlePopoverMouseOverOrFocusIn);
		this.#popoverElement.addEventListener(
			"pointermove",
			this.#handlePopoverPointerMove,
		);
		this.addEventListener("ui-select", this.#handleUiSelect);

		if (this.#isSubmenu) {
			this.#triggerButtonElement.addEventListener(
				"pointermove",
				this.#handleSubmenuTriggerButtonPointerMove,
			);
			this.#triggerButtonElement.addEventListener(
				"click",
				this.#triggerSubMenuButtonClick,
			);
		} else {
			this.#triggerHostElement.addEventListener(
				"keydown",
				this.#handleMainTriggerKeyDown,
			);
			this.#triggerHostElement.addEventListener(
				"click",
				this.#handleMainTriggerClick,
			);
			if (this.trigger === "hover") {
				this.#triggerHostElement.addEventListener(
					"mouseover",
					this.#handleMainTriggerMouseOver,
				);
				this.#triggerHostElement.addEventListener(
					"mouseout",
					this.#handleMainTriggerMouseOut,
				);
			}
		}
	}

	#removeEventListeners() {
		this.removeEventListener("keydown", this.#handleKeyDown);
		this.#popoverElement.removeEventListener(
			"mouseout",
			this.#handlePopoverMouseOut,
		);
		this.removeEventListener("focusout", this.#handlePopoverFocusOut);
		this.removeEventListener("click", this.#handleSelectClick);
		this.#popoverElement.removeEventListener(
			"mouseover",
			this.#handlePopoverMouseOverOrFocusIn,
		);
		this.#popoverElement.removeEventListener(
			"mousemove",
			this.#handlePopoverPointerMove,
		);
		this.removeEventListener("ui-select", this.#handleUiSelect);

		if (this.#isSubmenu) {
			this.#triggerButtonElement.removeEventListener(
				"pointermove",
				this.#handleSubmenuTriggerButtonPointerMove,
			);
			this.#triggerButtonElement.removeEventListener(
				"click",
				this.#triggerSubMenuButtonClick,
			);
		} else {
			this.#triggerHostElement.removeEventListener(
				"keydown",
				this.#handleMainTriggerKeyDown,
			);
			this.#triggerHostElement.removeEventListener(
				"click",
				this.#handleMainTriggerClick,
			);
			if (this.trigger === "hover") {
				this.#triggerHostElement.removeEventListener(
					"mouseover",
					this.#handleMainTriggerMouseOver,
				);
				this.#triggerHostElement.removeEventListener(
					"mouseout",
					this.#handleMainTriggerMouseOut,
				);
			}
		}
	}

	#handlePopoverPointerMove = (event) => {
		event.preventDefault();
		event.stopImmediatePropagation();

		if (event.pointerType === "touch") {
			return;
		}

		if (
			event.target.tagName === "UI-MENU-ITEM" &&
			document.activeElement !== event.target
		) {
			event.target.focus();
		}
	};

	#handleUiSelect = () => {
		if (this.open) {
			this.hide();
		}
	};

	#handlePopoverMouseOut = (event) => {
		event.preventDefault();
		event.stopImmediatePropagation();

		if (
			this.trigger === "hover" &&
			!this.#popoverElement.contains(event.relatedTarget) &&
			!this.contains(event.relatedTarget) &&
			this.open
		) {
			this.hide({ focusOnTrigger: false });
		}

		if (
			event.relatedTarget?.tagName === "UI-MENU-ITEM" ||
			this.shadowRoot.contains(event.relatedTarget)
		) {
			return;
		}

		if (
			!this.contains(event.relatedTarget) &&
			event.target.parentElement?.hasAttribute("open")
		) {
			if (event.target.hasAttribute("open")) {
				event.target.querySelector("[slot=submenu]")?.hide();
			}
			this.#popoverElement.focus();
		}
	};

	#handlePopoverMouseOverOrFocusIn = (event) => {
		event.preventDefault();
		event.stopImmediatePropagation();

		if (!event.target || event.target.tagName !== "UI-MENU-ITEM") {
			return;
		}

		const submenuParentMenuItem = event.target.parentElement.menuItems.find(
			(item) => item.querySelector("[slot=submenu]"),
		);

		const isOpenSubmenu = submenuParentMenuItem
			?.querySelector("[slot=submenu]")
			?.hasAttribute("open");

		if (
			event.target.tagName === "UI-MENU-ITEM" &&
			event.target.parentElement.menuItems.includes(event.target) &&
			event.target !== submenuParentMenuItem &&
			isOpenSubmenu
		) {
			submenuParentMenuItem?.querySelector("[slot=submenu]")?.hide();
			event.target.focus();
		}
	};

	#triggerSubMenuButtonClick = (event) => {
		event.preventDefault();
		event.stopImmediatePropagation();

		if (this.open) {
			this.hide({ focusOnTrigger: false });
		} else {
			this.show({ focusOnMenuItem: true });
		}
	};

	#handleSubmenuTriggerButtonPointerMove = (event) => {
		event.preventDefault();
		event.stopImmediatePropagation();

		if (event.pointerType === "touch") {
			return;
		}

		if (!this.open) {
			this.show({ focusOnMenuItem: false });
		} else if (event.target.getAttribute("open") === "true") {
			this?.focus();
		}
	};

	#handleMainTriggerMouseOver = () => {
		if (!this.open) {
			this.show({ focusOnMenuItem: true });
		}
	};

	#handleMainTriggerMouseOut = (event) => {
		if (!this.contains(event.relatedTarget) && this.open) {
			this.hide({ focusOnTrigger: false });
		}
	};

	#handleMainTriggerClick = (event) => {
		event.preventDefault();
		event.stopImmediatePropagation();

		if (event.target.hasAttribute("open")) {
			this.hide();
		} else {
			this.show({ focusOnMenuItem: true });
		}
	};

	#handleMainTriggerKeyDown = (event) => {
		if (event.key === "ArrowDown") {
			event.preventDefault();
			event.stopImmediatePropagation();
			this.show({ focusOnMenuItem: true });
		}

		if (event.key === "ArrowUp") {
			event.preventDefault();
			event.stopImmediatePropagation();
			this.show({
				focusOnMenuItem: true,
				onOpenMenuItemIndexToFocus: this.menuItems.length - 1,
			});
		}
	};

	#handleSelectClick = (event) => {
		event.preventDefault();
		event.stopImmediatePropagation();

		if (event.target.tagName === "UI-MENU-ITEM" && event.target.value) {
			this.hide();

			this.dispatchEvent(
				new CustomEvent("ui-select", {
					detail: { value: event.target.value },
					bubbles: true,
				}),
			);

			if (["radio", "checkbox"].includes(event.target.getAttribute("type"))) {
				for (const item of this.menuItems) {
					if (item !== event.target) {
						item.removeAttribute("checked");
					} else {
						item.setAttribute("checked", "");
					}
				}
			}
		}
	};

	#handlePopoverFocusOut = (event) => {
		event.preventDefault();
		event.stopImmediatePropagation();

		if (
			event.target?.tagName === "UI-BUTTON" &&
			event.relatedTarget?.tagName !== "UI-MENU-ITEM"
		) {
			this.hide();
		}

		if (!this.contains(event.relatedTarget)) {
			// this.hide();
		}
	};

	#handleKeyDown = (event) => {
		const items = this.menuItems;
		const currentIndex = items.indexOf(event.target);
		const submenuElement = items
			.at(currentIndex)
			?.querySelector("[slot=submenu]");
		const preventDefaultAndStop = () => {
			event.preventDefault();
			event.stopImmediatePropagation();
		};
		const focusItem = (index) => {
			const itemToFocus = items.at(index);
			itemToFocus?.focus();
		};

		switch (event.key) {
			case "Escape":
				this.hide();
				preventDefaultAndStop();
				break;
			case "ArrowRight":
				preventDefaultAndStop();
				if (submenuElement?.getAttribute("placement").startsWith("right")) {
					if (event.target.hasAttribute("open")) {
						submenuElement.menuItems.at(0).focus();
					} else {
						submenuElement.show({ focusOnMenuItem: true });
					}
					break;
				}
				if (this.getAttribute("placement").startsWith("left")) {
					this.hide();
				}
				break;
			case "ArrowLeft":
				preventDefaultAndStop();
				if (submenuElement?.getAttribute("placement").startsWith("left")) {
					submenuElement.show({
						focusOnMenuItem: true,
					});
					break;
				}
				if (this.getAttribute("placement").startsWith("right")) {
					this.hide();
				}
				break;
			case "ArrowDown":
				preventDefaultAndStop();
				focusItem(currentIndex === items.length - 1 ? 0 : currentIndex + 1);
				break;
			case "ArrowUp":
				preventDefaultAndStop();
				focusItem(currentIndex === 0 ? -1 : currentIndex - 1);
				break;
			case "PageDown":
				preventDefaultAndStop();
				focusItem(-1);
				break;
			case "PageUp":
				preventDefaultAndStop();
				focusItem(0);
				break;
			default:
				this.#setFocusBySearchString(event);
				break;
		}
	};

	show({
		focusOnMenuItem = true,
		onOpenMenuItemIndexToFocus = 0,
		force = false,
	}) {
		if (!this.open || force) {
			if (this.modal) {
				this.#popoverElement.showPopover();
			} else {
				this.#popoverElement.show();
			}

			this.#popover.startAutoUpdatePosition();

			if (focusOnMenuItem) {
				this.menuItems.at(onOpenMenuItemIndexToFocus).focus();
			}

			this.#triggerButtonElement.setAttribute("aria-expanded", "true");
			this.#triggerHostElement.setAttribute("open", "");
			this.setAttribute("open", "");
		} else if (this.open) {
			const focusedItem = this.menuItems.find(
				(item) => item === document.activeElement,
			);
			if (focusedItem) {
				return;
			}
			this.menuItems.at(onOpenMenuItemIndexToFocus).focus();
		}
	}

	hide({ focusOnTrigger } = { focusOnTrigger: true }) {
		if (!this.open) {
			return;
		}

		if (this.modal) {
			this.#popoverElement.hidePopover();
			document.body.style.overflow = "";
		} else {
			this.#popoverElement.close();
		}

		this.#popover.stopAutoUpdatePosition();
		this.#triggerButtonElement.setAttribute("aria-expanded", "false");
		this.#triggerHostElement.removeAttribute("open");
		this.removeAttribute("open");

		if (focusOnTrigger) {
			this.#triggerButtonElement.focus();
		}

		for (const submenuElement of this.querySelectorAll("[slot=submenu]")) {
			submenuElement.hide({ focusOnTrigger: false });
		}
	}

	#setPopoverZIndex() {
		const parentDialog = this.#popoverElement.closest("dialog");
		let highestZIndex = 0;

		if (parentDialog) {
			const parentZIndex = window.getComputedStyle(parentDialog).zIndex;
			highestZIndex = Number.parseInt(parentZIndex, 10) || 0;
		}

		this.#popoverElement.style.zIndex = highestZIndex + 1;
	}

	#setFocusBySearchString(event) {
		const key = event.key.toLowerCase();
		const isPrintableCharacter = key.length === 1 && /\S/.test(key);

		if (isPrintableCharacter) {
			this.#searchString += key;
			const focusedMenu = this.#getFocusedMenu();
			const matchingItem = focusedMenu.menuItems.find((item) =>
				item.textContent.trim().toLowerCase().startsWith(this.#searchString),
			);
			if (matchingItem) {
				matchingItem.focus();
				matchingItem.scrollIntoView({ behavior: "smooth", block: "nearest" });
			}
			clearTimeout(this.#searchTimeout);
			this.searchTimeout = setTimeout(() => {
				this.#searchString = "";
			}, 500);
		}
	}

	#insertArrowIcon() {
		this.#triggerButtonElement.insertAdjacentHTML("beforeend", arrowIcon);
		const arrowIconElement = this.#triggerButtonElement.querySelector(
			"svg[part=arrow-icon]",
		);
		arrowIconElement.style.height = "1em";
		arrowIconElement.style.width = "1em";
		arrowIconElement.style.margin = "0 var(--ui-space-2)";
	}

	#getFocusedMenu() {
		let element = document.activeElement;

		while (element && element.tagName !== "UI-MENU") {
			element = element.parentElement;
		}
		return element ? element : this;
	}

	#initializeElements() {
		this.#popoverElement = this.shadowRoot.querySelector("[part=popover]");
		this.#isSubmenu = this.getAttribute("slot") === "submenu";
		this.#triggerHostElement = this.#isSubmenu
			? this.parentElement
			: this.querySelector("[slot=trigger]");
		this.#triggerButtonElement =
			this.#triggerHostElement.shadowRoot.querySelector("button");
		this.#triggerButtonElement.setAttribute("aria-haspopup", "true");
		this.#triggerButtonElement.setAttribute("aria-expanded", "false");
	}

	#initializePopover() {
		this.#popover = createPopover({
			anchorElement: this.#triggerHostElement,
			popoverElement: this.#popoverElement,
			placement: this.placement,
			offset: this.offset,
			popoverWidth: this.popoverWidth,
		});
	}
}

export const menuItemHtml = /*html*/ `
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
	background-color: var(--ui-surface-color-0);
}

svg[part=arrow-icon] {
	width: 1em;
	height: 1em;
	margin-inline: var(--ui-space-2);
}

button, a {
	position: relative;
	appearance: none;
	border: 0;
	border-radius: var(--ui-border-radius);
	background-color: var(--ui-surface-color-00);	
	padding: var(--ui-space-2) var(--ui-space-3);;
	margin: var(--ui-space-2);
	font: inherit;
	color: var(--ui-text-color-2);
	text-align: inherit;
	flex: auto;
	font-family: var(--ui-font-family);
	line-height: var(--ui-line-height);
	display: flex;
	justify-content: center;
	align-items: center;
	cursor: pointer;
	box-sizing: border-box;
	text-decoration: none;
	min-height: var(--ui-height-small);

	&:focus {
	    background-color: var(--ui-surface-color-0);
		outline: none;
	}
}

:host [part=checked] svg {
	display: none;
}

:host(:is([type=checkbox], [type=radio])) [part=checked] {
	width: var(--ui-space-7);
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
	margin-inline: var(--ui-space-2);
}

slot[name=submenu] {
    display: contents;
}

::slotted(ui-icon) {
	margin-inline: var(--ui-space-1);
}

::slotted(ui-icon) {
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
			this.shadowRoot.innerHTML = `<style>${menuItemStyles}</style>${menuItemHtml}`;
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

export const menuLabelHtml = /*html*/ `
<slot name="start"></slot>
<slot></slot>
<slot name="end"></slot>
`;

export const menuLabelStyles = /*css*/ `
:host {
	border-radius: var(--ui-border-radius);
	background-color: var(--ui-surface-color-00);	
	padding: var(--ui-space-2) var(--ui-space-3);;
	margin: var(--ui-space-4);
	font: inherit;
	color: var(--ui-text-color-2);
	text-align: inherit;
	flex: auto;
	font-size: var(--ui-font-size-0);
	font-family: var(--ui-font-family);
	line-height: var(--ui-line-height);
	display: flex;
	justify-content: center;
	align-items: center;
	box-sizing: border-box;
	cursor: default;
}

slot[name=start], slot[name=end] {
    flex: 0 0 auto;
}

slot {
    flex: 1 1 auto;
    display: inline-block;
}

::slotted(ui-icon) {
	margin-inline: var(--ui-space-2);
}
`;

export class MenuLabel extends HTMLElement {
	constructor() {
		super();
		if (!this.shadowRoot) {
			this.attachShadow({ mode: "open" });
			this.shadowRoot.innerHTML = `<style>${menuLabelStyles}</style>${menuLabelHtml}`;
		}
	}
}

customElements.define("ui-menu-item", MenuItem);
customElements.define("ui-menu-label", MenuLabel);
customElements.define("ui-menu", Menu);
