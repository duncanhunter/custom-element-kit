import path from "node:path";
import { fileURLToPath } from "node:url";
import terser from "@rollup/plugin-terser";
import { rollupPluginHTML as html } from "@web/rollup-plugin-html";
import minifyHTML from "rollup-plugin-minify-html-literals";
import multiInput from "rollup-plugin-multi-input";
import summary from "rollup-plugin-summary";
import { replaceElementWithDeclarativeShadowDom } from "./src/utils/replace-element-with-declarative-shadow-dom.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
	output: {
		dir: "dist",
	},
	plugins: [
		multiInput({
			relative: "dist/",
		}),
		html({
			rootDir: __dirname,
			input: "src/**/*.html",
			transformHtml: [
				(html) => {
					const baseTag = process.env.GITHUB_REF_NAME
						? `<base href="/custom-element-kit/${process.env.GITHUB_REF_NAME}">`
						: "";
					const updatedHeadHtml = html.includes("<head>")
						? html.replace("<head>", `<head>${baseTag}`)
						: html.replace(/<head(\s[^>]*)>/, `<head$1>${baseTag}`);
					const updatedHrefTags = process.env.GITHUB_REF_NAME
						? updatedHeadHtml.replace(
								/href="assets\//g,
								`href="${process.env.GITHUB_REF_NAME}/assets/`,
							)
						: updatedHeadHtml;
					return replaceElementWithDeclarativeShadowDom(updatedHrefTags);
				},
			],
			minify: false,
		}),
		minifyHTML.default(),
		terser(),
		summary({
			showGzippedSize: true,
		}),
	],
};
