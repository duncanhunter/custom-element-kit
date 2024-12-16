/**
 * A custom button element that can be used as a form-associated custom element or a link.
 *
 * @element cek-button
 * @attribute {string} type - Sets the button type. Possible values are `button`, `submit`, and `reset`. Defaults to `button`.
 * @attribute {boolean} disabled - Disables the button when present.
 * @attribute {boolean} loading - Shows a loading indicator when present.
 * @attribute {string} variant - Sets the styling variant of the button. Possible values are `primary`, `secondary`, `outline`, `ghost`, `link`, `destructive`, `neutral`.
 * @attribute {string} size - Sets the size of the button. Possible values are `small`, `medium`, and `large`.
 * @attribute {boolean} icon-only - If present, styles the button for icon-only display without text.
 * @attribute {boolean} pill - If present, styles the button with a pill shape.
 * @attribute {boolean} circle - If present, styles the button with a circle shape.
 * @attribute {string} button-aria-label - Sets an ARIA label for accessibility.
 * @attribute {string} command - The command to execute when the button is clicked. The command should match a public method name of the target element.
 * @attribute {string} commandfor - The ID of the element to execute the command on. If set to `parent`, the command will be executed on the parent element.
 *
 * @slot start - Content to display before the button's text (e.g., icons).
 * @slot end - Content to display after the button's text (e.g., icons).
 *
 * @event click - Dispatched when the button is activated. For a link, dispatched upon navigation activation.
 *
 * @method focus - Moves keyboard focus to the button or anchor.
 *
 * @csspart button - The internal button element that can be styled externally.
 * @csspart loading-text - The loading-text.
 */

const buttonAttributes = [
	"type",
	"disabled",
	"button-aria-label",
	"value",
	"autofocus",
	"command",
	"commandfor",
	"variant",
	"size",
	"icon-only",
	"pill",
	"circle",
	"loading",
	"loading-text",
	"autocomplete",
];

export const buttonTemplate = (attributes = {}) => {
	const buttonAtts = buttonAttributes
		.filter((attr) => attributes[attr] !== undefined)
		.map((attr) => {
			if (attr === "disabled") {
				return `aria-disabled="${!!attributes[attr]}"`;
			}
			if (attr === "button-aria-label") {
				return `aria-label="${attributes[attr]}"`;
			}
			return `${attr}="${attributes[attr]}"`;
		})
		.join(" ");
	const loadingText = attributes["loading-text"] || "";
	const ariaBusy = attributes.loading ? `aria-busy="true"` : "";

	return /*html*/ `
		<button class="cek-button" part="button" ${buttonAtts} ${ariaBusy}>
		<slot name="start"></slot>
		<slot></slot>
		<span part="loading-text">${loadingText}</span>
		<slot name="end"></slot>
		</button>
	`;
};

