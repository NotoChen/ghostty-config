/**
 * Svelte compiler options, shared by the build and the linter.
 *
 * SvelteKit 3 dropped `svelte.config.js`: the compiler options now go to the `sveltekit()`
 * Vite plugin. But ESLint's Svelte parser reads the same options from its own config, and the
 * two must agree — linting a runes component in legacy mode reports nonsense. Hence one small
 * module both import, rather than the same literal in two files.
 */
export default {
    compilerOptions: {
        // Every component here is runes-mode (`$state` / `$derived` / `$props`). Setting this
        // explicitly rather than relying on per-file detection matches AGENTS.md: this is not
        // Svelte 3/4 code, and legacy mode must not be inferred anywhere.
        runes: true
    }
};
