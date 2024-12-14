export const formTemplate = () => /*css*/ `
	<slot></slot>
`;

export const formStyles = /*css*/ `
`;

class Form extends HTMLElement {
	static get observedAttributes() {
		return [
			"loading",
			"fetch-trigger",
			"fetch-swap",
			"fetch-target",
			"fetch-indicator",
			"fetch-confirm",
			"fetch-redirect",
			"fetch-replace-url",
		];
	}

	#form;
	#fetchConfig;

	constructor() {
		super();
		if (!this.shadowRoot) {
			this.attachShadow({ mode: "open" });
			this.shadowRoot.innerHTML = `<style>${formStyles}</style>${formTemplate()}`;
		}
		this.#form = this.shadowRoot.querySelector("form");
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
		this.#form.addEventListener("submit", this.#handleSubmit);
		this.#form.validateOnChange =
			this.hasAttribute("validate-on-change") &&
			this.getAttribute("validate-on-change") !== false;
		this.#form.validateOnInputAfterSubmit =
			this.getAttribute("validate-on-input-after-submit") !== "false";

		this.#fetchConfig = {
			trigger: this.getAttribute("fetch-trigger") ?? "submit",
			swap: this.getAttribute("fetch-swap") ?? "afterbegin",
			indicator: this.getAttribute("fetch-indicator")
				? this.getAttribute("fetch-indicator")
				: (this.#form.querySelector("cek-button[type='submit']") ?? null),
			confirm: this.getAttribute("fetch-confirm"),
		};
	}

	#handleSubmit = (event) => {
		console.log("handleSubmit > event", event);
		// this is flakey to select like this and maybe a lot of code could be a component in other code?
		const existingErrorSummaryElement =
			document.querySelector("[role='alert']");
		existingErrorSummaryElement?.remove();
		event.preventDefault();
		this.#form.submitted = true;
		const invalidMessages = [];
		let firstInvalidField;
		for (const field of this.#form.elements) {
			if (field.hasAttribute("name")) {
				field.validate();
				if (field.error) {
					invalidMessages.push({
						message: field.error,
						name: field.getAttribute("name"),
					});
				}
				// console.log('handleSubmit > validate > field.checkValidity()', field.checkValidity())
				if (!field.checkValidity() && !firstInvalidField) {
					firstInvalidField = field;
					if (this.showErrorSummary) {
						firstInvalidField.focus();
					}
				}
			}
		}
		console.log("invalidMessages", invalidMessages);

		if (invalidMessages.length >= 1 && !this.showErrorSummary) {
			const existingErrorSummaryElement =
				this.#form.querySelector("[role='alert']");
			if (existingErrorSummaryElement) {
				existingErrorSummaryElement.remove();
			}
			const errorSummaryElement = document.createElement("div");
			const headingElement = document.createElement("h2");
			headingElement.textContent = "There is a problem";
			errorSummaryElement.appendChild(headingElement);
			errorSummaryElement.setAttribute("role", "alert");
			errorSummaryElement.setAttribute("tabindex", "-1"); // Make the element focusable
			const errorListElement = document.createElement("ul");
			errorListElement.setAttribute("role", "list");
			errorSummaryElement.appendChild(errorListElement);
			for (const { message, name } of invalidMessages) {
				const errorListItemElement = document.createElement("li");
				errorListItemElement.setAttribute("role", "listitem");
				const errorButton = document.createElement("button");
				errorButton.setAttribute("type", "button");
				errorButton.id = `error-${name}`;
				errorButton.textContent = message;
				errorButton.style.cursor = "pointer"; // Make the button look clickable
				errorButton.addEventListener("click", () => {
					const field = this.#form.querySelector(`[name="${name}"]`);
					if (field) {
						field.focus();
					}
				});
				errorListElement.appendChild(errorListItemElement);
				errorListItemElement.appendChild(errorButton);
			}
			// this.form.append(errorSummaryElement);
			// debugger;
			// get host element
			// this.getParentElement().appendChild(errorSummary);
			// this.parentElement.prepend(errorSummaryElement, errorSummaryElement);
			this.insertAdjacentElement("beforebegin", errorSummaryElement);
			const field = document.querySelector(
				`button[id=error-${invalidMessages[0].name}]`,
			);
			if (field) {
				field.focus();
			}

			// errorSummaryElement.focus(); // Set focus on the error summary element
		} else if (invalidMessages.length === 1) {
			const field = this.#form.querySelector(
				`[name="${invalidMessages[0].name}"]`,
			);
			if (field) {
				field.focus();
			}
		}

		// console.log('this.form.checkValidity()',this.form.checkValidity())
		if (this.#form.checkValidity()) {
			// this.form.requestSubmit();
			// this.#fetchIfy();
		}
	};
}

customElements.define("cek-form", Form);
