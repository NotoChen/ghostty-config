import {sveltekit} from "@sveltejs/kit/vite";
import {defineConfig} from "vitest/config";
import {localConfigPlugin} from "./scripts/vite-plugin-local-config";

export default defineConfig({
    // Loopback bridge to the on-disk Ghostty config: dev/preview only, absent from a static build.
    plugins: [localConfigPlugin(), sveltekit()],
    test: {
        include: ["src/**/*.{test,spec}.{js,ts}"]
    }
});
