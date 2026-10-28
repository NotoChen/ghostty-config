import {describe, expect, it} from "vitest";
import parse, {serialize} from "./parse";

// parse() turns Ghostty config text into the flat camelCase store shape: scalars are strings,
// `repeatable` settings accumulate into arrays across lines, and the two genuinely-special
// cases (palette's `N=COLOR` indexing, keybind's append) are handled. There was no coverage
// here before — this locks the shape, and in particular that keybind is now parsed through the
// generic `repeatable` path (no dedicated carveout) exactly as it was through its old one.

describe("parse() scalars", () => {
    it("reads a scalar into its camelCase key", () => {
        expect(parse("font-size = 16").fontSize).toBe("16");
    });

    it("keeps boolean-encoded values as strings", () => {
        expect(parse("desktop-notifications = false").desktopNotifications).toBe("false");
    });

    it("lets a later line overwrite an earlier one for non-repeatable keys", () => {
        expect(parse("font-size = 12\nfont-size = 20").fontSize).toBe("20");
    });

    it("ignores comments and malformed lines", () => {
        const result = parse("# a comment\nnot a config line\nfont-size = 14");
        expect(result.fontSize).toBe("14");
    });
});

describe("parse() color normalization", () => {
    it("prefixes a bare 6-digit hex for known color keys", () => {
        expect(parse("background = ffffff").background).toBe("#ffffff");
    });

    it("leaves an already-prefixed color untouched", () => {
        expect(parse("background = #abcdef").background).toBe("#abcdef");
    });

    it("does not prefix non-color keys", () => {
        expect(parse("font-family = ffffff").fontFamily).toEqual(["ffffff"]);
    });
});

describe("parse() repeatable settings", () => {
    it("accumulates repeated keys into an array", () => {
        const result = parse("font-family = JetBrainsMono NF\nfont-family = Symbols Nerd Font");
        expect(result.fontFamily).toEqual(["JetBrainsMono NF", "Symbols Nerd Font"]);
    });

    it("wraps a single repeated key in a one-element array", () => {
        expect(parse("font-family = JetBrainsMono NF").fontFamily).toEqual(["JetBrainsMono NF"]);
    });
});

describe("parse() keybind (via the generic repeatable path)", () => {
    it("accumulates keybinds into the array", () => {
        const result = parse("keybind = ctrl+a=select_all\nkeybind = ctrl+c=copy_to_clipboard");
        expect(result.keybind).toEqual(["ctrl+a=select_all", "ctrl+c=copy_to_clipboard"]);
    });

    it("preserves the `=` inside a keybind value", () => {
        expect(parse("keybind = super+equal=increase_font_size:1").keybind).toEqual(["super+equal=increase_font_size:1"]);
    });

    it("defaults to an empty array when no keybinds are present", () => {
        expect(parse("font-size = 13").keybind).toEqual([]);
    });
});

describe("parse() palette (indexed, still special)", () => {
    it("maps `N=COLOR` into the array by index, not by append order", () => {
        const result = parse("palette = 5=#ffffff\npalette = 0=#000000");
        expect(result.palette[5]).toBe("#ffffff");
        expect(result.palette[0]).toBe("#000000");
        expect(result.palette[1]).toBe(""); // untouched slots stay empty
    });

    it("ignores out-of-range indices", () => {
        const result = parse("palette = 300=#ffffff");
        expect(result.palette.every(c => c === "")).toBe(true);
    });
});

describe("parse() legacy aliases", () => {
    it("maps a retired key onto the registry entry that replaced it", () => {
        expect(parse("scrollback-limit = 100000000").scrollbackLimitBytes).toBe("100000000");
    });

    it("does not emit the retired key name", () => {
        expect(parse("scrollback-limit = 100000000").scrollbackLimit).toBeUndefined();
    });
});

describe("parse -> serialize round-trip", () => {
    it("survives scalars, repeatables, and keybinds", () => {
        const text = "font-size = 18\nfont-family = JetBrainsMono NF\nfont-family = Symbols Nerd Font\nkeybind = ctrl+a=select_all";
        const parsed = parse(text);
        const out = serialize({
            "font-size": parsed.fontSize,
            "font-family": parsed.fontFamily,
            "keybind": parsed.keybind
        }, false);
        expect(out).toContain("font-size = 18");
        expect(out).toContain("font-family = JetBrainsMono NF");
        expect(out).toContain("font-family = Symbols Nerd Font");
        expect(out).toContain("keybind = ctrl+a=select_all");
    });
});
