import {describe, expect, it} from "vitest";
import {blurRadius, fontFeatureSettings, fontVariationSettings, paddingPair, previewStyle, previewVars, unitOffset, type PreviewColors, type PreviewConfig} from "./previewVars";

// The preview's fidelity budget, locked as pure functions: these are the config -> CSS translations
// that make a settings edit visible in the DOM terminal. A changed expectation here means the
// preview stopped matching Ghostty's own semantics.

function conf(overrides: Partial<PreviewConfig> = {}): PreviewConfig {
    return {
        fontSize: "13",
        fontFamily: ["JetBrains Mono"],
        fontFamilyBold: [],
        fontFamilyItalic: [],
        fontFamilyBoldItalic: [],
        fontFeature: [],
        fontVariation: [],
        fontVariationBold: [],
        fontVariationItalic: [],
        fontVariationBoldItalic: [],
        fontThicken: "false",
        fontThickenStrength: "255",
        boldColor: "",
        faintOpacity: "0.5",
        cursorOpacity: "1",
        windowPaddingX: "2",
        windowPaddingY: "2",
        backgroundOpacity: "1",
        backgroundBlur: "false",
        backgroundImage: "",
        backgroundImageOpacity: "1",
        backgroundImagePosition: "center",
        backgroundImageFit: "contain",
        backgroundImageRepeat: "false",
        adjustCellWidth: "",
        adjustCellHeight: "",
        adjustCursorThickness: "",
        adjustUnderlineThickness: "",
        adjustUnderlinePosition: "",
        scrollbar: "auto",
        ...overrides,
    };
}

function colors(overrides: Partial<PreviewColors> = {}): PreviewColors {
    return {
        background: "#101010",
        foreground: "#f0f0f0",
        cursorColor: "cell-foreground",
        cursorText: "cell-background",
        selectionBackground: "cell-foreground",
        selectionForeground: "cell-background",
        palette: Array.from({length: 16}, (_, i) => `#00000${i.toString(16)}`),
        ...overrides,
    };
}

describe("unitOffset()", () => {
    it("treats a bare number as points (px here)", () => {
        expect(unitOffset("2", 10)).toBe(2);
        expect(unitOffset("-2", 10)).toBe(-2);
    });

    it("reads a percentage against the metric's base size", () => {
        expect(unitOffset("10%", 20)).toBe(2);
        expect(unitOffset("-50%", 20)).toBe(-10);
    });

    it("returns 0 for unset or nonsense values", () => {
        expect(unitOffset("", 10)).toBe(0);
        expect(unitOffset("abc", 10)).toBe(0);
    });
});

describe("paddingPair()", () => {
    it("expands a single value to both sides", () => {
        expect(paddingPair("4")).toEqual([4, 4]);
    });

    it("reads left,right", () => {
        expect(paddingPair("2,6")).toEqual([2, 6]);
    });

    it("falls back to Ghostty's default of 2 and never goes negative", () => {
        expect(paddingPair("")).toEqual([2, 2]);
        expect(paddingPair("-5")).toEqual([0, 0]);
    });
});

describe("fontFeatureSettings()", () => {
    it("turns +feat / -feat into on/off", () => {
        expect(fontFeatureSettings(["+liga", "-calt"])).toBe("\"liga\" 1, \"calt\" 0");
    });

    it("accepts `feat on|off` and `feat=1|0`", () => {
        expect(fontFeatureSettings(["ss01 on", "frac=0"])).toBe("\"ss01\" 1, \"frac\" 0");
    });

    it("splits comma lists and drops tokens that would break the CSS declaration", () => {
        expect(fontFeatureSettings(["dlig, ss02", "bad tag!"])).toBe("\"dlig\" 1, \"ss02\" 1");
    });

    it("is `normal` when nothing is set", () => {
        expect(fontFeatureSettings([])).toBe("normal");
    });
});

describe("fontVariationSettings()", () => {
    it("maps four-character axis assignments onto CSS", () => {
        expect(fontVariationSettings(["wght=600"])).toBe("\"wght\" 600");
        expect(fontVariationSettings(["wght=600,wdth=90"])).toBe("\"wght\" 600, \"wdth\" 90");
    });

    it("accepts fractions and negatives", () => {
        expect(fontVariationSettings(["slnt=-12.5", "opsz=14"])).toBe("\"slnt\" -12.5, \"opsz\" 14");
    });

    it("drops entries that are not axis assignments", () => {
        expect(fontVariationSettings(["wght", "=600", "wght=heavy"])).toBe("normal");
    });

    it("is `normal` when unset", () => {
        expect(fontVariationSettings([])).toBe("normal");
    });
});

describe("blurRadius()", () => {
    it("maps the boolean and glass forms", () => {
        expect(blurRadius("false")).toBe(0);
        expect(blurRadius("true")).toBe(20);
        expect(blurRadius("macos-glass-regular")).toBe(30);
    });

    it("passes a numeric radius through, clamped", () => {
        expect(blurRadius("12")).toBe(12);
        expect(blurRadius("500")).toBe(60);
    });
});

