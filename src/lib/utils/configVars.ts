import themes from "#lib/data/themes";
import {parseTheme} from "#lib/settings/codecs";
import {resolveCellColor, type ColorScheme} from "./colors";

// Turns an arbitrary config object into the `--config-*` CSS custom properties the previews
// read. The live app resolves its own colors through stores/theme.svelte.ts (+layout.svelte is
// the single funnel for that); this module exists so a *second* config (the on-disk file) can
// be rendered side by side without touching global state.

export type ColorVarsMode = "light" | "dark";

export interface ConfigColorSource {
    background: string;
    foreground: string;
    cursorColor: string;
    cursorText: string;
    selectionBackground: string;
    selectionForeground: string;
    palette: Array<string | undefined>;
    cursorOpacity?: string;
    fontFamily?: string[];
    fontSize?: string;
    theme?: string;
}

export interface ResolvedColors {
    background: string;
    foreground: string;
    cursorColor: string;
    cursorText: string;
    selectionBackground: string;
    selectionForeground: string;
    palette: string[];
}

function themeColorsFor(themeString: string | undefined, mode: ColorVarsMode): ColorScheme | null {
    if (themeString === undefined) return null;
    const selection = parseTheme(themeString);
    let name: string | null = null;
    if (selection.kind === "single") name = selection.name;
    else if (selection.kind === "dual") name = mode === "light" ? selection.light : selection.dark;
    if (name === null) return null;
    return (themes as Record<string, ColorScheme>)[name] ?? null;
}

/**
 * Same precedence the app uses for its own preview: explicit override (value ≠ app default) >
 * active theme > app default. Element-wise for the palette, which themes fill 16 entries of.
 */
export function resolveColorsFor(source: ConfigColorSource, base: ConfigColorSource, mode: ColorVarsMode): ResolvedColors {
    const theme = themeColorsFor(source.theme, mode);
    const resolve = (key: "background" | "foreground" | "cursorColor" | "cursorText" | "selectionBackground" | "selectionForeground") => {
        const override = source[key] && source[key] !== base[key] ? source[key] : "";
        return override || theme?.[key] || base[key];
    };

    return {
        background: resolve("background"),
        foreground: resolve("foreground"),
        cursorColor: resolve("cursorColor"),
        cursorText: resolve("cursorText"),
        selectionBackground: resolve("selectionBackground"),
        selectionForeground: resolve("selectionForeground"),
        palette: Array.from({length: 16}, (_, i) => {
            const value = source.palette[i];
            const baseValue = base.palette[i] ?? "";
            const override = value && value !== baseValue ? value : "";
            return override || theme?.palette?.[i] || baseValue;
        })
    };
}

export interface ConfigLayout {
    cursorOpacity?: string;
    fontFamily?: string[];
    fontSize?: string;
}

/** Render resolved colors + layout metrics as a `style` attribute value. */
export function configVarsStyle(colors: ResolvedColors, layout: ConfigLayout): string {
    const vars: Array<[string, string]> = [];
    const add = (key: string, value: string) => vars.push([`--config-${key}`, value]);

    const fg = colors.foreground;
    const bg = colors.background;
    add("bg", bg);
    add("fg", fg);
    add("selection-bg", resolveCellColor(colors.selectionBackground, fg, bg) || fg);
    add("selection-fg", resolveCellColor(colors.selectionForeground, fg, bg) || bg);
    add("cursor-color", resolveCellColor(colors.cursorColor, fg, bg) || fg);
    add("cursor-text", resolveCellColor(colors.cursorText, fg, bg) || bg);
    add("cursor-opacity", String(Number.parseFloat(layout.cursorOpacity ?? "1") || 1));

    // Themes carry 16 palette entries; the effective palette from the store has 256 slots.
    const paletteSize = Math.min(colors.palette.length, 16);
    for (let i = 0; i < paletteSize; i++) add(`palette-${i}`, colors.palette[i]);

    const families = (layout.fontFamily ?? []).filter(Boolean);
    add("font-family", families.map(f => JSON.stringify(f)).join(", ") || JSON.stringify("JetBrainsMono Nerd Font"));
    add("font-size", `${Number.parseFloat(layout.fontSize ?? "13") || 13}px`);

    return vars.map(([k, v]) => `${k}: ${v};`).join("");
}

/** Convenience: resolve + format in one call. */
export function colorsToStyle(source: ConfigColorSource, base: ConfigColorSource, mode: ColorVarsMode): string {
    return configVarsStyle(resolveColorsFor(source, base, mode), source);
}
