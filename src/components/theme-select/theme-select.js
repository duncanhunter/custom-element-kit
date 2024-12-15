class ThemeSelect extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: "open" });
		this.shadowRoot.innerHTML = /*html*/ `
			<style>
                :host {
                    display: inline-block;
                    font-family: var(--cek-font-family);
                }

                select[part="select"] {
                    font-size: 1em;
                    padding: 0.25em 0.5em;
                    margin-left: 0.5em;
                    border: 1px solid var(--cek-border-color-2);
                    border-radius: var(--cek-border-radius);
                    background-color: var(--cek-surface-color-1);
                    color: var(--cek-text-color-1);
                    cursor: pointer;
                }

                select[part="select"]::selection {
                    background-color: var(--cek-color-primary-500);
                    color: #fff;
                }
			</style>
			<select aria-label="Select site theme" id="theme-select" part="select">
				<option value="system">System</option>
				<option value="light">Light</option>
				<option value="dark">Dark</option>
			</select>
		`;

		this.selectElement = this.shadowRoot.getElementById("theme-select");
	}

	connectedCallback() {
		this.selectElement.addEventListener("change", this.#handleThemeChange);
		this.#initializeTheme();
	}

	disconnectedCallback() {
		this.selectElement.removeEventListener("change", this.#handleThemeChange);
	}

	#handleThemeChange = () => {
		const selectedTheme = this.selectElement.value;
		this.#applyTheme(selectedTheme);
		this.#saveThemePreference(selectedTheme);
	};

	#initializeTheme() {
		const savedTheme = localStorage.getItem("preferred-theme") || "system";
		this.selectElement.value = savedTheme;
		this.#applyTheme(savedTheme);
	}

	#applyTheme(theme) {
		if (theme === "system") {
			document.documentElement.removeAttribute("data-theme");
		} else {
			document.documentElement.setAttribute("data-theme", theme);
		}
	}

	#saveThemePreference(theme) {
		localStorage.setItem("preferred-theme", theme);
	}
}

customElements.define("cek-theme-select", ThemeSelect);
