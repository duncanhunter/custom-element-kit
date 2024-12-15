/**
 * A custom dialog element that can be used as a modal or non-modal dialog.
 *
 * @element cek-dialog
 * @attribute {boolean} open - If present, the dialog is shown as a non-modal dialog or modal dialog if modal attribute is present.
 * @attribute {boolean} modal - If present, the dialog is shown as a modal dialog when open attribute is present.
 * @attribute {string} size - The size of the dialog. Can be "small", "medium", or "large".
 * @attribute {boolean} close-on-outside-click - If present, the dialog will close when the backdrop or outside of the dialog is clicked.
 * @attribute {boolean} no-esc-close - If present, the dialog will not close when the ESC key is pressed.
 *
 * @slot header - Content to display in the header of the dialog.
 * @slot default - The main content of the dialog.
 * @slot footer - Content to display in the footer of the dialog.
 *
 * @event close - Dispatched when the dialog is closed.
 *
 * @method show - Shows the dialog as a non-modal dialog.
 * @method showModal - Shows the dialog as a modal dialog.
 * @method close - Closes the dialog.
 */

// Note: "modal" attritbute is not for server rendering as it is not a standard attribute of the the inner dialog.
const dialogAttributes = ["open", "role"];

export const dialogTemplate = (attributes = {}) => {
	const dialogAtts = dialogAttributes
		.filter(
			(attr) =>
				attributes[attr] !== undefined &&
				!(attributes.modal && attributes.open),
		)
		.map((attr) => `${attr}="${attributes[attr]}"`)
		.join(" ");

	return /*html*/ `
		<dialog id="dialog" part="dialog" ${dialogAtts} aria-modal="${attributes.modal ? "true" : "false"}">
		  	<div id="container" part="container">
				<header part="header" id="header">
					<slot name="header"></slot>
				</header>
				<div id="content" part="content">
					<slot></slot>
				</div>
				<footer part="footer">
					<slot name="footer"></slot>
				</footer>
			</div>
		</dialog>
	`;
};

export const dialogStyles = /*css*/ `
dialog {
	z-index: 1;
	border-radius: var(--cek-border-radius-3);
	box-shadow: var(--cek-shadow-3);
	background-color: light-dark(var(--cek-surface-color-0), var(--cek-surface-color-1));
	border: none;
	margin-block: var(--cek-space-8);
    box-sizing: border-box;
	padding: 0;
	min-height: 18rem;
}

:host([open]) dialog {
	display: flex;
	margin: auto;
}

dialog[open] #container {
	display: flex;
	flex-direction: column;
	flex-grow: 1;
	margin: var(--cek-space-7);
}

dialog::backdrop {
	background-color: rgba(0, 0, 0, 0.8);
}

header, footer {
	position: sticky;
	top: 0;
	background-color: inherit;
	z-index: 2;
}

header {
	margin-block-end: var(--cek-space-6);
}

footer {
	margin-block-start: var(--cek-space-6);
	bottom: 0;
}

#content {
	overflow-y: auto;
	flex-grow: 1;
}

:host([size="small"]) dialog {
	width: 18.75rem;
}

:host(:not([size])) dialog,
:host([size="medium"]) dialog {
	width: 37.5rem;
}

:host([size="large"]) dialog {
	width: 56.25rem;
}
`;

class Dialog extends HTMLElement {
	static get observedAttributes() {
		return ["open", "role"];
	}

	constructor() {
		super();
		this.attachShadow({ mode: "open" });
		this.shadowRoot.innerHTML = `<style>${dialogStyles}</style>${dialogTemplate(this.#attributes)}`;
		// Removed binding of the private method #onKeyDown
	}

	get #dialog() {
		return this.shadowRoot.getElementById("dialog");
	}

	get #attributes() {
		let attributes = "";
		for (const { name, value } of this.attributes) {
			attributes += ` ${name}="${value}"`;
		}
		return attributes;
	}

	connectedCallback() {
		this.addEventListener("command", this.#onCommand);
		this.#dialog.addEventListener("close", this.close);
		this.#dialog.addEventListener("click", this.#onBackdropClick);
		this.#dialog.addEventListener("keydown", this.#onKeyDown.bind(this));
		this.#open();
	}

	disconnectedCallback() {
		this.removeEventListener("command", this.#onCommand);
		this.#dialog.removeEventListener("close", this.close);
		this.#dialog.removeEventListener("click", this.#onBackdropClick);
		this.#dialog.removeEventListener("keydown", this.#onKeyDown.bind(this));
	}

	attributeChangedCallback(name, _oldValue, newValue) {
		if (name === "open") {
			if (newValue === null && this.#dialog.hasAttribute("open")) {
				this.close();
			} else {
				this.#open();
			}
		}
	}

	/**
	 * Shows the dialog as a non-modal dialog.
	 * @public
	 */
	show() {
		this.#dialog.show();
		this.#autofocus();
		this.setAttribute("open", "");
		this.#dialog.setAttribute("aria-modal", "false");
	}

	/**
	 * Shows the dialog as a modal dialog.
	 * @public
	 */
	showModal() {
		this.#dialog.showModal();
		this.#autofocus();
		this.setAttribute("open", "");
		this.setAttribute("modal", "");
		this.#dialog.setAttribute("aria-modal", "true");
	}

	/**
	 * Closes the dialog.
	 * @param {string} [result] - The result to return from the dialog.
	 * @public
	 */
	close = (result = "cancel") => {
		this.#dialog.close(result);
		this.removeAttribute("open");
		this.removeAttribute("modal");
		this.dispatchEvent(
			new CustomEvent("close", { bubbles: true, composed: true }),
		);
	};

	#open() {
		if (this.hasAttribute("open") && !this.#dialog.hasAttribute("open")) {
			if (this.hasAttribute("modal")) {
				this.showModal();
			} else {
				this.show();
			}
		}
	}

	#autofocus() {
		requestAnimationFrame(() => {
			const firstAutofocusElement = this.querySelector("[autofocus]");
			if (firstAutofocusElement?.tagName.toLowerCase().startsWith("cek-")) {
				firstAutofocusElement.focus();
			}
		});
	}

	#onBackdropClick = (event) => {
		if (
			this.hasAttribute("close-on-outside-click") &&
			event.target === this.#dialog
		) {
			this.close();
		}
	};

	// Note: Listening to keydown event on the dialog element instead of dialog cancel due to chrome bug https://stackoverflow.com/questions/61021135/prevent-dialog-from-closing-on-keydown-esc-in-chrome.
	#onKeyDown(event) {
		if (this.hasAttribute("no-esc-close") && event.key === "Escape") {
			console.log("onEsc", { event });
			event.preventDefault();
			event.stopImmediatePropagation();
		}
	}

	#onCommand = (event) => {
		const method = event.command.replace(/(-\w)/g, (c) => c[1].toUpperCase());

		if (method in this) {
			this[method](event);
		}
	};
}

customElements.define("cek-dialog", Dialog);
