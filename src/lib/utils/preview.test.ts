import {describe, expect, it} from "vitest";
import {diffSnapshot, firstPaletteChange, formatPreviewValue, snapshotConfig} from "./preview";

// The preview's change chips show *what* changed, not just that something did. These lock the
// flattening/comparison contract and the Chinese one-liners the chips render.

describe("snapshotConfig()", () => {
    it("keeps scalar values as-is and stringifies repeatables", () => {
        expect(snapshotConfig({fontSize: "13", fontFamily: ["A", "B"]})).toEqual({
            fontSize: "13",
            fontFamily: JSON.stringify(["A", "B"]),
        });
    });
});

describe("diffSnapshot()", () => {
    it("returns only keys whose value changed", () => {
        const before = {fontSize: "13", theme: "A"};
        const after = {fontSize: "15", theme: "A"};
        expect(diffSnapshot(before, after)).toEqual([{key: "fontSize", from: "13", to: "15"}]);
    });

    it("reports nothing when the snapshots match", () => {
        expect(diffSnapshot({fontSize: "13"}, {fontSize: "13"})).toEqual([]);
    });

    it("treats a new key as a change from unset", () => {
        expect(diffSnapshot({}, {background: "#000000"})).toEqual([
            {key: "background", from: "", to: "#000000"},
        ]);
    });
});

describe("formatPreviewValue()", () => {
    it("renders the unset state and booleans in Chinese", () => {
        expect(formatPreviewValue("")).toBe("未设置");
        expect(formatPreviewValue("true")).toBe("开启");
        expect(formatPreviewValue("false")).toBe("关闭");
    });

    it("collapses lists to their length", () => {
        expect(formatPreviewValue(JSON.stringify(["Menlo", "monospace"]))).toBe("2 项");
    });

    it("clips long values with an ellipsis", () => {
        const long = "JetBrainsMono Nerd Font";
        const formatted = formatPreviewValue(long, 10);
        expect(formatted).toHaveLength(10);
        expect(formatted.endsWith("…")).toBe(true);
    });

    it("leaves short values untouched", () => {
        expect(formatPreviewValue("15")).toBe("15");
    });
});

describe("firstPaletteChange()", () => {
    it("names the first differing slot with both colors", () => {
        const before = JSON.stringify(["#000000", "#111111"]);
        const after = JSON.stringify(["#000000", "#222222"]);
        expect(firstPaletteChange(before, after)).toEqual({index: 1, from: "#111111", to: "#222222"});
    });

    it("reports an unset slot that gained a color", () => {
        const before = JSON.stringify(["", "#111111"]);
        const after = JSON.stringify(["#333333", "#111111"]);
        expect(firstPaletteChange(before, after)).toEqual({index: 0, from: "未设置", to: "#333333"});
    });

    it("returns null when the arrays match", () => {
        const value = JSON.stringify(["#000000"]);
        expect(firstPaletteChange(value, value)).toBeNull();
    });
});
