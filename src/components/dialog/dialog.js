/**
 * A custom dialog element that can be used as a modal or non-modal dialog.
 *
 * @element cek-dialog
 * @attribute {boolean} open - If present, the dialog is shown as a non-modal dialog or modal dialog if modal attribute is present.
 * @attribute {boolean} modal - If present, the dialog is shown as a modal dialog when open attribute is present.
 *
 * @slot header - Content to display in the header of the dialog.
 * @slot header-actions - Content to display in the header actions area.
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
const dialogAttributes = ["open"];

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
		<dialog id="dialog" part="dialog" ${dialogAtts} aria-modal="true">
			<header part="header" id="header">
				<slot name="header"></slot>
				<slot name="header-actions"></slot>
			</header>
			<div id="content" part="content">
				<slot></slot>
			</div>
			<footer part="footer">
				<slot name="footer"></slot>
			</footer>
		</dialog>
	`;
};

export const dialogStyles = /*css*/ `
dialog {
	z-index: 1;
}
`;

class Dialog extends HTMLElement {
	static get observedAttributes() {
		return ["open", "modal"];
	}

	constructor() {
		super();
		this.attachShadow({ mode: "open" });
		this.shadowRoot.innerHTML = `<style>${dialogStyles}</style>${dialogTemplate(this.#attributes)}`;
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
		this.#open();
	}

	disconnectedCallback() {
		this.removeEventListener("command", this.#onCommand);
		this.#dialog.removeEventListener("close", this.close);
	}

	attributeChangedCallback(name, oldValue, newValue) {
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

	#onCommand = (event) => {
		const method = event.command.replace(/(-\w)/g, (c) => c[1].toUpperCase());

		if (method in this) {
			this[method](event);
		}
	};
}

customElements.define("cek-dialog", Dialog);
