import {describe, expect, it} from "vitest";
import registry from "./registry";
import {isPreviewed, previewCoverage, previewedSettings} from "./previewCoverage";

// The "可预览" marker is a promise: everything listed here must be read by the preview, and every
// key must exist. A typo would otherwise silently claim feedback that never arrives.

describe("previewedSettings", () => {
    it("only names keys that exist in the registry", () => {
        const unknown = [...previewedSettings].filter(key => !(key in registry));
        expect(unknown).toEqual([]);
    });

    it("covers the color keys that are the whole point of the preview", () => {
        for (const key of ["theme", "palette", "background", "foreground", "cursorColor", "selectionBackground"]) {
            expect(isPreviewed(key)).toBe(true);
        }
    });

    it("does not claim settings the DOM preview cannot show", () => {
        for (const key of ["keybind", "gtkTitlebar", "macosTitlebarStyle", "adjustBoxThickness"]) {
            expect(isPreviewed(key)).toBe(false);
        }
    });
});

describe("previewCoverage()", () => {
    it("counts how many of a page's settings reach the preview", () => {
        expect(previewCoverage(["fontSize", "theme", "keybind"])).toEqual({total: 3, previewed: 2});
    });

    it("is zero-safe for an empty page", () => {
        expect(previewCoverage([])).toEqual({total: 0, previewed: 0});
    });
});
