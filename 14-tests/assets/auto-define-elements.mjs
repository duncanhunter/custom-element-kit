export default (env) => {
	const allElements = document.querySelectorAll("*");
	const definedElements = new Set();

	for (const element of allElements) {
		const tagName = element.tagName.toLowerCase();
		if (tagName.startsWith("cek-")) {
			const elementName = tagName.slice(4);
			if (!definedElements.has(tagName)) {
				import(
					env === "production"
						? `./../${elementName}.js`
						: `./../components/${elementName}/${elementName}.js`
				)
					.then((module) => {
						definedElements.add(tagName);
					})
					.catch((error) => console.error("Failed to load module", { error }));
			}
		}
	}
};
