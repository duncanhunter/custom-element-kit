// import icons from '/icons.js';

/**
 * A template function used during SSR to produce the icon inline.
 * @param {Object} attrs - The attributes object, e.g., { name: "home", size: "1em" }.
 * @returns {string} - The rendered HTML with inline SVG and styles.
 */
export function iconTemplate(attrs = {}) {
	const iconName = attrs.name || "";
	const size = attrs.size || "24";
	const svg = icons[iconName] || "";
	return svg
		.replace(
			"<svg",
			`<svg height="${size}" width="${size}" part="icon" aria-hidden="true"`,
		)
		.toString();
}

export const iconStyles = `
:host {
  display: flex;
}
`;

export class Icon extends HTMLElement {
	static get observedAttributes() {
		return ["name", "size"];
	}

	constructor() {
		super();
		if (!this.shadowRoot) {
			this.attachShadow({ mode: "open" });
			if (!this.#serverRendered) {
				this.shadowRoot.innerHTML = `<style>${iconStyles}</style>`;
			}
		}
	}

	connectedCallback() {
		if (!this.#serverRendered) {
			this.#fetchIcon(this.name);
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

	attributeChangedCallback(attrName, oldVal, newVal) {
		if (
			["name", "size"].includes(attrName) &&
			oldVal &&
			!this.#serverRendered
		) {
			this.#fetchIcon(this.name);
		}
	}

	async #fetchIcon(name) {
		this.removeAttribute("server-rendered");
		const iconPath = window?.cekConfig
			? `${window.cekConfig().iconPath}/${name}.svg`
			: `./icons/${name}.svg`;

		try {
			const response = await fetch(iconPath);
			this.dispatchEvent(new Event("cek-load"));
			const iconMarkup = await response.text();

			const styleEl = this.shadowRoot.querySelector("style");
			if (styleEl) {
				styleEl.insertAdjacentHTML("afterend", iconMarkup);
			} else {
				this.shadowRoot.innerHTML = `<style>${iconStyles}</style>${iconMarkup}`;
			}

			const svg = this.shadowRoot.querySelector("svg");
			if (svg) {
				svg.setAttribute("part", "icon");
				svg.setAttribute("aria-hidden", "true");
				svg.style.width = this.size;
				svg.style.height = this.size;
			}
		} catch (error) {
			console.error("fetchIcon error:", error);
			this.dispatchEvent(new CustomEvent("cek-error", { detail: { error } }));
		}
	}
}

customElements.define("cek-icon", Icon);
