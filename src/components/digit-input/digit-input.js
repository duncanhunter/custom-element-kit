export const digitInputStyles = () => /* css */ `
[part="container"] {
    display: flex;
    align-items: center;
    gap: 0;
}

[part="group"] {
    display: flex;
}

[part="input"] {
    width: 30px;
    height: 40px;
    font-size: 24px;
    text-align: center;
    border: 1px solid #ccc;
    border-radius: 0;
    -moz-appearance: textfield;
    margin-left: -1px;
}

[part="input"]::-webkit-outer-spin-button,
[part="input"]::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
}

[part="input"]:first-child {
border-top-left-radius: 6px;
    border-bottom-left-radius: 6px;
    margin-left: 0;
}

[part="input"]:last-child {
    border-top-right-radius: 6px;
    border-bottom-right-radius: 6px;
}

[part="separator"] {
    margin: 0 10px;
    font-size: 20px;
    color: #ccc;
}

[part="input"]:focus {
    outline: none;
    box-shadow: 0 0 0 2px #007BFF;
    z-index: 1;
}

[part="input"].invalid {
    border-color: red;
}

[part="error-message"] {
    color: red;
    font-size: 12px;
    margin-top: 5px;
    display: none;
}

[part="error-message"].visible {
    display: block;
}`;

class DigitInput extends HTMLElement {
	static get observedAttributes() {
		return ["required", "group-size", "groups"];
	}
	static formAssociated = true;

	#internals;
	#groupSize;
	#groups;
	#shadow;
	#isSubmitted;

	constructor() {
		super();
		this.#internals = this.attachInternals();

		if (!this.shadowRoot) {
			this.#shadow = this.attachShadow({ mode: "open" });
		}
		this.#isSubmitted = false;
	}

