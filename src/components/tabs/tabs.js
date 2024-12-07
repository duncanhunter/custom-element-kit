const tabsStyles = /* css */ `
<style>
:host {
	display: block;
	font-family: var(--cek-font-family, sans-serif);
	font-size: var(--cek-font-size-1, 14px);
	color: var(--cek-text-color-0, #000);
}

#tablist {
	display: flex;
	background: #f0f0f0; /* Light grey background for the tab container */
	border-radius: var(--cek-border-radius, 4px);
	padding: 4px;
	gap: 4px;
}

::slotted(cek-tab) {
	flex: 1 1 auto;
}

#panels {
	margin-top: 8px;
}
</style>
`;

const tabsTemplate = /* html */ `
<div id="tablist" role="tablist">
  <slot name="tab"></slot>
</div>
<div id="panels">
  <slot name="panel"></slot>
</div>
`;

const tabStyles = /* css */ `
<style>
:host {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	padding: 8px 12px;
	background: transparent;
	border: none;
	border-radius: var(--cek-border-radius, 4px);
	font-family: inherit;
	font-size: inherit;
	color: inherit;
	outline: none;
	position: relative;
	transition: background 0.2s ease, color 0.2s ease;
}

:host([aria-selected="true"]) {
	background: var(--cek-surface-1, #fff);
	font-weight: bold;
	color: #333; /* Darker font for active tab */
	border-bottom: 2px solid var(--cek-border-color, #333);
}

:host(:focus) {
	outline: 2px solid var(--cek-border-color, #333);
}
</style>
`;

const tabTemplate = /* html */ `
<slot></slot>
`;

const panelStyles = /* css */ `
<style>
:host {
	display: none;
}
:host([active]) {
	display: block;
}
</style>
`;

const panelTemplate = /* html */ `
<slot></slot>
`;

class Tabs extends HTMLElement {
    static get observedAttributes() {
        return [];
    }

    #tabs = [];
    #panels = [];

    #onKeyDown = (event) => {
        const { key } = event;
        const currentIndex = this.#tabs.indexOf(document.activeElement);
        if (currentIndex === -1) return;

        let newIndex = null;
        if (key === 'ArrowRight') {
            newIndex = (currentIndex + 1) % this.#tabs.length;
        } else if (key === 'ArrowLeft') {
            newIndex = (currentIndex - 1 + this.#tabs.length) % this.#tabs.length;
        } else if (key === 'Home') {
            newIndex = 0;
        } else if (key === 'End') {
            newIndex = this.#tabs.length - 1;
        } else if (key === 'Enter' || key === ' ') {
            this.#selectTab(this.#tabs[currentIndex]);
            event.preventDefault();
            return;
        }

        if (newIndex !== null) {
            this.#tabs[newIndex].focus();
            event.preventDefault();
        }
    };

    #onClick = (event) => {
        const tab = event.target.closest('cek-tab');
        if (tab) {
            this.#selectTab(tab);
            tab.focus();
        }
    };

    constructor() {
        super();
        if (!this.shadowRoot) {
            const root = this.attachShadow({ mode: "open", delegatesFocus: true });
            root.innerHTML = `${tabsStyles}${tabsTemplate}`;
        }
    }

    connectedCallback() {
        this.#collectTabsAndPanels();
        this.#setInitialSelection();
        this.addEventListener('keydown', this.#onKeyDown);
        this.addEventListener('click', this.#onClick);
    }

    disconnectedCallback() {
        this.removeEventListener('keydown', this.#onKeyDown);
        this.removeEventListener('click', this.#onClick);
    }

    #collectTabsAndPanels() {
        const tabSlot = this.shadowRoot.querySelector('slot[name="tab"]');
        const panelSlot = this.shadowRoot.querySelector('slot[name="panel"]');
        this.#tabs = tabSlot.assignedElements();
        this.#panels = panelSlot.assignedElements();

        this.#tabs.forEach((tab, index) => {
            const panel = this.#panels[index];
            const tabId = tab.id || `tab-${index}`;
            const panelId = panel.id || `panel-${index}`;
            tab.id = tabId;
            panel.id = panelId;

            tab.setAttribute('role', 'tab');
            tab.setAttribute('aria-controls', panelId);
            tab.setAttribute('tabindex', index === 0 ? '0' : '-1');

            panel.setAttribute('role', 'tabpanel');
            panel.setAttribute('aria-labelledby', tabId);
        });
    }

    #setInitialSelection() {
        const selectedTab = this.#tabs.find(tab => tab.getAttribute('aria-selected') === 'true');
        if (!selectedTab && this.#tabs.length > 0) {
            this.#selectTab(this.#tabs[0]);
        } else if (selectedTab) {
            this.#selectTab(selectedTab);
        }
    }

    #selectTab(tabToSelect) {
        this.#tabs.forEach((tab, index) => {
            const selected = (tab === tabToSelect);
            tab.setAttribute('aria-selected', selected ? 'true' : 'false');
            tab.setAttribute('tabindex', selected ? '0' : '-1');

            const panel = this.#panels[index];
            if (panel) {
                if (selected) {
                    panel.setAttribute('active', '');
                } else {
                    panel.removeAttribute('active');
                }
            }
        });
    }
}

class Tab extends HTMLElement {
    constructor() {
        super();
        if (!this.shadowRoot) {
            const root = this.attachShadow({ mode: "open" });
            root.innerHTML = `${tabStyles}${tabTemplate}`;
        }
    }
}

class TabPanel extends HTMLElement {
    constructor() {
        super();
        if (!this.shadowRoot) {
            const root = this.attachShadow({ mode: "open" });
            root.innerHTML = `${panelStyles}${panelTemplate}`;
        }
    }
}

customElements.define('cek-tabs', Tabs);
customElements.define('cek-tab', Tab);
customElements.define('cek-tab-panel', TabPanel);

/*
    Example Usage (in HTML):

    <cek-tabs>
      <cek-tab slot="tab" aria-selected="true">Account</cek-tab>
      <cek-tab slot="tab">Password</cek-tab>

      <cek-tab-panel slot="panel">
        <p>Account content goes here.</p>
      </cek-tab-panel>
      <cek-tab-panel slot="panel">
        <p>Password content goes here.</p>
      </cek-tab-panel>
    </cek-tabs>
*/