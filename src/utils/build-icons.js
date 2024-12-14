import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";

const ICONS_DIR = "src/icons";
const OUTPUT_FILE = "src/icons/icons.js";

const files = readdirSync(ICONS_DIR).filter((file) => file.endsWith(".svg"));
const icons = {};

for (const file of files) {
	const iconName = basename(file, ".svg");
	const svgContent = readFileSync(join(ICONS_DIR, file), "utf8");
	icons[iconName] = svgContent;
}

// Construct a JS object with template literals, so no escaping of double quotes is needed.
const iconEntries = Object.entries(icons)
	.map(([name, svg]) => `  "${name}": \`${svg}\``)
	.join(",\n");

const moduleContent = `export default {\n${iconEntries}\n};\n`;

writeFileSync(OUTPUT_FILE, moduleContent, "utf8");

console.log(`Icons bundled into ${OUTPUT_FILE}`);
