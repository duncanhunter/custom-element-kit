const tabsStyles = /* css */ `
<style>
:host {
  display: flex;
  font-family: var(--cek-font-family, sans-serif);
  font-size: var(--cek-font-size-1, 14px);
  color: var(--cek-text-color-0, #000);
}

/* Container that holds both tabs and panels */
#container {
  display: flex;
  flex: 1;
  position: relative;
}

#tablist-container {
  display: flex;
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
}

#tablist {
  display: flex;
  gap: 4px;
  align-items: center;
  background: #f0f0f0; /* Light grey background for the tab container */
  border-radius: var(--cek-border-radius, 4px);
  padding: 4px;
  flex-shrink: 0;
  scroll-behavior: smooth;
}

::slotted(cek-tab) {
  flex: 0 0 auto;
}

/* Panels container */
#panels {
  flex: 1 1 auto;
  display: flex;
}

[hidden] {
  display: none !important;
}

/* Arrow buttons for scrolling */
.scroll-button {
  background: #ccc;
  border: none;
  padding: 0.25em;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  z-index: 1;
  opacity: 0.8;
}
.scroll-button:hover {
  opacity: 1;
}

.scroll-button[hidden] {
  display: none;
}

#container {
    display: flex;
    flex: 1 1 auto;
    position: relative;
    /* Ensure the container doesn't grow beyond the viewport width */
    max-width: 100%; 
    overflow: hidden; /* This ensures the arrow buttons overlay nicely */
  }
  
  #tablist-container {
    display: flex;
    position: relative;
    flex-shrink: 1;
    flex-grow: 1;
    max-width: 100%;
    /* We keep overflow hidden here so the arrow buttons can position over the tablist. 
       The actual scrolling will be enabled on #tablist. */
    overflow: hidden;
  }
  
  #tablist {
    display: inline-flex;
    gap: 4px;
    align-items: center;
    background: #f0f0f0; /* Light grey background for the tab container */
    border-radius: var(--cek-border-radius, 4px);
    padding: 4px;
    /* Enable horizontal scrolling on the tablist itself */
    overflow-x: auto;
    overflow-y: hidden;
    white-space: nowrap;
    flex: 1 1 auto; 
    /* Make sure the tablist does not grow indefinitely and stays within container */
    max-width: 100%;
    scrollbar-width: thin; /* optional for Firefox */
  }
  
  /* Tabs themselves remain flex items that do not wrap */
  ::slotted(cek-tab) {
    flex: 0 0 auto;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
</style>
`;

const tabsTemplate = /* html */ `
<div id="container">
  <button id="scroll-prev" class="scroll-button" hidden aria-label="Scroll previous">
    <span>◀</span>
  </button>
  <button id="scroll-next" class="scroll-button" hidden aria-label="Scroll next">
    <span>▶</span>
  </button>
  <div id="tablist-container">
    <div id="tablist" role="tablist" aria-orientation="horizontal">
      <slot name="tab"></slot>
    </div>
  </div>
  <div id="panels">
    <slot name="panel"></slot>
  </div>
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

:host([active]) {
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
  flex: 1 1 auto;
}
:host([active]) {
  display: block;
}


</style>
`;

const panelTemplate = /* html */ `
<slot></slot>
`;

// Directions and their layout properties:
// top: tablist on top (horizontal), panel below
// bottom: tablist on bottom (horizontal), panel above
// start: tablist on left (vertical), panel on right
// end: tablist on right (vertical), panel on left
function getLayout(direction) {
	switch (direction) {
		case "start":
			return {
				orientation: "vertical",
				containerFlexDirection: "row",
				tablistOrder: "1",
				panelOrder: "2",
				scrollButtonsPos: {
					prev: "top:0;left:0;",
					next: "top:auto;bottom:0;left:0;",
				},
			};
		case "end":
			return {
				orientation: "vertical",
				containerFlexDirection: "row-reverse",
				tablistOrder: "1",
				panelOrder: "2",
				scrollButtonsPos: { prev: "top:0;right:0;", next: "bottom:0;right:0;" },
			};
		case "bottom":
			return {
				orientation: "horizontal",
				containerFlexDirection: "column-reverse",
				tablistOrder: "1",
				panelOrder: "2",
				scrollButtonsPos: {
					prev: "left:0;bottom:0;",
					next: "right:0;bottom:0;",
				},
			};
		default:
			return {
				orientation: "horizontal",
				containerFlexDirection: "column",
				tablistOrder: "1",
				panelOrder: "2",
				scrollButtonsPos: { prev: "left:0;top:0;", next: "right:0;top:0;" },
			};
	}
}

