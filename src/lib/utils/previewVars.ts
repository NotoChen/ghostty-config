import {numberCodec} from "#lib/settings/codecs";
import {resolveCellColor} from "#lib/utils/colors";

// Turns the parts of a Ghostty config that a browser *can* reproduce into `--config-*` CSS vars.
// This is the whole preview-fidelity budget in one place: anything listed in `PreviewConfig` and
// emitted below visibly changes the DOM terminal; anything absent from this file cannot be shown
// in a web page no matter how much UI is added (native window chrome, GTK/Linux/macOS behaviour,
// VT protocol switches). Keep `settings/previewCoverage.ts` in step with the keys read here — the
// settings rows use it to tell the user which edits the preview will reflect.

export interface PreviewConfig {
    fontSize: string;
    fontFamily: string[];
    fontFamilyBold: string[];
    fontFamilyItalic: string[];
    fontFamilyBoldItalic: string[];
    fontFeature: string[];
    fontVariation: string[];
    fontVariationBold: string[];
    fontVariationItalic: string[];
    fontVariationBoldItalic: string[];
    fontThicken: string;
    fontThickenStrength: string;
    boldColor: string;
    faintOpacity: string;
    cursorOpacity: string;
    windowPaddingX: string;
    windowPaddingY: string;
    backgroundOpacity: string;
    backgroundBlur: string;
    backgroundImage: string;
    backgroundImageOpacity: string;
    backgroundImagePosition: string;
    backgroundImageFit: string;
    backgroundImageRepeat: string;
    adjustCellWidth: string;
    adjustCellHeight: string;
    adjustCursorThickness: string;
    adjustUnderlineThickness: string;
    adjustUnderlinePosition: string;
    scrollbar: string;
}

export interface PreviewColors {
    background: string;
    foreground: string;
    cursorColor: string;
    cursorText: string;
    selectionBackground: string;
    selectionForeground: string;
    palette: string[];
}

const FALLBACK_FONT = "JetBrainsMono Nerd Font";
const CELL_WIDTH_RATIO = 0.6; // monospace advance ≈ 0.6em
const LINE_HEIGHT_RATIO = 1.35;
const DEFAULT_PADDING = 2;

/**
 * Ghostty's `adjust-*` values are a bare number of points or a percentage of the metric's base
 * size. Returns the resulting offset in px (negative allowed — these are deltas).
 */
export function unitOffset(raw: string, base: number): number {
    const trimmed = raw.trim();
    if (trimmed === "") return 0;
    const negative = trimmed.startsWith("-");
    const body = negative ? trimmed.slice(1) : trimmed;

    if (body.endsWith("%")) {
        const pct = parseFloat(body.slice(0, -1));
        if (Number.isNaN(pct)) return 0;
        const value = base * pct / 100;
        return negative ? -value : value;
    }

    const px = parseFloat(trimmed);
    return Number.isNaN(px) ? 0 : px;
}

/** `window-padding-x/y`: one value for both sides (`2`) or `left,right` (`2,4`). */
export function paddingPair(raw: string): [number, number] {
    const parts = raw.split(",").map(part => parseFloat(part.trim()));
    if (parts.length === 2 && parts.every(value => !Number.isNaN(value))) {
        return [Math.max(0, parts[0]), Math.max(0, parts[1])];
    }

    const single = parseFloat(raw);
    const value = Math.max(0, Number.isNaN(single) ? DEFAULT_PADDING : single);
    return [value, value];
}

/**
 * `font-feature` accepts `feat`, `+feat`, `-feat`, `feat on|off` and `feat=1|0`. Repeats and
 * comma lists both arrive here as separate entries, so every entry is split again.
 */
