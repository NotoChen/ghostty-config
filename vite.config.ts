import adapter from "@sveltejs/adapter-static";
import {sveltekit} from "@sveltejs/kit/vite";
import {defineConfig} from "vitest/config";

import svelteOptions from "./svelte.options.ts";
import {localConfigPlugin} from "./scripts/vite-plugin-local-config.ts";

export default defineConfig(({command}) => {
    /**
     * Where the built site is served from. GitHub Pages serves a project site under `/<repo>`,
     * while `vite dev` / `vite preview` stay at the root (the local-config bridge is loopback-only
     * and must keep working). The Pages workflow sets `BASE_PATH=/ghostty-config`; a plain local
     * build keeps "".
     *
     * `command` covers that without reading process.argv: Vite resolves the config with `build` for
     * a build and `serve` for both dev and preview.
     *
     * The literal type is not cosmetic — SvelteKit types `paths.base` as `"" | `/${string}``, which
     * is what guarantees a base path is either absent or rooted.
     */
    const base: "" | `/${string}` = command === "build" && process.env.BASE_PATH
        ? process.env.BASE_PATH as `/${string}`
        : "";

    return {
        plugins: [
            // Loopback bridge to the on-disk Ghostty config: dev/preview only, absent from a static build.
            localConfigPlugin(),
            sveltekit({
                ...svelteOptions,
                // Static hosting only — GitHub Pages, or any plain file server after `bun run build`.
                // The fallback page is what makes a deep link like /app/local-config resolve instead of 404.
                adapter: adapter({fallback: "404.html"}),
                paths: {
                    base,
                    // Absolute asset URLs (base-prefixed) rather than `./_app/...`. Deep links like
                    // /app/local-config are answered by the 404.html fallback, whose relative paths
                    // would otherwise resolve against the wrong directory and 404 the whole bundle.
                    relative: false
                }
            })
        ],
        test: {
            include: ["src/**/*.{test,spec}.{js,ts}"]
        }
    };
});
