global.HTMLElement = class HTMLElement { };
global.customElements = { define: () => { } };

import { parseHTML } from "linkedom";
// Note: Ensure global mocks load before importing components.
const { components, icons } = await import("../index.js");

function getAttributes(element) {
    const attributes = {};
    for (const { name, value } of element.attributes) {
        attributes[name] = value;
    }
    return attributes;
}

function minifyCss(string) {
    return string.replace(/\n/g, " ").replace(/\s+/g, " ").trim();
}

function getElements(document) {
    const allElements = document.querySelectorAll("*");
    const elements = [];

    for (let i = allElements.length - 1; i >= 0; i--) {
        const el = allElements[i];
        if (el.localName.startsWith("cek-")) {
            elements.push(el);
        }
    }

    return elements;
}

export function renderDeclarativeShadowDom(htmlString) {
    const { document } = parseHTML(htmlString);

    for (const element of getElements(document)) {
        const tagName = element.localName;
        const { template, styles } = components[tagName] ?? {};

        if (!template) {
            continue;
        }

        const attrs = getAttributes(element);

        if (tagName === "cek-icon") {
            attrs.svg = icons[attrs.name] || "";
        }

        const htmlContent = template(attrs);

        element.innerHTML = `<template shadowrootmode="open"><style>${minifyCss(styles)}</style>${htmlContent}</template>${element.innerHTML}`;
    }

    return `<!DOCTYPE html><html lang="en">${document.documentElement.outerHTML}`;
}