export function fontFeatureSettings(entries: string[]): string {
    const settings: string[] = [];

    for (const entry of entries) {
        for (const rawToken of entry.split(",")) {
            let token = rawToken.trim().replace(/^["']|["']$/g, "");
            if (token === "") continue;

            let value = 1;
            if (token.startsWith("-")) {
                value = 0;
                token = token.slice(1).trim();
            }
            else if (token.startsWith("+")) {
                token = token.slice(1).trim();
            }

            const assignment = token.match(/^([\w.]+)\s*=\s*(-?\d+)$/);
            if (assignment) {
                token = assignment[1];
                value = Number(assignment[2]);
            }
            else {
                const [name, mode] = token.split(/\s+/);
                if (mode && /^(on|off)$/i.test(mode)) {
                    token = name;
                    value = mode.toLowerCase() === "on" ? 1 : 0;
                }
            }

            // Anything that still isn't a plausible OpenType tag is dropped rather than pasted
            // into CSS, where it would invalidate the whole declaration.
            if (!/^[\w.]+$/.test(token)) continue;
            settings.push(`"${token}" ${value}`);
        }
    }

    return settings.length > 0 ? settings.join(", ") : "normal";
}

/**
 * `font-variation` entries are `id=value` pairs (`wght=600`), repeatable and comma-separated. CSS
 * `font-variation-settings` takes the same four-character axis tag, so the string maps over
 * directly; anything that isn't an axis assignment is dropped rather than invalidating the rule.
 */
export function fontVariationSettings(entries: string[]): string {
    const settings: string[] = [];

    for (const entry of entries) {
        for (const rawToken of entry.split(",")) {
            const token = rawToken.trim().replace(/^["']|["']$/g, "");
            const assignment = token.match(/^([A-Za-z][\w.]{0,3})\s*=\s*(-?\d+(?:\.\d+)?)$/);
            if (!assignment) continue;
            settings.push(`"${assignment[1]}" ${assignment[2]}`);
        }
    }

    return settings.length > 0 ? settings.join(", ") : "normal";
}

/** `background-blur`: false/0/true/radius, plus the macOS 26 glass presets. */
export function blurRadius(raw: string): number {
    const value = raw.trim().toLowerCase();
    if (value === "" || value === "false" || value === "0") return 0;
    if (value === "true") return 20;
    if (value.startsWith("macos-glass")) return 30;

    const radius = parseFloat(value);
    if (Number.isNaN(radius)) return 0;
    return Math.min(60, Math.max(0, radius));
}

function fontStack(families: string[], fallback: string[]): string {
    const list = families.filter(family => family.trim() !== "");
    return (list.length > 0 ? list : fallback).map(family => JSON.stringify(family)).join(", ");
}

function imagePosition(raw: string): string {
    const keywords: Record<string, string> = {center: "center", top: "top", bottom: "bottom", left: "left", right: "right"};
    return raw.split("-").map(part => keywords[part] ?? part).join(" ");
}

function imageFit(raw: string): string {
    if (raw === "stretch") return "100% 100%";
    if (raw === "none") return "auto";
    return raw || "contain";
}

function cssImage(raw: string): string {
    const value = raw.trim();
    if (value === "") return "none";
    // Only URL-ish sources can load in a browser; a bare filesystem path silently yields no
    // image, which is the honest outcome — the page cannot read the user's disk.
    return `url("${value.replace(/["\\\n\r]/g, "")}")`;
}

/**
 * `bold-color` is either a concrete color or `bright`. `bright` means "the bright variant of the
 * color the cell already used", which a static CSS var cannot express, so both it and unset yield
 * `null` — the terminal CSS then leaves bold spans on their palette color.
 */
function boldColor(value: string): string | null {
    const trimmed = value.trim();
    if (trimmed === "" || trimmed === "bright") return null;
    return trimmed;
}

/** Every `--config-*` variable the terminal preview reads, keyed without the `--config-` prefix. */
export function previewVars(conf: PreviewConfig, colors: PreviewColors): Record<string, string> {
    const vars: Record<string, string> = {};

    const foreground = colors.foreground;
    const background = colors.background;
    const fontSize = numberCodec.parse(conf.fontSize) ?? 13;

    vars.bg = background;
    vars.fg = foreground;
    vars["selection-bg"] = resolveCellColor(colors.selectionBackground, foreground, background) || foreground;
    vars["selection-fg"] = resolveCellColor(colors.selectionForeground, foreground, background) || background;
    vars["cursor-color"] = resolveCellColor(colors.cursorColor, foreground, background) || foreground;
    vars["cursor-text"] = resolveCellColor(colors.cursorText, foreground, background) || background;

    for (let index = 0; index < 16; index++) vars[`palette-${index}`] = colors.palette[index] ?? "";

    // Fonts
    const family = fontStack(conf.fontFamily, [FALLBACK_FONT]);
    vars["font-family"] = family;
    vars["font-family-bold"] = fontStack(conf.fontFamilyBold, conf.fontFamily.length > 0 ? conf.fontFamily : [FALLBACK_FONT]);
    vars["font-family-italic"] = fontStack(conf.fontFamilyItalic, conf.fontFamily.length > 0 ? conf.fontFamily : [FALLBACK_FONT]);
    vars["font-family-bold-italic"] = fontStack(conf.fontFamilyBoldItalic, conf.fontFamily.length > 0 ? conf.fontFamily : [FALLBACK_FONT]);
    vars["font-size"] = `${fontSize}px`;
    vars["font-feature"] = fontFeatureSettings(conf.fontFeature);
    vars["font-variation"] = fontVariationSettings(conf.fontVariation);
    vars["font-variation-bold"] = fontVariationSettings(conf.fontVariationBold);
    vars["font-variation-italic"] = fontVariationSettings(conf.fontVariationItalic);
    vars["font-variation-bold-italic"] = fontVariationSettings(conf.fontVariationBoldItalic);

    // font-thicken dilates glyphs; a sub-pixel text stroke is the closest CSS equivalent. Strength
    // 0 still means "thinnest available thickness" in Ghostty, hence the floor.
    const thicken = conf.fontThicken === "true";
    const strength = Math.min(255, Math.max(0, numberCodec.parse(conf.fontThickenStrength) ?? 255));
    vars["text-stroke"] = thicken ? `${(0.2 + (strength / 255) * 0.4).toFixed(2)}px` : "0";

    // Cell metrics. Baseline shifts only move glyphs inside a cell, which CSS can't do without
    // clipping, so `adjust-font-baseline` is deliberately absent.
    const cellWidth = fontSize * CELL_WIDTH_RATIO;
    const cellHeight = fontSize * LINE_HEIGHT_RATIO;
    vars["letter-spacing"] = `${unitOffset(conf.adjustCellWidth, cellWidth).toFixed(2)}px`;
    vars["line-height"] = `${(cellHeight + unitOffset(conf.adjustCellHeight, cellHeight)).toFixed(2)}px`;

    // Window padding + effects
    const [paddingXLeft, paddingXRight] = paddingPair(conf.windowPaddingX);
    const [paddingYTop, paddingYBottom] = paddingPair(conf.windowPaddingY);
    vars["padding-left"] = `${paddingXLeft}px`;
    vars["padding-right"] = `${paddingXRight}px`;
    vars["padding-top"] = `${paddingYTop}px`;
    vars["padding-bottom"] = `${paddingYBottom}px`;

    const opacity = Math.min(1, Math.max(0, numberCodec.parse(conf.backgroundOpacity) ?? 1));
    vars["bg-opacity"] = String(opacity);
    vars.blur = `${blurRadius(conf.backgroundBlur)}px`;
    vars["bg-image"] = cssImage(conf.backgroundImage);
    vars["bg-image-opacity"] = String(Math.min(1, Math.max(0, numberCodec.parse(conf.backgroundImageOpacity) ?? 1)));
    vars["bg-image-position"] = imagePosition(conf.backgroundImagePosition || "center");
    vars["bg-image-fit"] = imageFit(conf.backgroundImageFit);
    vars["bg-image-repeat"] = conf.backgroundImageRepeat === "true" ? "repeat" : "no-repeat";

    // Text decorations and cursor shape
    // Emitted only when it is a real color: the CSS uses `var(--config-bold, <palette color>)`, and
    // an always-present var would flatten palette colors on every bold span.
    const bold = boldColor(conf.boldColor);
    if (bold !== null) vars.bold = bold;
    vars["faint-opacity"] = String(Math.min(1, Math.max(0, numberCodec.parse(conf.faintOpacity) ?? 0.5)));
    // Coerced to a number: downstream CSS (color-mix in CursorPreview, the blink keyframes) needs one.
    vars["cursor-opacity"] = String(Math.min(1, Math.max(0, numberCodec.parse(conf.cursorOpacity) ?? 1)));

    const underlineThickness = unitOffset(conf.adjustUnderlineThickness, fontSize);
    vars["underline-thickness"] = underlineThickness > 0 ? `${underlineThickness.toFixed(2)}px` : "auto";
    const underlineOffset = unitOffset(conf.adjustUnderlinePosition, fontSize);
    vars["underline-offset"] = underlineOffset !== 0 ? `${underlineOffset.toFixed(2)}px` : "auto";

    const cursorThickness = Math.max(1, 2 + unitOffset(conf.adjustCursorThickness, cellWidth));
    vars["cursor-thickness"] = `${cursorThickness.toFixed(2)}px`;

    vars.scrollbar = conf.scrollbar === "never" ? "none" : "auto";

    return vars;
}

/** Serialize `previewVars()` into a `style` attribute value. */
export function previewStyle(conf: PreviewConfig, colors: PreviewColors): string {
    return Object.entries(previewVars(conf, colors))
        .map(([name, value]) => `--config-${name}: ${value};`)
        .join("");
}
