import {describe, expect, it} from "vitest";
import {
    boolCodec,
    dualNumberCodec,
    dualThemeCodec,
    featureListCodec,
    humanizeDuration,
    numberCodec,
    numberUnitsCodec,
    parseDuration,
    parseTheme,
    scrollMultiplierCodec,
} from "./codecs";
import type {FeatureDef} from "./types";

/* eslint quote-props: ["error", "consistent-as-needed", {"keywords": false}] */

describe("boolCodec", () => {
    it("parses only 'true' (case/space insensitive) as true", () => {
        expect(boolCodec.parse("true")).toBe(true);
        expect(boolCodec.parse("  TRUE ")).toBe(true);
        expect(boolCodec.parse("false")).toBe(false);
        expect(boolCodec.parse("")).toBe(false);
        expect(boolCodec.parse("always")).toBe(false);
    });

    it("serializes to 'true'/'false'", () => {
        expect(boolCodec.serialize(true)).toBe("true");
        expect(boolCodec.serialize(false)).toBe("false");
    });
});

describe("numberCodec", () => {
    it("maps empty string to undefined", () => {
        expect(numberCodec.parse("")).toBeUndefined();
        expect(numberCodec.parse("   ")).toBeUndefined();
        expect(numberCodec.serialize(undefined)).toBe("");
    });

    it("round-trips numbers", () => {
        expect(numberCodec.parse("13")).toBe(13);
        expect(numberCodec.parse("0.5")).toBe(0.5);
        expect(numberCodec.serialize(13)).toBe("13");
        expect(numberCodec.serialize(0.5)).toBe("0.5");
    });

    it("treats garbage as undefined", () => {
        expect(numberCodec.parse("abc")).toBeUndefined();
    });
});

describe("featureListCodec", () => {
    const features: FeatureDef[] = [
        {id: "cursor", label: "Cursor", default: true},
        {id: "sudo", label: "Sudo", default: false},
    ];
    const codec = featureListCodec(features);

    it("emits only overrides, omitting features at their default", () => {
        expect(codec.serialize({cursor: true, sudo: false})).toBe("");
        expect(codec.serialize({cursor: false, sudo: true})).toBe("no-cursor,sudo");
    });

    it("parse starts from defaults and applies the comma list", () => {
        expect(codec.parse("")).toEqual({cursor: true, sudo: false});
        expect(codec.parse("no-cursor,sudo")).toEqual({cursor: false, sudo: true});
    });

    it("handles the bare true/false special case", () => {
        expect(codec.parse("true")).toEqual({cursor: true, sudo: true});
        expect(codec.parse("false")).toEqual({cursor: false, sudo: false});
    });

    it("ignores unknown/future tokens", () => {
        expect(codec.parse("future-feature").cursor).toBe(true);
    });

    it("round-trips a raw override value", () => {
        expect(codec.serialize(codec.parse("no-cursor,sudo"))).toBe("no-cursor,sudo");
    });
});

describe("dualNumberCodec", () => {
    it("parses a single value as linked", () => {
        expect(dualNumberCodec.parse("2")).toEqual({first: "2", second: "2", linked: true});
    });

    it("parses a pair as unlinked", () => {
        expect(dualNumberCodec.parse("2,4")).toEqual({first: "2", second: "4", linked: false});
    });

    it("falls back to 0 on garbage", () => {
        expect(dualNumberCodec.parse("abc")).toEqual({first: "0", second: "0", linked: true});
    });

    it("serializes linked as one value, unlinked as a pair", () => {
        expect(dualNumberCodec.serialize({first: "2", second: "2", linked: true})).toBe("2");
        expect(dualNumberCodec.serialize({first: "2", second: "4", linked: false})).toBe("2,4");
    });
});