export const buttonStyles = /*css*/ `
:host {
  	display: inline-block;
}

.cek-button {
	font-family: var(--cek-font-family);
  	display: inline-flex;
  	align-items: center;
  	justify-content: center;
  	position: relative;
  	background: transparent;
  	border: none;
  	padding-inline: 0.6rem;
  	margin: 0;
  	font: inherit;
  	color: var(--cek-text-color-1);
  	cursor: pointer;
  	box-sizing: border-box;
  	text-decoration: none;
	  gap: 0.5ch;
}

.cek-button:not([loading-text]) [part="loading-text"] {
	display: none;
}

.cek-button[size="small"] {
    --spinner-size: 0.8rem;
    --spinner-border-width: 0.125rem;
	min-height: var(--cek-height-small);
	min-width: var(--cek-height-small);
	font-size: var(--cek-font-size-0);
}

.cek-button:not([size]),
.cek-button[size="medium"] {
    --spinner-size: 1.3rem;
    --spinner-border-width: 0.1875rem;
	min-height: var(--cek-height-medium);
	min-width: var(--cek-height-medium);
	font-size: var(--cek-font-size-1);
}

.cek-button[size="large"] {
    --spinner-size: 1.8rem;
    --spinner-border-width: 0.25rem;
	min-height: var(--cek-height-large);
	min-width: var(--cek-height-large);
	font-size: var(--cek-font-size-2);
}

.cek-button cek-icon {
    font-size: var(--icon-size);
    width: 1em;
    height: 1em;
}

.cek-button[variant] {
  	border-radius: var(--cek-border-radius);
  	padding-inline: var(--cek-padding-inline);
}

.cek-button[variant]:focus {
  	outline: var(--cek-focus-ring);
  	outline-offset: var(--cek-focus-ring-offset);
}

.cek-button[loading],
.cek-button[aria-disabled="true"] {
	cursor: not-allowed;
}

.cek-button[variant][disabled],
.cek-button[aria-disabled="true"] {
	background-color: var(--cek-surface-color-2);
	color: var(--cek-text-color-2);

	&:focus {
		outline-color: var(--cek-surface-color-2);
	}
	
	&:hover {
		outline-color: var(--cek-surface-color-3);
		background-color: var(--cek-surface-color-3)
	};
}

.cek-button[loading]::after {
    content: "";
    position: absolute;
    width: var(--spinner-size, 1.5rem);
    height: var(--spinner-size, 1.5rem);
	border: 2px solid var(--cek-color-gray-100);
	border-top-color: var(--cek-color-gray-400); 
    border-radius: 50%;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(0deg);
    animation: spin 0.75s linear infinite;
    pointer-events: none;
}

.cek-button[variant="neutral"][loading]::after,
.cek-button[variant="secondary"][loading]::after {
	border-color: light-dark(var(--cek-color-gray-400), var(--cek-color-gray-100));
	border-top-color: light-dark(var(--cek-color-gray-100),var(--cek-color-gray-400)); 
}

.cek-button[loading][loading-text]:not([loadin-text=""]) [part="loading-text"] {
    display: flex;
}

.cek-button[loading]:not([loading-text]) [part="loading-text"],
.cek-button[loading-text]:not([loading]) [part="loading-text"] {
    display: none;
}

.cek-button[loading][loading-text] slot:not([name]) {
    display: none;
}

@keyframes spin {
    from {
        transform: translate(-50%, -50%) rotate(0deg);
    }
    to {
        transform: translate(-50%, -50%) rotate(360deg);
    }
}

@media (prefers-reduced-motion: reduce) {
    .cek-button[loading]::after {
        animation: none;
        border-top: none;
		border: none;
    }
}

.cek-button[icon-only] {
	padding: 0;
}

.cek-button[icon-only][loading]::after {
    width: var(--spinner-size, 1.5rem);
    height: var(--spinner-size, 1.5rem);
    border-width: var(--spinner-border-width, 0.1875rem);
}

.cek-button[variant="primary"] {
    background-color: var(--cek-color-primary-500);
    color: white;
}

.cek-button[variant="primary"]:hover {
    filter: brightness(85%);
}

.cek-button[variant="secondary"] {
    background-color: var(--cek-surface-color-1);
    color: var(--cek-text-color-1);
}

.cek-button[variant="secondary"]:hover {
    filter: brightness(85%);
}

.cek-button[variant="outline"] {
    background-color: transparent;
    border: 1px solid var(--cek-border-color-2);
    color: var(--cek-text-color-1);
}

.cek-button[variant="outline"]:hover {
    text-decoration: underline;
}

.cek-button[variant="ghost"] {
    background: transparent;
    color: var(--cek-text-color-1);
}

.cek-button[variant="ghost"]:hover {
    background-color: var(--cek-surface-color-1);
}

.cek-button[variant="link"] {
    background-color: transparent;
    color: var(--cek-color-primary-500);
    padding: 0;
    margin: 0;
    min-height: 0;
    min-width: 0;
}

.cek-button[variant="link"]:hover {
    text-decoration: underline;
}

.cek-button[variant="destructive"] {
    background-color: var(--cek-color-red-600);
    color: white;
}

.cek-button[variant="destructive"]:hover {
    filter: brightness(85%);
}

.cek-button[variant="destructive"]:focus {
    outline: 2px solid var(--cek-color-red-600);
}

.cek-button[variant="neutral"] {
    background-color: var(--cek-color-neutral);
    color: var(--cek-text-color-neutral);
}

.cek-button[variant="neutral"]:hover {
    filter: brightness(85%);
}

.cek-button[variant="neutral"]:focus {
    outline-color: var(--cek-color-neutral);
}

.cek-button[variant="icon"] {
    padding: var(--cek-space-2);
    margin: 0;
}

.cek-button[pill] {
    border-radius: 50px;
}

.cek-button[circle] {
    border-radius: 50%;
    padding: 0;
    width: var(--cek-height-medium);
    height: var(--cek-height-medium);
}
`;

export class Button extends HTMLElement {
	static formAssociated = true;
	static get observedAttributes() {
		return [...buttonAttributes];
	}

	#internals;

	constructor() {
		super();
		this.#internals = this.attachInternals();
		if (!this.shadowRoot) {
			this.attachShadow({ mode: "open", delegatesFocus: true });
			this.shadowRoot.innerHTML = `<style>${buttonStyles}</style>${buttonTemplate(this.#attributes)}`;
		}
	}