class Tabs extends HTMLElement {
	#tabs = [];
	#panels = [];
	#orientation = "horizontal";
	#manual = false;
	#direction = "top";

	#mutationObserver = null;
	#resizeObserver = null;

	#onKeyDown = (event) => {
		const { key } = event;
		const currentIndex = this.#tabs.indexOf(document.activeElement);
		if (currentIndex === -1) return;

		let newIndex = null;
		const isHorizontal = this.#orientation === "horizontal";

		// Navigation logic
		if (isHorizontal) {
			if (key === "ArrowRight") {
				newIndex = (currentIndex + 1) % this.#tabs.length;
			} else if (key === "ArrowLeft") {
				newIndex = (currentIndex - 1 + this.#tabs.length) % this.#tabs.length;
			}
		} else {
			// Vertical orientation
			if (key === "ArrowDown") {
				newIndex = (currentIndex + 1) % this.#tabs.length;
			} else if (key === "ArrowUp") {
				newIndex = (currentIndex - 1 + this.#tabs.length) % this.#tabs.length;
			}
		}

		if (key === "Home") {
			newIndex = 0;
		} else if (key === "End") {
			newIndex = this.#tabs.length - 1;
		}

		if (newIndex !== null) {
			event.preventDefault();
			this.#focusTab(this.#tabs[newIndex]);
			if (!this.#manual) {
				this.#selectTab(this.#tabs[newIndex]);
			}
			this.#ensureTabVisible(this.#tabs[newIndex]);
			return;
		}

		if ((key === "Enter" || key === " ") && this.#manual) {
			event.preventDefault();
			this.#selectTab(document.activeElement);
		}
	};

	#onClick = (event) => {
		const tab = event.target.closest("cek-tab");
		if (tab) {
			this.#selectTab(tab);
			tab.focus();
			this.#ensureTabVisible(tab);
		}
	};