describe("dualThemeCodec", () => {
    it("parses a single theme as linked", () => {
        expect(dualThemeCodec.parse("Dracula")).toEqual({first: "Dracula", second: "Dracula", linked: true});
    });

    it("parses a light/dark pair as unlinked, order-independent", () => {
        expect(dualThemeCodec.parse("light:Day,dark:Night")).toEqual({first: "Day", second: "Night", linked: false});
        expect(dualThemeCodec.parse("dark:Night,light:Day")).toEqual({first: "Day", second: "Night", linked: false});
    });

    it("serializes the pair form", () => {
        expect(dualThemeCodec.serialize({first: "Day", second: "Night", linked: false})).toBe("light:Day,dark:Night");
    });
});

describe("parseTheme", () => {
    it("maps empty/whitespace to unset", () => {
        expect(parseTheme("")).toEqual({kind: "unset"});
        expect(parseTheme("   ")).toEqual({kind: "unset"});
    });

    it("parses a bare name as single, trimmed", () => {
        expect(parseTheme(" Dracula ")).toEqual({kind: "single", name: "Dracula"});
    });

    it("parses a light/dark pair as dual, order-independent", () => {
        expect(parseTheme("light:Day,dark:Night")).toEqual({kind: "dual", light: "Day", dark: "Night"});
        expect(parseTheme("dark:Night,light:Day")).toEqual({kind: "dual", light: "Day", dark: "Night"});
        expect(parseTheme(" light: Day ,dark: Night ")).toEqual({kind: "dual", light: "Day", dark: "Night"});
    });

    it("treats a half-specified pair as a single name (both modes required for the pair form)", () => {
        expect(parseTheme("light:Day")).toEqual({kind: "single", name: "light:Day"});
    });
});

describe("scrollMultiplierCodec", () => {
    it("maps empty to the default pair", () => {
        expect(scrollMultiplierCodec.parse("")).toBe("1,3");
    });

    it("passes a bare uniform value through", () => {
        expect(scrollMultiplierCodec.parse("5")).toBe("5");
    });

    it("translates the prefixed form into a pair", () => {
        expect(scrollMultiplierCodec.parse("precision:2,discrete:6")).toBe("2,6");
    });

    it("serializes a pair back into the prefixed form", () => {
        expect(scrollMultiplierCodec.serialize("2,6")).toBe("precision:2,discrete:6");
    });

    it("serializes a uniform value bare", () => {
        expect(scrollMultiplierCodec.serialize("5")).toBe("5");
    });
});

describe("numberUnitsCodec", () => {
    it("maps empty to unset px", () => {
        expect(numberUnitsCodec.parse("")).toEqual({num: undefined, unit: "px"});
    });

    it("parses pixels and percentages", () => {
        expect(numberUnitsCodec.parse("-15")).toEqual({num: -15, unit: "px"});
        expect(numberUnitsCodec.parse("20%")).toEqual({num: 20, unit: "pct"});
    });

    it("serializes with the right suffix", () => {
        expect(numberUnitsCodec.serialize({num: undefined, unit: "pct"})).toBe("");
        expect(numberUnitsCodec.serialize({num: -15, unit: "px"})).toBe("-15");
        expect(numberUnitsCodec.serialize({num: 20, unit: "pct"})).toBe("20%");
    });
});

describe("parseDuration", () => {
    it("rejects empty when not nullable, allows it when nullable", () => {
        expect(parseDuration("").ok).toBe(false);
        expect(parseDuration("", true)).toEqual({ok: true, segments: []});
    });

    it("parses a compound duration", () => {
        const result = parseDuration("1h30m");
        expect(result.ok).toBe(true);
        expect(result.segments.map(s => [s.value, s.unit.suffix])).toEqual([[1, "h"], [30, "m"]]);
    });

    it("rejects duplicate units and unknown units", () => {
        expect(parseDuration("1s1s").ok).toBe(false);
        expect(parseDuration("5x").ok).toBe(false);
    });

    it("humanizes with singular/plural", () => {
        expect(humanizeDuration(parseDuration("1h30m").segments)).toBe("1 小时, 30 分钟");
    });
});
