import type {registry} from "./registry";

// Which settings the right-hand preview actually reflects. This is the answer to "I changed it,
// why did nothing happen?": a setting is listed here only if `utils/previewVars.ts` (or the
// terminal/preview components) read it, so the list is a contract, not an aspiration.
//
// Adding a key here without wiring it into the preview would let the UI claim feedback that never
// arrives. Adding a preview mapping without listing the key here makes a working preview look
// inert. Keep the two edits in the same commit.

type SettingKey = keyof typeof registry;

export const previewedSettings = new Set<SettingKey>([
    // 颜色 — the whole point of the preview: palette, base colors, cursor, selection.
    "theme",
    "palette",
    "background",
    "foreground",
    "boldColor",
    "faintOpacity",
    "selectionBackground",
    "selectionForeground",
    "selectionClearOnTyping",
    "selectionClearOnCopy",
    "cursorColor",
    "cursorText",
    "cursorOpacity",
    "cursorStyle",
    "cursorStyleBlink",

    // 字体 — families, ligatures, thicken and the cell metrics that shift the grid.
    "fontSize",
    "fontFamily",
    "fontFamilyBold",
    "fontFamilyItalic",
    "fontFamilyBoldItalic",
    "fontFeature",
    "fontVariation",
    "fontVariationBold",
    "fontVariationItalic",
    "fontVariationBoldItalic",
    "fontThicken",
    "fontThickenStrength",
    "adjustCellWidth",
    "adjustCellHeight",
    "adjustCursorThickness",
    "adjustUnderlineThickness",
    "adjustUnderlinePosition",

    // 窗口 — padding and the background effects the pane can reproduce over the wallpaper.
    "windowPaddingX",
    "windowPaddingY",
    "backgroundOpacity",
    "backgroundBlur",
    "backgroundImage",
    "backgroundImageOpacity",
    "backgroundImagePosition",
    "backgroundImageFit",
    "backgroundImageRepeat",
    "scrollbar",

    // 剪贴板 — copy-on-select is observable: drag-select text and watch the clipboard fill.
    "copyOnSelect",

    // macOS 应用图标 — rendered by the icon preview and the dock, not the terminal pane.
    "macosIcon",
    "macosIconFrame",
    "macosCustomIcon",
    "macosIconGhostColor",
    "macosIconScreenColor",
]);

export function isPreviewed(key: string): boolean {
    return previewedSettings.has(key as SettingKey);
}

/** How many of a panel's settings the preview reflects. Drives the per-page coverage note. */
export function previewCoverage(keys: readonly string[]): {total: number; previewed: number} {
    return {
        total: keys.length,
        previewed: keys.filter(isPreviewed).length,
    };
}
