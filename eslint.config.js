import {browser} from "@zerebos/eslint-config";
import ts from "@zerebos/eslint-config-typescript";
import {defineConfig} from "eslint/config";
import {build} from "@zerebos/eslint-config-svelte";
import svelteOptions from "./svelte.options.ts";


export default defineConfig(
    defineConfig(
        ...browser,
        ...ts.configs.recommendedWithTypes
    ),
    ...build(svelteOptions),
    {
        languageOptions: {
            globals: {
                __INSTALLER_LICENSE__: "readonly",
            }
        }
    },
    {
        // Theme layering (see the theme section in AGENTS.md): the color keys must be read
        // through effectiveColors()/the --config-* CSS vars, never off `config` directly — a
        // direct read silently bypasses the override > theme > default resolution. The three
        // exempted files are the designated touchpoints: the store itself, the resolver, and
        // the settings renderer (which writes per-index overrides). Tests may touch freely.
        files: ["src/**/*.ts", "src/**/*.svelte"],
        ignores: [
            "src/lib/stores/config.svelte.ts",
            "src/lib/stores/theme.svelte.ts",
            "src/routes/settings/*/+page.svelte", // [category] — literal brackets are a glob character class
            "src/**/*.test.ts",
        ],
        rules: {
            "no-restricted-syntax": ["error", {
                selector: "MemberExpression[object.name='config'][property.name=/^(background|foreground|cursorColor|cursorText|selectionBackground|selectionForeground|palette)$/]",
                message: "Read colors via effectiveColors() (#lib/stores/theme.svelte) or the --config-* CSS vars; direct config color access bypasses theme layering. Override writes belong in the settings renderer.",
            }],
        },
    },
    {
        ignores: ["build/", ".svelte-kit/", "dist/", "custom/", "config/", "sverdle/", "notes/"]
    },
);
