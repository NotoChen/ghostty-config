import adapter from "@sveltejs/adapter-static";
import {vitePreprocess} from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config} */
const config = {
    // Consult https://kit.svelte.dev/docs/integrations#preprocessors
    // for more information about preprocessors
    preprocess: vitePreprocess(),
    compilerOptions: {
        runes: true
    },
    kit: {
        // Static hosting only — GitHub Pages, or any plain file server after `bun run build`.
        // The fallback page is what makes a deep link like /app/local-config resolve instead of 404.
        adapter: adapter({
            fallback: "404.html"
        }),
        paths: {
            // GitHub Pages serves a project site under /<repo>, while `vite dev` / `vite preview`
            // stay at the root (the local-config bridge is loopback-only and must keep working).
            // The Pages workflow sets BASE_PATH=/ghostty-config; a plain local build keeps "".
            base: process.argv.includes("dev") || process.argv.includes("preview") ? "" : (process.env.BASE_PATH ?? ""),
            // Absolute asset URLs (base-prefixed) rather than `./_app/...`. Deep links like
            // /app/local-config are answered by the 404.html fallback, whose relative paths would
            // otherwise resolve against the wrong directory and 404 the whole bundle.
            relative: false
        }
    }
};

export default config;