	get #inputs() {
		return this.#shadow.querySelectorAll('[part="input"]');
	}

	get value() {
		return Array.from(this.#inputs)
			.map((input) => input.value)
			.join("");
	}

	set value(val) {
		if (typeof val === "string") {
			const digits = val
				.replace(/\D/g, "")
				.slice(0, this.#groupSize * this.#groups);
			const inputs = this.#inputs;
			digits.split("").forEach((digit, i) => {
				if (inputs[i]) {
					inputs[i].value = digit;
				}
			});
			this.#updateValue();
		}
	}

	get form() {
		return this.#internals.form;
	}

	get name() {
		return this.getAttribute("name");
	}

	checkValidity() {
		return this.#internals.checkValidity();
	}

	reportValidity() {
		return this.#internals.reportValidity();
	}

	connectedCallback() {
		this.#groupSize = Number.parseInt(this.getAttribute("group-size")) || 3;
		this.#groups = Number.parseInt(this.getAttribute("groups")) || 2;
		this.#render();

		this.#addEventListeners();

		if (this.hasAttribute("required")) {
			this.#internals.setValidity({ valueMissing: true }, "Number is required");
		}

		if (this.form) {
			this.form.addEventListener("submit", this.#onFormSubmit.bind(this));
			this.form.addEventListener("reset", this.#onFormReset.bind(this));
		}
	}

	disconnectedCallback() {
		for (const [index, input] of this.#inputs.entries()) {
			input.removeEventListener("beforeinput", (event) =>
				this.#onBeforeInput(event),
			);
			input.removeEventListener("input", (event) =>
				this.#onInput(event, index),
			);
			input.removeEventListener("keydown", (event) =>
				this.#onKeyDown(event, index),
			);
			input.removeEventListener("paste", (event) =>
				this.#onPaste(event, index),
			);
		}
	}

	attributeChangedCallback(name, oldValue, newValue) {
		if (name === "required") {
			const isRequired = this.hasAttribute("required");
			if (isRequired && !this.value) {
				this.#internals.setValidity(
					{ valueMissing: true },
					"Number is required",
				);
			} else {
				this.#internals.setValidity({});
			}
		} else if (name === "group-size" || name === "groups") {
			this.#groupSize = Number.parseInt(this.getAttribute("group-size")) || 3;
			this.#groups = Number.parseInt(this.getAttribute("groups")) || 2;
			this.#render();
			this.#addEventListeners();
		}
	}

	#render() {
		let groupsHtml = "";
		for (let i = 0; i < this.#groups; i++) {
			groupsHtml += `
                        <div part="group">
                            ${this.#createInputBoxes(this.#groupSize)}
                        </div>
                        ${i < this.#groups - 1 ? '<div part="separator">-</div>' : ""}
                    `;
		}

		this.#shadow.innerHTML = `
                    <style>${digitInputStyles}</style>
                    <div part="container">
                        ${groupsHtml}
                    </div>
                    <div part="error-message"></div> <!-- Error message element -->
                `;
		console.log(this.#shadow.innerHTML);
	}

	#addEventListeners() {
		for (const [index, input] of this.#inputs.entries()) {
			input.addEventListener("beforeinput", (event) =>
				this.#onBeforeInput(event),
			);
			input.addEventListener("input", (event) => this.#onInput(event, index));
			input.addEventListener("keydown", (event) =>
				this.#onKeyDown(event, index),
			);
			input.addEventListener("paste", (event) => this.#onPaste(event, index));
		}
	}

	#createInputBoxes(count) {
		let inputs = "";
		for (let i = 0; i < count; i++) {
			inputs += `<input type="number" part="input" maxlength="1" inputmode="numeric" pattern="[0-9]*" />`;
		}
		return inputs;
	}

	#onBeforeInput(event) {
		if (!/^\d$/.test(event.data)) {
			event.preventDefault();
		}
	}

	#onInput(event, index) {
		const input = event.target;
		const digitValue = input.value.replace(/\D/g, "");

		if (digitValue === "") {
			input.value = "";
		} else {
			input.value = digitValue.slice(-1);
			this.#inputs[index + 1]?.focus();
		}

		this.#updateValue();
	}

	#onKeyDown(event, index) {
		const input = event.target;
		const stopEvent = () => {
			event.preventDefault();
			event.stopImmediatePropagation();
		};
		if (event.key === "Backspace") {
			stopEvent();
			if (input.value === "") {
				const previousInput = this.#inputs[index - 1];
				if (previousInput) {
					previousInput.value = "";
					previousInput.focus();
				}
			} else {
				input.value = "";
				this.#updateValue();
			}
		} else if (event.key === "ArrowLeft") {
			const previousInput = this.#inputs[index - 1];
			if (previousInput) {
				stopEvent();
				previousInput.focus();
			}
		} else if (event.key === "ArrowRight") {
			const nextInput = this.#inputs[index + 1];
			if (nextInput) {
				stopEvent();
				nextInput.focus();
			}
		} else if (event.key === "Enter") {
			if (this.form) {
				this.form.requestSubmit();
			}
		} else if (event.key === "ArrowUp") {
			stopEvent();
			input.value = (+input.value + 1) % 10;
			this.#updateValue();
		} else if (event.key === "ArrowDown") {
			stopEvent();
			input.value = (+input.value - 1 + 10) % 10;
			this.#updateValue();
		}
	}

	#onPaste(event, index) {
		event.preventDefault();
		const paste = (event.clipboardData || window.clipboardData).getData("text");
		const digits = paste
			.replace(/\D/g, "")
			.slice(0, this.#groupSize * this.#groups);
		const inputs = this.#inputs;
		digits.split("").forEach((digit, i) => {
			if (inputs[index + i]) {
				inputs[index + i].value = digit;
			}
		});
		this.#updateValue();
		const nextInput = this.#inputs[index + digits.length];
		if (nextInput) {
			nextInput.focus();
		}
	}

	#onFormSubmit(event) {
		if (!this.checkValidity()) {
			event.preventDefault();
			event.stopPropagation();
		}
		this.#isSubmitted = true;
		this.#updateValue();
	}

	#onFormReset(event) {
		this.#isSubmitted = false;
		this.#updateValue();
		for (const input of this.#inputs) {
			input.value = "";
		}
	}

	#updateValue() {
		const otpValue = Array.from(this.#inputs)
			.map((input) => input.value)
			.join("");

		this.#internals.setFormValue(otpValue);

		let isValid = true;
		let errorMessage = "";

		if (this.hasAttribute("required")) {
			if (otpValue.length < this.#groupSize * this.#groups) {
				isValid = false;
				errorMessage =
					this.getAttribute("data-missingvalue") || "Number is incomplete";
				this.#internals.setValidity({ valueMissing: true }, errorMessage);
			} else {
				this.#internals.setValidity({});
			}
		}

		if (!isValid && this.#isSubmitted) {
			this.#shadow.querySelector('[part="error-message"]').textContent =
				errorMessage;
			this.#shadow
				.querySelector('[part="error-message"]')
				.classList.add("visible");
		} else {
			this.#shadow.querySelector('[part="error-message"]').textContent = "";
			this.#shadow
				.querySelector('[part="error-message"]')
				.classList.remove("visible");
		}

		this.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
	}
}

customElements.define("cek-digit-input", DigitInput);
