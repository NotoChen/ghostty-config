import {describe, expect, it} from "vitest";
import {defaultKeybindSource, modifierChip, modifierLabel} from "./platform";

describe("modifierLabel", () => {
    it("names macOS keys with their symbol and name", () => {
        expect(modifierLabel("super", "macos")).toBe("⌘ Command");
        expect(modifierLabel("ctrl", "macos")).toBe("⌃ Control");
        expect(modifierLabel("alt", "macos")).toBe("⌥ Option");
        expect(modifierLabel("shift", "macos")).toBe("⇧ Shift");
    });

    it("only annotates super outside macOS", () => {
        expect(modifierLabel("super", "linux")).toBe("Win");
        expect(modifierLabel("ctrl", "linux")).toBe("ctrl");
        expect(modifierLabel("alt", "other")).toBe("alt");
    });

    it("passes unknown modifiers through untouched", () => {
        expect(modifierLabel("hyper", "macos")).toBe("hyper");
    });
});

describe("modifierChip", () => {
    it("leads with the symbol on macOS", () => {
        expect(modifierChip("super", "macos")).toBe("⌘ super");
        expect(modifierChip("alt", "macos")).toBe("⌥ alt");
    });

    it("keeps the plain name where the keycap says the same thing", () => {
        expect(modifierChip("ctrl", "linux")).toBe("ctrl");
        expect(modifierChip("shift", "other")).toBe("shift");
    });

    it("disambiguates super on a PC keyboard", () => {
        expect(modifierChip("super", "linux")).toBe("Win super");
    });
});

describe("defaultKeybindSource", () => {
    it("names macOS plainly", () => {
        expect(defaultKeybindSource("macos")).toBe("macOS");
    });

    it("warns that the list is macOS-shaped elsewhere", () => {
        expect(defaultKeybindSource("linux")).toContain("macOS");
        expect(defaultKeybindSource("other")).toContain("super");
    });
});