describe("previewVars()", () => {
    it("resolves cell-foreground / cell-background against the effective colors", () => {
        const vars = previewVars(conf(), colors());
        expect(vars["selection-bg"]).toBe("#f0f0f0");
        expect(vars["selection-fg"]).toBe("#101010");
        expect(vars["cursor-color"]).toBe("#f0f0f0");
        expect(vars["cursor-text"]).toBe("#101010");
    });

    it("emits all sixteen palette slots", () => {
        const vars = previewVars(conf(), colors());
        expect(vars["palette-0"]).toBe("#000000");
        expect(vars["palette-15"]).toBe("#00000f");
    });

    it("falls back to the configured family, then to the bundled font", () => {
        expect(previewVars(conf({fontFamily: ["", "Fira Code"]}), colors())["font-family"]).toBe("\"Fira Code\"");
        expect(previewVars(conf({fontFamily: []}), colors())["font-family"]).toBe("\"JetBrainsMono Nerd Font\"");
    });

    it("uses the bold/italic stacks when set, otherwise mirrors the regular family", () => {
        const set = previewVars(conf({fontFamilyBold: ["Fira Code Bold"]}), colors());
        expect(set["font-family-bold"]).toBe("\"Fira Code Bold\"");
        expect(set["font-family-italic"]).toBe("\"JetBrains Mono\"");
        expect(set["font-family-bold-italic"]).toBe("\"JetBrains Mono\"");
    });

    it("emits a variation setting per family style", () => {
        const vars = previewVars(conf({fontVariation: ["wght=500"], fontVariationBold: ["wght=800"]}), colors());
        expect(vars["font-variation"]).toBe("\"wght\" 500");
        expect(vars["font-variation-bold"]).toBe("\"wght\" 800");
        expect(vars["font-variation-italic"]).toBe("normal");
    });

    it("converts font-size, cell metrics and padding to px", () => {
        const vars = previewVars(conf({fontSize: "20", adjustCellWidth: "10%", adjustCellHeight: "-2", windowPaddingX: "4,8", windowPaddingY: "6"}), colors());
        expect(vars["font-size"]).toBe("20px");
        // 20 * 0.6 = 12 base cell width; +10% of it.
        expect(vars["letter-spacing"]).toBe("1.20px");
        // 20 * 1.35 = 27 base line height; -2px.
        expect(vars["line-height"]).toBe("25.00px");
        expect(vars["padding-left"]).toBe("4px");
        expect(vars["padding-right"]).toBe("8px");
        expect(vars["padding-top"]).toBe("6px");
    });

    it("only strokes glyphs when font-thicken is on", () => {
        expect(previewVars(conf(), colors())["text-stroke"]).toBe("0");
        expect(previewVars(conf({fontThicken: "true", fontThickenStrength: "0"}), colors())["text-stroke"]).toBe("0.20px");
        expect(previewVars(conf({fontThicken: "true", fontThickenStrength: "255"}), colors())["text-stroke"]).toBe("0.60px");
    });

    it("leaves bold inheriting unless a concrete bold color is set", () => {
        expect(previewVars(conf(), colors()).bold).toBe("inherit");
        expect(previewVars(conf({boldColor: "bright"}), colors()).bold).toBe("inherit");
        expect(previewVars(conf({boldColor: "#ff0000"}), colors()).bold).toBe("#ff0000");
    });

    it("wraps the background image in a URL and strips characters that would break the CSS", () => {
        expect(previewVars(conf(), colors())["bg-image"]).toBe("none");
        expect(previewVars(conf({backgroundImage: "/home/me/wall\"paper.png"}), colors())["bg-image"]).toBe("url(\"/home/me/wallpaper.png\")");
    });

    it("maps the image placement keywords onto CSS", () => {
        const vars = previewVars(conf({backgroundImagePosition: "top-left", backgroundImageFit: "stretch", backgroundImageRepeat: "true"}), colors());
        expect(vars["bg-image-position"]).toBe("top left");
        expect(vars["bg-image-fit"]).toBe("100% 100%");
        expect(vars["bg-image-repeat"]).toBe("repeat");
    });

    it("hides the scrollbar only for `never`", () => {
        expect(previewVars(conf({scrollbar: "never"}), colors()).scrollbar).toBe("none");
        expect(previewVars(conf({scrollbar: "auto"}), colors()).scrollbar).toBe("auto");
    });

    it("keeps underline/cursor decorations at `auto` when unadjusted, and lifts them above 0", () => {
        const unset = previewVars(conf(), colors());
        expect(unset["underline-thickness"]).toBe("auto");
        expect(unset["underline-offset"]).toBe("auto");
        expect(unset["cursor-thickness"]).toBe("2.00px");

        const adjusted = previewVars(conf({adjustUnderlineThickness: "1.5", adjustUnderlinePosition: "2", adjustCursorThickness: "-5"}), colors());
        expect(adjusted["underline-thickness"]).toBe("1.50px");
        expect(adjusted["underline-offset"]).toBe("2.00px");
        // Never thinner than a device pixel, even with a large negative adjustment.
        expect(adjusted["cursor-thickness"]).toBe("1.00px");
    });

    it("clamps opacities into 0..1", () => {
        const vars = previewVars(conf({backgroundOpacity: "2", backgroundImageOpacity: "-1", faintOpacity: "x"}), colors());
        expect(vars["bg-opacity"]).toBe("1");
        expect(vars["bg-image-opacity"]).toBe("0");
        expect(vars["faint-opacity"]).toBe("0.5");
    });
});

describe("previewStyle()", () => {
    it("serializes every var as a --config-* declaration", () => {
        const style = previewStyle(conf(), colors());
        expect(style).toContain("--config-bg: #101010;");
        expect(style).toContain("--config-font-size: 13px;");
        expect(style.endsWith(";")).toBe(true);
    });
});
