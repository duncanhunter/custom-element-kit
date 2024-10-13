export const badgeTemplate = /*html*/ `
<div part="wrapper" role="status">
	<slot></slot>
</div>
`;

export const badgeStyles = /*css*/ `
[part=wrapper] {
	display: inline;
    border: none;
    padding-inline: var(--cek-space-3);
    padding-block: var(--cek-space-2);
	border-radius: var(--cek-border-radius-pill);
	color: white;
	font-size: var(--cek-font-size-0);
	line-height: var(--cek-line-height);
}

:host([variant=primary]) [part=wrapper] {
	background-color: var(--cek-color-primary-600);
}

:host([variant=danger]) [part=wrapper] {
	background-color: var(--cek-color-red-600);
}

:host([variant=success]) [part=wrapper] {
	background-color: var(--cek-color-green-600);
}

:host([variant=warning]) [part=wrapper] {
	background-color: var(--cek-color-orange-600);
}
`;

class Badge extends HTMLElement {
	constructor() {
		super();
		if (!this.shadowRoot) {
			this.attachShadow({ mode: "open" });
			this.shadowRoot.innerHTML = `<style>${badgeStyles}</style>${badgeTemplate}`;
		}
	}
}

customElements.define("cek-badge", Badge);
