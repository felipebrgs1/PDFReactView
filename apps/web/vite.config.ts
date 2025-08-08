import { createRequire } from "node:module";
import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, normalizePath } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";

const require = createRequire(import.meta.url);
const cMapsDir = normalizePath(
	path.join(path.dirname(require.resolve("pdfjs-dist/package.json")), "cmaps"),
);
const standardFontsDir = normalizePath(
	path.join(
		path.dirname(require.resolve("pdfjs-dist/package.json")),
		"standard_fonts",
	),
);
const wasmDir = normalizePath(
	path.join(path.dirname(require.resolve("pdfjs-dist/package.json")), "wasm"),
);

export default defineConfig({
	plugins: [
		tanstackRouter({ target: "react", autoCodeSplitting: true }),
		react(),
		tailwindcss(),

		viteStaticCopy({
			targets: [
				{ src: cMapsDir, dest: "" },
				{ src: standardFontsDir, dest: "" },
				{ src: wasmDir, dest: "" },
				{ src: "src/assets/*", dest: "src/assets" },
			],
		}),
	],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
});
