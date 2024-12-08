export const iconStyles = `
:host {
	display: flex;
}`;

export class Icon extends HTMLElement {
	static get observedAttributes() {
		return ["name", "size"];
	}

	constructor() {
		super();
		if (!this.shadowRoot) {
			this.attachShadow({ mode: "open" });
			this.shadowRoot.innerHTML = `<style>${iconStyles}</style>`;
		}
	}

	connectedCallback() {
		if (!this.#serverRendered) {
			this.fetchIcon(this.name);
		}
	}

	get #serverRendered() {
		return this.hasAttribute("server-rendered");
	}

	get name() {
		return this.getAttribute("name");
	}

	get size() {
		return this.getAttribute("size") || "1em";
	}

	async attributeChangedCallback(name, oldValue, newValue) {
		if (["size", "name"].includes(name) && oldValue) {
			if (!this.#serverRendered) {
				await this.fetchIcon(newValue);
			}
		}
	}

	async fetchIcon(name) {
		this.removeAttribute("server-rendered");
		try {
			const iconPath = window?.cekConfig
				? `${window?.cekConfig()?.iconPath}/${name}.svg`
				: `./../icons/${name}.svg`;
			const response = await fetch(iconPath);
			this.dispatchEvent(new Event("cek-load"));
			const icon = await response.text();
			const styleElement = this.shadowRoot.querySelector("style");
			if (styleElement) {
				styleElement.insertAdjacentHTML("afterend", icon);
			} else {
				this.shadowRoot.innerHTML = icon;
			}
			const svg = this.shadowRoot.querySelector("svg");
			svg.setAttribute("part", "icon");
			svg.setAttribute("aria-hidden", "true");
			svg.style.width = this.size;
			svg.style.height = this.size;
		} catch (error) {
			console.error("fetchIcon: ", error);
			this.dispatchEvent(new CustomEvent("cek-error", { detail: { error } }));
		}
	}
}

customElements.define("cek-icon", Icon);
