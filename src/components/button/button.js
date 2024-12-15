/**
 * A custom button element that can be used as a form-associated custom element or a link.
 *
 * @element cek-button
 * @attribute {string} type - Sets the button type. Possible values are `button`, `submit`, and `reset`. Defaults to `button`.
 * @attribute {boolean} disabled - Disables the button when present.
 * @attribute {boolean} loading - Shows a loading indicator when present.
 * @attribute {boolean} arrow - Displays an arrow icon when present.
 * @attribute {string} variant - Sets the styling variant of the button. Possible values are `primary`, `secondary`, `outline`, `ghost`, `link`, `destructive`, `neutral`.
 * @attribute {string} size - Sets the size of the button. Possible values are `small`, `medium`, and `large`.
 * @attribute {boolean} icon-only - If present, styles the button for icon-only display without text.
 * @attribute {boolean} pill - If present, styles the button with a pill shape.
 * @attribute {boolean} circle - If present, styles the button with a circle shape.
 * @attribute {string} button-aria-label - Sets an ARIA label for accessibility.
 * @attribute {string} href - Transforms the button into an anchor element with this `href`.
 * @attribute {string} target - Sets the `target` attribute of the anchor when `href` is present. Defaults to `_self`.
 * @attribute {string} command - The command to execute when the button is clicked. The command should match a public method name of the target element.
 * @attribute {string} commandfor - The ID of the element to execute the command on. If set to `parent`, the command will be executed on the parent element.
 *
 * @slot start - Content to display before the button's text (e.g., icons).
 * @slot end - Content to display after the button's text (e.g., icons).
 *
 * @event click - Dispatched when the button is activated. For a link, dispatched upon navigation activation.
 *
 * @method focus - Moves keyboard focus to the button or anchor.
 */

const buttonAttributes = [
	"type",
	"disabled",
	"button-aria-label",
	"value",
	"href",
	"target",
	"autofocus",
	"command",
	"commandfor",
];

export const buttonTemplate = (attributes = {}) => {
	const tag = attributes.href ? "a" : "button";
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

	return /*html*/ `
		<${tag} id="button" part="button" ${buttonAtts}>
		<slot name="start"></slot>
		<div id="label" part="label"><slot></slot></div>
		<slot name="end"></slot>
		<svg id="loading-icon" part="loading-icon" width="24" height="24" viewBox="0 0 24 24" 
			xmlns="http://www.w3.org/2000/svg">
			<path d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z" opacity=".25"/>
			<path d="M10.14,1.16a11,11,0,0,0-9,8.92A1.59,1.59,0,0,0,2.46,12,1.52,1.52,0,0,0,4.11,10.7
			a8,8,0,0,1,6.66-6.61A1.42,1.42,0,0,0,12,2.69h0A1.57,1.57,0,0,0,10.14,1.16Z">
			<animateTransform attributeName="transform" type="rotate" dur="0.75s" 
				values="0 12 12;360 12 12" repeatCount="indefinite"/>
			</path>
		</svg>
		<svg id="arrow-icon" part="arrow-icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" 
			fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">  
			<path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
		</svg>
		</${tag}>
	`;
};