	#onScrollPrev = () => {
		const tablist = this.shadowRoot.querySelector("#tablist");
		const amount =
			this.#orientation === "horizontal"
				? tablist.clientWidth / 2
				: tablist.clientHeight / 2;
		if (this.#orientation === "horizontal") {
			tablist.scrollLeft -= amount;
		} else {
			tablist.scrollTop -= amount;
		}
	};

	#onScrollNext = () => {
		const tablist = this.shadowRoot.querySelector("#tablist");
		const amount =
			this.#orientation === "horizontal"
				? tablist.clientWidth / 2
				: tablist.clientHeight / 2;
		if (this.#orientation === "horizontal") {
			tablist.scrollLeft += amount;
		} else {
			tablist.scrollTop += amount;
		}
	};

	#onScroll = () => {
		this.#updateScrollButtons();
	};

	constructor() {
		super();
		if (!this.shadowRoot) {
			const root = this.attachShadow({ mode: "open", delegatesFocus: true });
			root.innerHTML = `${tabsStyles}${tabsTemplate}`;
		}
	}

	static get observedAttributes() {
		return ["direction", "manual"];
	}

	attributeChangedCallback(name, _oldValue, newValue) {
		if (name === "direction") {
			this.#direction = newValue || "top";
			this.#applyLayout();
		} else if (name === "manual") {
			this.#manual = this.hasAttribute("manual");
		}
	}

	connectedCallback() {
		this.#direction = this.getAttribute("direction") || "top";
		this.#manual = this.hasAttribute("manual");

		const { orientation } = getLayout(this.#direction);
		this.#orientation = orientation;
		this.#collectTabsAndPanels();
		this.#setInitialSelection();

		this.addEventListener("keydown", this.#onKeyDown);
		this.addEventListener("click", this.#onClick);

		const tablist = this.shadowRoot.querySelector("#tablist");
		tablist.addEventListener("scroll", this.#onScroll);

		// Observe for changes in slot (e.g. if tabs are dynamically added/removed)
		this.#mutationObserver = new MutationObserver(() => {
			this.#collectTabsAndPanels();
			this.#updateScrollButtons();
		});
		this.#mutationObserver.observe(this, { childList: true, subtree: true });

		// Observe resizing of container
		this.#resizeObserver = new ResizeObserver(() => {
			this.#updateScrollButtons();
		});
		this.#resizeObserver.observe(this);

		this.#applyLayout();
		this.#updateScrollButtons();
	}

	disconnectedCallback() {
		this.removeEventListener("keydown", this.#onKeyDown);
		this.removeEventListener("click", this.#onClick);
		this.shadowRoot
			.querySelector("#tablist")
			.removeEventListener("scroll", this.#onScroll);

		if (this.#mutationObserver) this.#mutationObserver.disconnect();
		if (this.#resizeObserver) this.#resizeObserver.disconnect();
	}

	#applyLayout() {
		const layout = getLayout(this.#direction);

		const container = this.shadowRoot.querySelector("#container");
		const tablistContainer =
			this.shadowRoot.querySelector("#tablist-container");
		const panels = this.shadowRoot.querySelector("#panels");
		const tablist = this.shadowRoot.querySelector("#tablist");
		const scrollPrev = this.shadowRoot.querySelector("#scroll-prev");
		const scrollNext = this.shadowRoot.querySelector("#scroll-next");

		// Set orientation
		tablist.setAttribute("aria-orientation", layout.orientation);

		// Adjust container direction
		container.style.flexDirection = layout.containerFlexDirection;

		if (layout.orientation === "horizontal") {
			// top or bottom
			tablistContainer.style.flexDirection = "row";
			panels.style.flex = "1 1 auto";

			// Position scroll buttons for horizontal
			scrollPrev.style = `position:absolute;${layout.scrollButtonsPos.prev}`;
			scrollNext.style = `position:absolute;${layout.scrollButtonsPos.next}`;
		} else {
			// start or end
			tablistContainer.style.flexDirection = "column";
			panels.style.flex = "1 1 auto";

			// Position scroll buttons for vertical
			scrollPrev.style = `position:absolute;${layout.scrollButtonsPos.prev}`;
			scrollNext.style = `position:absolute;${layout.scrollButtonsPos.next}`;
		}
		this.#updateScrollButtons();
	}

	#collectTabsAndPanels() {
		const tabSlot = this.shadowRoot.querySelector('slot[name="tab"]');
		const panelSlot = this.shadowRoot.querySelector('slot[name="panel"]');
		this.#tabs = tabSlot ? tabSlot.assignedElements() : [];
		this.#panels = panelSlot ? panelSlot.assignedElements() : [];

		this.#tabs.forEach((tab, index) => {
			const panel = this.#panels[index];
			const tabId = tab.id || `tab-${index}`;
			const panelId = panel ? panel.id || `panel-${index}` : `panel-${index}`;
			tab.id = tabId;
			if (panel) panel.id = panelId;

			tab.setAttribute("role", "tab");
			if (panel) {
				tab.setAttribute("aria-controls", panelId);
				panel.setAttribute("role", "tabpanel");
				panel.setAttribute("aria-labelledby", tabId);
			}
			// If no active or aria-selected defined, set the first tab as focusable
			if (!tab.hasAttribute("active") && !tab.hasAttribute("aria-selected")) {
				tab.setAttribute("tabindex", index === 0 ? "0" : "-1");
			}
		});
	}

	#setInitialSelection() {
		// Check for a tab with active attribute
		let activeTab = this.#tabs.find((tab) => tab.hasAttribute("active"));
		if (!activeTab) {
			// or find a tab with aria-selected="true"
			activeTab = this.#tabs.find(
				(tab) => tab.getAttribute("aria-selected") === "true",
			);
		}
		if (!activeTab && this.#tabs.length > 0) {
			activeTab = this.#tabs[0];
			activeTab.setAttribute("active", "");
		}
		if (activeTab) {
			this.#selectTab(activeTab);
		}
	}

	#selectTab(tabToSelect) {
		if (!tabToSelect) return;
		this.#tabs.forEach((tab, index) => {
			const selected = tab === tabToSelect;
			if (selected) {
				tab.setAttribute("aria-selected", "true");
				tab.setAttribute("active", "");
				tab.setAttribute("tabindex", "0");
			} else {
				tab.removeAttribute("aria-selected");
				tab.removeAttribute("active");
				tab.setAttribute("tabindex", "-1");
			}

			const panel = this.#panels[index];
			if (panel) {
				if (selected) {
					panel.setAttribute("active", "");
					panel.setAttribute("tabindex", "0");
				} else {
					panel.removeAttribute("active");
					panel.setAttribute("tabindex", "-1");
				}
			}
		});
	}

	#focusTab(tab) {
		tab.focus();
	}

	#ensureTabVisible(tab) {
		const tablist = this.shadowRoot.querySelector("#tablist");
		const rect = tab.getBoundingClientRect();
		const parentRect = tablist.getBoundingClientRect();
		const isHorizontal = this.#orientation === "horizontal";

		if (isHorizontal) {
			if (rect.left < parentRect.left) {
				tablist.scrollLeft -= parentRect.left - rect.left;
			} else if (rect.right > parentRect.right) {
				tablist.scrollLeft += rect.right - parentRect.right;
			}
		} else {
			if (rect.top < parentRect.top) {
				tablist.scrollTop -= parentRect.top - rect.top;
			} else if (rect.bottom > parentRect.bottom) {
				tablist.scrollTop += rect.bottom - parentRect.bottom;
			}
		}
		this.#updateScrollButtons();
	}

	#updateScrollButtons() {
		const tablist = this.shadowRoot.querySelector("#tablist");
		const scrollPrev = this.shadowRoot.querySelector("#scroll-prev");
		const scrollNext = this.shadowRoot.querySelector("#scroll-next");

		const isHorizontal = this.#orientation === "horizontal";

		if (isHorizontal) {
			const canScrollPrev = tablist.scrollLeft > 0;
			const canScrollNext =
				tablist.scrollWidth - tablist.clientWidth > tablist.scrollLeft + 1;
			scrollPrev.hidden = !canScrollPrev;
			scrollNext.hidden = !canScrollNext;

			scrollPrev.querySelector("span").textContent = "◀";
			scrollNext.querySelector("span").textContent = "▶";
		} else {
			const canScrollPrev = tablist.scrollTop > 0;
			const canScrollNext =
				tablist.scrollHeight - tablist.clientHeight > tablist.scrollTop + 1;
			scrollPrev.hidden = !canScrollPrev;
			scrollNext.hidden = !canScrollNext;

			scrollPrev.querySelector("span").textContent = "▲";
			scrollNext.querySelector("span").textContent = "▼";
		}
	}
}

