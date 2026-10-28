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
        // adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
        // If your environment is not supported, or you settled on a specific environment, switch out the adapter.
        // See https://kit.svelte.dev/docs/adapters for more information about adapters.
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