export const buttonStyles = /*css*/ `
:host {
  	display: inline-block;
  	font-family: var(--cek-font-family);
  	box-sizing: border-box;
}

#button {
  	display: inline-flex;
  	align-items: center;
  	justify-content: center;
  	position: relative;
  	background: transparent;
  	border: none;
  	padding: 0;
  	margin: 0;
  	font: inherit;
  	color: var(--cek-text-color-1);
  	cursor: pointer;
  	box-sizing: border-box;
  	text-decoration: none;
}

:host([variant]) #button {
  	border-radius: var(--cek-border-radius);
  	padding-inline: var(--cek-padding-inline);
}

:host([variant]) #button:focus {
  	outline: var(--cek-focus-ring);
  	outline-offset: var(--cek-focus-ring-offset);
}

:host([loading]) #button,
:host([disabled]) #button {
  	cursor: not-allowed;
}

:host([loading]) #button {
  	background-color: lightgray;
  	color: rgba(0, 0, 0, 0.5);
}

:host([disabled][variant]) #button {
  	background-color: var(--cek-surface-color-disabled);
  	color: var(--cek-text-color-disabled);

	&:focus {
		outline-color: var(--cek-surface-color-disabled);
	}
}

:host([size="small"]) #button {
  	min-height: var(--cek-height-small);
  	min-width: var(--cek-height-small);
  	font-size: var(--cek-font-size-0);
}

:host(:not([size])) #button, 
:host([size="medium"]) #button {
  	min-height: var(--cek-height-medium);
  	min-width: var(--cek-height-medium);
  	font-size: var(--cek-font-size-1);
}

:host([size="large"]) #button {
  	min-height: var(--cek-height-large);
  	min-width: var(--cek-height-large);
  	font-size: var(--cek-font-size-2);
}

:host([variant="primary"]) #button {
  	background-color: var(--cek-color-primary-500);
  	color: white;

  	&:hover {
		filter: brightness(85%);
  	}
}

:host([variant="secondary"]) #button {
 	background-color: var(--cek-surface-color-1);
 	 color: var(--cek-text-color-1);

 	 &:hover {
		filter: brightness(85%);
  	}
}

:host([variant="outline"]) #button {
	background-color: transparent;
	border: 1px solid var(--cek-border-color-2);
	color: var(--cek-text-color-1);

  	&:hover {
		text-decoration: underline;
	}
}

:host([variant="ghost"]) #button {
	background: transparent;
	color: var(--cek-text-color-1);
}

:host([variant="ghost"]) #button:hover {
	background-color: var(--cek-surface-color-1);
}

:host([variant="link"]) #button {
	background-color: transparent;
	color: var(--cek-color-primary-500);
	padding: 0;
	margin: 0;
	min-height: 0;
	min-width: 0;

  	&:hover {
  		text-decoration: underline;
  	}
}

:host([variant="destructive"]) #button {
 	background-color: var(--cek-color-red-600);
  	color: white;

	 &:hover {
		filter: brightness(85%);
  	}
}

:host([variant="destructive"]) #button:focus {
  	outline: 2px solid var(--cek-color-red-600);
}

:host([variant="neutral"]) #button {
  	background-color: var(--cek-color-neutral);
  	color: var(--cek-text-color-neutral);

	&:hover {
		filter: brightness(85%);
  	}

	&:focus {
		outline-color: var(--cek-color-neutral);
  	}
}

:host([variant="icon"]) #button {
  	padding: var(--cek-space-2);
  	margin: 0;
}

:host([pill]) #button {
  border-radius: 50px;
}

:host([circle]) #button {
  border-radius: 50%;
  padding: 0;
  width: var(--cek-height-medium);
  height: var(--cek-height-medium);
}

[name="end"]::slotted(*) {
  	margin-inline-start: 0.5ch;
}

[name="start"]::slotted(*) {
  	margin-inline-end: 0.5ch;
}

#loading-icon {
  	position: absolute;
  	display: none;
  	top: 50%;
  	left: 50%;
  	transform: translate(-50%, -50%);
}

:host([loading]) #loading-icon {
  display: block;
}

:host([icon-only]) #button {
  padding: var(--cek-space-2);
  margin: 0;
}

#arrow-icon {
  	display: none;
  	height: 1em;
  	width: 1em;
  	margin-inline-start: 0.5ch;
}

:host([arrow]) #arrow-icon {
  	display: block;
}

::slotted(cek-icon) {
	--height: 1.4em;
	--width: 1.4em;
}
`;

export class Button extends HTMLElement {
	static formAssociated = true;
	static get observedAttributes() {
		return ["loading", ...buttonAttributes];
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
			this.#button.setAttribute("aria-disabled", "true");
		} else {
			this.removeAttribute("disabled");
			this.#button.removeAttribute("aria-disabled");
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
		return this.shadowRoot.getElementById("button");
	}

	connectedCallback() {
		this.#maybeTransformToAnchor();
		if (!this.hasAttribute("href")) {
			this.#button.addEventListener("click", this.#onClick);
		}
		this.#copyButtonAttributes();
	}

	disconnectedCallback() {
		this.#button?.removeEventListener("click", this.#onClick);
	}

	attributeChangedCallback(name, oldValue, newValue) {
		if (buttonAttributes.includes(name) || name === "loading") {
			this.#maybeTransformToAnchor();
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
			} else if (this.hasAttribute(buttonAttribute)) {
				this.#button.setAttribute(
					newAttribute,
					this.getAttribute(buttonAttribute),
				);
			} else if (buttonAttribute === "type" && !this.hasAttribute("href")) {
				this.#button.type = "text";
			} else if (buttonAttribute === "autocomplete") {
				this.#button.setAttribute("autocomplete", "off");
			} else {
				this.#button.removeAttribute(newAttribute);
			}
		}
	}

	#maybeTransformToAnchor() {
		const button = this.#button;
		const shouldBeLink = this.hasAttribute("href");

		if (shouldBeLink && button.tagName.toLowerCase() === "button") {
			const anchor = document.createElement("a");
			anchor.id = "button";
			anchor.part.add("button");

			while (button.firstChild) {
				anchor.appendChild(button.firstChild);
			}

			button.replaceWith(anchor);
		} else if (!shouldBeLink && button.tagName.toLowerCase() === "a") {
			const button = document.createElement("button");
			button.id = "button";
			button.part.add("button");

			while (button.firstChild) {
				button.appendChild(button.firstChild);
			}

			button.replaceWith(button);
			button.addEventListener("click", this.#onClick);
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