class Tab extends HTMLElement {
	static get observedAttributes() {
		return ["active"];
	}

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

customElements.define("cek-tabs", Tabs);
customElements.define("cek-tab", Tab);
customElements.define("cek-tab-panel", TabPanel);

/*
Example Usage (in HTML):

<cek-tabs direction="start" manual>
  <cek-tab slot="tab" active>First</cek-tab>
  <cek-tab slot="tab">Second</cek-tab>
  <cek-tab slot="tab">Third</cek-tab>
  <cek-tab slot="tab">Fourth</cek-tab>
  <cek-tab slot="tab">Fifth</cek-tab>
  <cek-tab slot="tab">Sixth</cek-tab>

  <cek-tab-panel slot="panel">
    <p>First panel content</p>
  </cek-tab-panel>
  <cek-tab-panel slot="panel">
    <p>Second panel content</p>
  </cek-tab-panel>
  <cek-tab-panel slot="panel">
    <p>Third panel content</p>
  </cek-tab-panel>
  <cek-tab-panel slot="panel">
    <p>Fourth panel content</p>
  </cek-tab-panel>
  <cek-tab-panel slot="panel">
    <p>Fifth panel content</p>
  </cek-tab-panel>
  <cek-tab-panel slot="panel">
    <p>Sixth panel content</p>
  </cek-tab-panel>
</cek-tabs>
*/
