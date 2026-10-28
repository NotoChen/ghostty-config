import {describe, expect, it} from "vitest";
import {clampPreviewWidth, MAX_PREVIEW_WIDTH, MIN_PREVIEW_WIDTH} from "./state.svelte";

// The docked pane's width is written from a drag and read back from localStorage on the next visit,
// so it must land inside the same bounds either way — a stale or hand-edited stored width should
// never produce a pane that swallows the settings column or collapses to nothing.

describe("clampPreviewWidth()", () => {
    it("keeps a width inside the allowed range", () => {
        expect(clampPreviewWidth(380)).toBe(380);
        expect(clampPreviewWidth(MIN_PREVIEW_WIDTH)).toBe(MIN_PREVIEW_WIDTH);
        expect(clampPreviewWidth(MAX_PREVIEW_WIDTH)).toBe(MAX_PREVIEW_WIDTH);
    });

    it("pulls out-of-range widths back to the nearest bound", () => {
        expect(clampPreviewWidth(10)).toBe(MIN_PREVIEW_WIDTH);
        expect(clampPreviewWidth(5000)).toBe(MAX_PREVIEW_WIDTH);
        expect(clampPreviewWidth(-40)).toBe(MIN_PREVIEW_WIDTH);
    });

    it("rounds fractions so the pane width stays a whole pixel", () => {
        expect(clampPreviewWidth(381.7)).toBe(382);
    });

    it("falls back to the minimum for values that aren't numbers", () => {
        expect(clampPreviewWidth(Number.NaN)).toBe(MIN_PREVIEW_WIDTH);
        expect(clampPreviewWidth(Number.POSITIVE_INFINITY)).toBe(MIN_PREVIEW_WIDTH);
    });
});