	/**
	 * The type of the button, used during form submission.
	 * @type {string}
	 */
	get type() {
		return this.getAttribute("type") || "button";
	}

	set type(value) {
		this.setAttribute("type", value);
	}

	/**
	 * Whether the button is in a loading state.
	 * @type {boolean}
	 */
	get loading() {
		return this.hasAttribute("loading");
	}

	set loading(value) {
		value ? this.setAttribute("loading", "") : this.removeAttribute("loading");
	}

	/**
	 * Whether the button is disabled.
	 * @type {boolean}
	 */
	get disabled() {
		return this.hasAttribute("disabled");
	}

	set disabled(value) {
		if (value) {
			this.setAttribute("disabled", "");
		} else {
			this.removeAttribute("disabled");
		}
	}

	get #attributes() {
		const attributes = {};
		for (const { name, value } of this.attributes) {
			attributes[name] = value;
		}
		return attributes;
	}

	get #button() {
		return this.shadowRoot.querySelector("button");
	}

	get #loadingTextElement() {
		return this.shadowRoot.querySelector("[part=loading-text]");
	}

	connectedCallback() {
		this.#button.addEventListener("click", this.#onClick);
		this.#copyButtonAttributes();
	}

	disconnectedCallback() {
		this.#button?.removeEventListener("click", this.#onClick);
	}

	attributeChangedCallback(name, oldValue, newValue) {
		if (buttonAttributes.includes(name) || name === "loading") {
			this.#copyButtonAttributes();
		}
	}

	formDisabledCallback(disabled) {
		this.disabled = disabled;
	}

	formResetCallback() {
		this.loading = false;
	}

	/**
	 * Sets focus to the button or anchor element.
	 */
	focus() {
		this.#button.focus();
	}

	#copyButtonAttributes() {
		for (const buttonAttribute of buttonAttributes) {
			const newAttribute =
				buttonAttribute === "button-aria-label"
					? "aria-label"
					: buttonAttribute;

			if (buttonAttribute === "disabled") {
				if (this.hasAttribute("disabled")) {
					this.#button.setAttribute("aria-disabled", "true");
				} else {
					this.#button.removeAttribute("aria-disabled");
				}
			} else if (buttonAttribute === "loading") {
				if (this.hasAttribute("loading")) {
					this.#button.setAttribute("aria-busy", "true");
					this.#button.setAttribute("loading", "true");
				} else {
					this.#button.removeAttribute("aria-busy");
					this.#button.removeAttribute("loading");
				}
			} else if (buttonAttribute === "loading-text") {
				if (this.hasAttribute("loading-text")) {
					this.#loadingTextElement.textContent =
						this.getAttribute("loading-text");
				} else {
					this.#loadingTextElement.textContent = "";
				}
			} else if (this.hasAttribute(buttonAttribute)) {
				this.#button.setAttribute(
					newAttribute,
					this.getAttribute(buttonAttribute),
				);
				// Note: If no attribute is on the host then set these defaults or remove them.
			} else if (buttonAttribute === "type" && !this.hasAttribute("href")) {
				this.#button.type = "text";
			} else if (buttonAttribute === "autocomplete") {
				this.#button.setAttribute("autocomplete", "off");
			} else {
				this.#button.removeAttribute(newAttribute);
			}
		}
	}

	#findClosestCustomElementHost() {
		let node = this.parentElement;
		while (node && !node.tagName?.startsWith("CEK-")) {
			node = node.parentElement;
		}
		return node;
	}

	#onClick = (event) => {
		if (this.disabled || this.loading) {
			event.preventDefault();
			return;
		}

		if (this.type === "submit") {
			this.#internals.form?.requestSubmit();
		} else if (this.type === "reset") {
			this.#internals.form?.reset();
		}

		this.dispatchEvent(
			new CustomEvent("click", { bubbles: true, composed: true }),
		);

		const commandFor = this.getAttribute("commandfor");
		const command = this.getAttribute("command");
		if (commandFor && command) {
			const target =
				commandFor === "parent"
					? this.#findClosestCustomElementHost()
					: this.ownerDocument.getElementById(commandFor);

			if (target) {
				const customEvent = new CustomEvent("command", {
					bubbles: false,
					composed: true,
					cancelable: true,
					detail: { source: this, command: command },
				});
				customEvent.command = command;
				customEvent.invoker = this;
				target.dispatchEvent(customEvent);
			}
		}

		const clone = new event.constructor(event.type, event);
		this.dispatchEvent(clone);
	};
}

customElements.define("cek-button", Button);
