export class Form extends HTMLElement {
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
		const style = document.createElement("style");
		style.innerHTML = /* css */ `
			form {
				display: grid;
				grid-template-columns: 1fr;
				grid-gap: var(--cek-space-4);
				margin-block: var(--cek-space-4);
			}`;
		this.appendChild(style);
		this.#form = document.createElement("form");
		this.#form.setAttribute("novalidate", "");
	}

	get showErrorSummary() {
		const attribute = this.getAttribute("show-error-summary");
		return attribute !== null && attribute !== "false";
	}

	get loading() {
		return this.getAttribute("loading");
	}
	set loading(value) {
		value ? this.setAttribute("loading", "") : this.removeAttribute("loading");
	}

	connectedCallback() {
		this.#moveFormFieldsIntoForm();
		// this.configureFormChangeEvents();
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

	handleEvent() {
		if (this.hasAttribute("disabled")) {
			return;
		}
	}

	attributeChangedCallback(name, oldValue, newValue) {
		if (name === "disabled") {
			this.#form.disabled = newValue !== null;
		}
		if (name === "id") {
			this.#form.setAttribute("id", newValue);
		}
		if (name === "fetch") {
			// this.fetchIfy();
		}
	}

	formData() {
		return new FormData(this.#form);
	}

	formValues() {
		return Object.fromEntries(new FormData(this.#form).entries());
	}

	#fetchIfy() {
		if (this.getAttribute("fetch")) {
			const [method, ...rest] = this.getAttribute("fetch").split(":");
			const path = rest.join(":");
			this.#fetchConfig.path = path;
			this.#fetchConfig.method = method;

			const makeRequest = () => {
				this.#fetchConfig.indicator.loading = true;
				this.#fetchConfig.target = this.#getFetchTarget();
				this.loading = true;
				fetch(this.#fetchConfig.path, {
					method: this.#fetchConfig.method,
					body: this.formData(),
				})
					.then((response) => {
						if (!response.ok) throw new Error("Fetch failed");
						return response.text();
					})
					.then((html) => {
						if (this.#fetchConfig.swap === "innerHTML") {
							this.#fetchConfig.target.innerHTML = html;
						} else if (this.#fetchConfig.swap === "outerHTML") {
							this.#fetchConfig.target.outerHTML = html;
						} else if (this.#fetchConfig.swap === "beforeend") {
							this.#fetchConfig.target.insertAdjacentHTML("beforeend", html);
						} else if (this.#fetchConfig.swap === "afterend") {
							this.#fetchConfig.target.insertAdjacentHTML("afterend", html);
						} else if (this.#fetchConfig.swap === "beforebegin") {
							this.#fetchConfig.target.insertAdjacentHTML("beforebegin", html);
						} else if (this.#fetchConfig.swap === "afterbegin") {
							this.#fetchConfig.target.insertAdjacentHTML("afterbegin", html);
						} else {
							const swapTarget = document.querySelector(this.#fetchConfig.swap);
							swapTarget.innerHTML = html;
						}
						this.#fetchConfig.indicator.loading = false;
						this.loading = false;
					})
					.catch((error) => {
						console.error(error);
						this.#fetchConfig.indicator.loading = false;
					});
			};

			this.#fetchConfig.data = this.formValues();

			if (this.#fetchConfig.confirm) {
				const confirmDialogHtml = `
							<cek-dialog>
								${this.#fetchConfig.confirm}
								<button id="yes" type="button">Yes</button>
							</cek-dialog>
						`;
				this.insertAdjacentHTML("beforeend", confirmDialogHtml);
				const dialog = this.querySelector("cek-dialog");
				const handleYes = () => {
					dialog.close("yes");
					dialog.remove();
					makeRequest();
				};
				dialog.showModal();
				const yesButtonElement = this.querySelector("#yes");
				yesButtonElement.addEventListener("keydown", (event) => {
					if (event.key === "Enter") {
						event.preventDefault();
						event.stopImmediatePropagation();
						handleYes(event);
					}
				});
				yesButtonElement.addEventListener("click", (event) => {
					handleYes(event);
				});
			} else {
				makeRequest();
			}
		}
	}

	#getFetchTarget() {
		let target;
		if (this.getAttribute("fetch-target")) {
			if (this.querySelector(this.getAttribute("fetch-target"))) {
				target = this.querySelector(this.getAttribute("fetch-target"));
			} else {
				target = document.querySelector(this.getAttribute("fetch-target"));
			}
		} else {
			target = this;
		}
		return target;
	}

	// configureFormChangeEvents() {
	// 	if (this.hasAttribute("validate-on-change")) {
	// 		this.form.setAttribute("validate-on-change", "");
	// 	}
	// 	if (this.hasAttribute("validate-dirty-on-change")) {
	// 		this.form.setAttribute("validate-dirty-on-change", "");
	// 	}
	// }

	#moveFormFieldsIntoForm() {
		for (const element of Array.from(this.querySelectorAll(":scope > *"))) {
			this.#form.appendChild(element);
		}
		this.appendChild(this.#form);
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
			this.#fetchIfy();
		}
	};
}

customElements.define("cek-form", Form);
