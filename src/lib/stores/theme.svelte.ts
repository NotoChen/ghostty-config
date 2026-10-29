import themes from "#lib/data/themes";
import {parseTheme} from "#lib/settings/codecs";
import type {ColorScheme} from "#lib/utils/colors";
import config, {defaults, isNonDefault} from "./config.svelte";

// Theme layering view-model. `config` stores only what serializes — the raw `theme` string and
// genuine color overrides; theme colors are NEVER written into it, so they cannot leak into
// diff()/export by construction. This module derives what the UI *displays*: for each color
// key, precedence is explicit override > active theme > app default. The only consumers are
// the CSS-var funnel in +layout.svelte and the color editors (which display effective colors
// and write overrides back to `config`). See the theme-layering section in AGENTS.md.

export type PreviewMode = "light" | "dark";

// Ephemeral view state: which half of a `light:A,dark:B` dual theme is being previewed.
// Never stored in config, never serialized. Defaults to the visitor's own OS appearance
// "what would Ghostty show *me*" falling back to dark during prerender/tests.
const prefersLight = typeof window !== "undefined" && (window.matchMedia?.("(prefers-color-scheme: light)").matches ?? false);
export const preview = $state<{mode: PreviewMode;}>({mode: prefersLight ? "light" : "dark"});

const selection = $derived(parseTheme(config.theme));

const activeTheme = $derived.by((): {name: string, colors: ColorScheme;} | null => {
    let name: string | null = null;
    if (selection.kind === "single") name = selection.name;
    else if (selection.kind === "dual") name = preview.mode === "light" ? selection.light : selection.dark;
    if (name === null) return null;
    // Unknown/custom names (or absolute paths) can't be previewed; the string still round-trips.
    const colors = (themes as Record<string, ColorScheme>)[name];
    return colors ? {name, colors} : null;
});

const themeColors = $derived(activeTheme?.colors ?? null);

const SCHEME_KEYS = ["background", "foreground", "cursorColor", "cursorText", "selectionBackground", "selectionForeground"] as const;
export type SchemeColorKey = typeof SCHEME_KEYS[number];

/** Is this settings-registry key one of the theme-affected color keys? */
export function isSchemeColorKey(key: string): key is SchemeColorKey {
    return (SCHEME_KEYS as readonly string[]).includes(key);
}

// Override detection is value-inferred (`isNonDefault`), the same rule diff() uses: a color
// explicitly set to the app default reads as "not overridden", so the theme wins. Consistent
// with export semantics; provenance tracking would be the stricter (unshipped) alternative.
function resolve(key: SchemeColorKey): string {
    return isNonDefault(key) ? config[key] : themeColors?.[key] ?? config[key];
}

const effective = $derived.by(() => ({
    background: resolve("background"),
    foreground: resolve("foreground"),
    cursorColor: resolve("cursorColor"),
    cursorText: resolve("cursorText"),
    selectionBackground: resolve("selectionBackground"),
    selectionForeground: resolve("selectionForeground"),
    // Element-wise: override per index > theme index (themes carry 16) > default index.
    palette: config.palette.map((color, i) => color !== defaults.palette[i] ? color : themeColors?.palette?.[i] ?? color),
}));

// $derived bindings can't be exported from a module directly; expose them through getters.
export function themeSelection() {
    return selection;
}

export function effectiveColors() {
    return effective;
}

/** The name of the theme currently driving the preview (dual: the previewed half), or null
 * when no theme is set or the name doesn't resolve to known theme data. */
export function activeThemeName(): string | null {
    return activeTheme?.name ?? null;
}

export type ColorTier = "override" | "theme" | "default";

/**
 * Which source a color key's *displayed* value comes from — the tier-badge classifier.
 * Note: an overridden palette reports "override" even though un-edited indices still follow
 * the theme; per-index tiers can be derived the same way if a per-swatch UI ever wants them.
 */
export function colorTier(key: SchemeColorKey | "palette"): ColorTier {
    if (isNonDefault(key)) return "override";
    if (key === "palette") return themeColors ? "theme" : "default";
    return themeColors?.[key] !== undefined ? "theme" : "default";
}

/** Per-index palette tier — the palette is the one setting whose tiers vary per index
 * (themes provide the first 16; anything the user edited is an override). */
export function paletteTier(index: number): ColorTier {
    if (config.palette[index] !== defaults.palette[index]) return "override";
    return themeColors?.palette?.[index] !== undefined ? "theme" : "default";
}
