export const dialogTemplate = () => /* html */ `
  <dialog part="dialog" id="dialog">
    <button part="close-button" type="button" id="close" autofocus>Close</button>
    <slot></slot>
  </dialog>
`;

export const dialogStyles = /* css */ "";

class Dialog extends HTMLElement {
	static get observedAttributes() {
		return [];
	}

	#closeButtonElement;

	constructor() {
		super();

		if (!this.shadowRoot) {
			this.attachShadow({ mode: "open", delegatesFocus: true });
			this.shadowRoot.innerHTML = `<style>${dialogStyles}</style>${dialogTemplate()}`;
		}

		this.#closeButtonElement = this.shadowRoot.getElementById("close");
		// this.#closeButtonElement.addEventListener("click", (event) => {
		// 	event.preventDefault();
		// 	this.close();
		// });
	}

	get dialog() {
		return this.shadowRoot.getElementById("dialog");
	}

	connectedCallback() {
		this.dialog.addEventListener("close", this.#handleClose);
		this.#closeButtonElement.addEventListener("click", this.close);
	}

	disconnectedCallback() {
		this.dialog.removeEventListener("close", this.#handleClose);
		this.#closeButtonElement.removeEventListener("click", this.close);
	}

	// attributeChangedCallback(name, _oldValue, newValue) {
	// 	if (name === "name") {}
	// }

	close = (result) => {
		this.dialog.close(result);
	};

	showModal(data) {
		document.body.toggleAttribute("inert");
		this.dialog.showModal();
	}

	#handleClose = (event) => {
		event.preventDefault();
		this.dialog.close(event.detail ?? "cancel");
		document.body.toggleAttribute("inert");
	};
}

customElements.define("cek-dialog", Dialog);
