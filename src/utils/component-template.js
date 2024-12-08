export const buttonTemplate = /*html*/ `
  <button part="button">
    <slot name="start"></slot>
    <div part="label"><slot></slot></div>
    <slot name="end"></slot>
  </button>
`;

export const buttonStyles = /*css*/ `
:host {
	display: inline-block;
}`

export class Button extends HTMLElement {
    static get observedAttributes() {
        return [];
    }
    static formAssociated = true;

    constructor() {
        super();

        if (!this.shadowRoot) {
            this.attachShadow({ mode: "open", delegatesFocus: true });
            this.shadowRoot.innerHTML = `<style>${buttonStyles}</style>${buttonTemplate}`;
        }

        this.internals = this.attachInternals();
    }

    get #type() {
        return this.getAttribute("type");
    }

    connectedCallback() {
        this.buttonElement.addEventListener("click", this.onClick);
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (newValue === oldValue) return;
    }

    onClick = (event) => {
        event.stopImmediatePropagation();
        event.stopPropagation();
        if (this.hasAttribute("loading") || this.hasAttribute("disabled")) {
            return;
        }
        const clone = new event.constructor(event.type, event);
        this.dispatchEvent(clone);
    };

}

customElements.define("cek-button", Button);
