export const separatorStyles = /*css*/ `
:host(:not([vertical])) {
    display: block;
    border-top: solid var(--cek-space-0) var(--cek-border-color);
    margin-block: var(--cek-space-1);
}

:host([vertical]) {
	display: inline-block;
    height: 000%;
    border-left: solid var(--cek-space-1) var(--cek-border-color);
    margin-inline: var(--cek-space-2);
}
`;

class Separator extends HTMLElement {
	static get observedAttributes() {
		return ["orientation"];
	}

	constructor() {
		super();
		if (!this.shadowRoot) {
			this.attachShadow({ mode: "open" });
			this.shadowRoot.innerHTML = `<style>${separatorStyles}</style>`;
		}
	}

	get orientation() {
		return this.getAttribute("orientation");
	}

	set orientation(value) {
		this.setAttribute("orientation", value);
	}

	attributeChangedCallback(name, _oldValue, newValue) {
		if (name === "orientation") {
			this.setAttribute(
				"aria-orientation",
				newValue === "horizontal" ? "horizontal" : "vertical",
			);
		}
	}

	connectedCallback() {
		this.setAttribute("role", "separator");
		if (this.orientation) {
			this.setAttribute("orientation", "horizontal");
		}
	}
}

customElements.define("cek-separator", Separator);
