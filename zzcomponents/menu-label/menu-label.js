export const menuLabelTemplate = /*html*/ `
<slot name="start"></slot>
<slot></slot>
<slot name="end"></slot>
`;

export const menuLabelStyles = /*css*/ `
:host {
	border-radius: var(--cek-border-radius);
	background-color: var(--cek-surface-color-0);	
	padding: var(--cek-space-2) var(--cek-space-3);;
	margin: var(--cek-space-4);
	font: inherit;
	color: var(--cek-text-color-2);
	text-align: inherit;
	flex: auto;
	font-size: var(--cek-font-size-0);
	font-family: var(--cek-font-family);
	line-height: var(--cek-line-height);
	display: flex;
	justify-content: center;
	align-items: center;
	box-sizing: border-box;
	cursor: default;
}

slot[name=start], slot[name=end] {
    flex: 0 0 auto;
}

slot {
    flex: 1 1 auto;
    display: inline-block;
}

::slotted(cek-icon) {
	margin-inline: var(--cek-space-2);
}
`;

export class MenuLabel extends HTMLElement {
	constructor() {
		super();
		if (!this.shadowRoot) {
			this.attachShadow({ mode: "open" });
			this.shadowRoot.innerHTML = `<style>${menuLabelStyles}</style>${menuLabelTemplate}`;
		}
	}
}

customElements.define("cek-menu-label", MenuLabel);
