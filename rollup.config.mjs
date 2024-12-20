import { copyFileSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import terser from "@rollup/plugin-terser";
import { rollupPluginHTML as html } from "@web/rollup-plugin-html";
import copy from "rollup-plugin-copy";
import minifyHTML from "rollup-plugin-minify-html-literals";
import multiInput from "rollup-plugin-multi-input";
import summary from "rollup-plugin-summary";
import { renderDeclarativeShadowDom } from "./src/utils/render-declarative-shadow-dom.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
	input: ["src/components/**/*.js", "!src/components/**/*.e2e.js"],
	output: {
		dir: "dist",
	},
	plugins: [
		multiInput({
			relative: "src/components",
			transformOutputPath: (output, input) => output.split("/")[1],
		}),
		html({
			rootDir: __dirname,
			input: "src/**/*.html",
			exclude: ["src/docs/index-prod-template.html", "src/index.html"],
			extractAssets: false,
			minify: false,
			transformHtml: [
				(html, { htmlFileName }) => {
					let wrappedContent = html;
					if (!htmlFileName.startsWith("index")) {
						const template = readFileSync(
							"src/docs/index-prod-template.html",
							"utf-8",
						);
						wrappedContent = template.replace(
							"<!-- Page-specific content will be loaded here -->",
							html,
						);
					}

					const refName = process.env.GITHUB_REF_NAME;
					const baseTag = refName
						? `<base href="/custom-element-kit/${refName}/">`
						: "";
					const updatedHtml = wrappedContent.replace(
						/<head(\s[^>]*)?>/,
						`<head$1>${baseTag}`,
					);
					return renderDeclarativeShadowDom(updatedHtml);
				},
			],
		}),
		copy({
			targets: [
				{ src: "src/components/icons", dest: "dist" },
				{ src: "src/core/styles.css", dest: "dist/assets" },
				{ src: "src/docs/page-layout.css", dest: "dist/assets" },
				{ src: "src/docs/utilities.css", dest: "dist/assets" },
				{ src: "src/docs/scroll-spy.js", dest: "dist/assets" },
				{ src: "src/utils/auto-define-elements.mjs", dest: "dist/assets" },
			],
		}),
		minifyHTML.default(),
		terser(),
		summary({
			showGzippedSize: true,
		}),
		{
			name: "duplicate-welcome-html",
			writeBundle() {
				const srcPath = path.join(__dirname, "dist", "welcome.html");
				const destPath = path.join(__dirname, "dist", "index.html");
				copyFileSync(srcPath, destPath);
			},
		},
	],
};
