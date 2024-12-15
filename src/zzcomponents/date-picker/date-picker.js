import {
	initializeCalendarNavigation,
	renderCalendar,
} from "../../src/core/calendar.js";
import { createPopover } from "../../src/core/popover.js";

export const datePickerTemplate = /* html */ `
<label for="control" id="label" part="label"><slot name="label"></slot></label>
<div id="help" part="help"><slot name="help"></slot></div>
<div id="error" part="error"><slot name="error"></slot></div>
<div class="input-container">
    <input id="control" part="control" aria-describedby="help error" readonly></input>
    <button id="toggle" aria-label="Toggle Calendar" part="toggle-button">📅</button>
</div>
<dialog tabindex="-1" part="popover" role="menu">
    <div id="calendar-container">
        <!-- Calendar will be rendered here -->
    </div>
</dialog>
`;

export const datePickerStyles = /* css */ `
:host {
	display: flex;
	flex-direction: column;
	font-size: var(--cek-font-size-1);
	font-family: var(--cek-font-family);
	color: var(--cek-text-color-0);
}
	
#control {
	border: var(--cek-form-control-border);
	border-radius: var(--cek-border-radius);
	font-size: inherit;
	font-family: inherit;
	color: inherit;
}
  
#control:focus {
	outline: var(--cek-focus-ring);
	outline-offset: var(--cek-focus-ring-offset);
}

#error {
color: var(--cek-text-color-error);
}

:host([help]) #help,
:host([error]) #error {
margin-block-start: var(--cek-space-2);
}

:host([error]) #control {
border-color: var(--cek-border-color-error);
}

:host([error]) #control:focus {
  outline-color: var(--cek-border-color-error);
}

:host([resize="none"]) #control {
	resize: none;
}

dialog {
	position: fixed;
	outline: none;
	padding: 0;
	margin: 0;
	border: var(--cek-border);
	box-shadow:  var(--cek-shadow-3);
	border-radius: var(--cek-border-radius);
	background-color: var(--cek-surface-color-0);
}
`;

export class DatePicker extends HTMLElement {
	static get observedAttributes() {
		return [];
	}

	#popoverElement;
	#popover;
	// #triggerHostElement;
	#triggerButtonElement;

	constructor() {
		super();
		if (!this.shadowRoot) {
			this.attachShadow({ mode: "open" });
			this.shadowRoot.innerHTML = `<style>${datePickerStyles}</style>${datePickerTemplate}`;
		}
		this.#initializeElements();
		this.#initializePopover();
		this.#initializeCalendar();
		this.#initializeToggleButton();
	}

	#initializeElements() {
		this.#popoverElement = this.shadowRoot.querySelector("[part=popover]");
		this.#triggerButtonElement = this.shadowRoot.querySelector(
			"[part=toggle-button]",
		);
		this.#triggerButtonElement.setAttribute("aria-haspopup", "true");
		this.#triggerButtonElement.setAttribute("aria-expanded", "false");
	}

	#initializeCalendar() {
		const calendarContainer = this.shadowRoot.querySelector(
			"#calendar-container",
		);
		renderCalendar(calendarContainer, new Date());
		initializeCalendarNavigation(calendarContainer, this);
	}

	#initializeToggleButton() {
		const toggleButton = this.shadowRoot.querySelector("#toggle");
		toggleButton.addEventListener("click", () => {
			if (this.open) {
				this.hide();
			} else {
				this.show({ focusOnMenuItem: true });
			}
		});
	}

	#initializePopover() {
		this.#popover = createPopover({
			anchorElement: this.#triggerButtonElement,
			popoverElement: this.#popoverElement,
			placement: this.placement,
			offset: this.offset,
			popoverWidth: this.popoverWidth ?? "content-width",
		});
	}

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

			this.#triggerButtonElement.setAttribute("aria-expanded", "true");
			// this.#triggerHostElement.setAttribute("open", "");
			this.setAttribute("open", "");

			renderCalendar(
				this.shadowRoot.querySelector("#calendar-container"),
				new Date(),
			);
			const today = this.shadowRoot.querySelector(
				`[data-date="${new Date().toISOString().split("T")[0]}"]`,
			);
			today?.focus();
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
		// this.#triggerHostElement.removeAttribute("open");
		this.removeAttribute("open");
	}

	// show({ focusOnMenuItem = true, onOpenMenuItemIndexToFocus = 0, force = false }) {
	//     // ...existing show logic...
	//     // Render or update calendar view if needed
	//     renderCalendar(this.shadowRoot.querySelector('#calendar-container'), new Date());
	//     if (focusOnMenuItem) {
	//         // Focus the current date
	//         const today = this.shadowRoot.querySelector(`[data-date="${new Date().toISOString().split('T')[0]}"]`);
	//         today?.focus();
	//     }
	// }
}

customElements.define("cek-date-picker", DatePicker);
