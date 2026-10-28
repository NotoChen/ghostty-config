import {describe, expect, it} from "vitest";
import {parseTrigger} from "./keybinds";
import {codeToKey, isDedicatedKey, isRecordingKey, keyCap, modifierCap, stepFromEvent, triggerCaps} from "./keycaps";

function key(code: string, modifiers: {ctrl?: boolean; alt?: boolean; shift?: boolean; meta?: boolean} = {}) {
    return {
        code,
        ctrlKey: Boolean(modifiers.ctrl),
        altKey: Boolean(modifiers.alt),
        shiftKey: Boolean(modifiers.shift),
        metaKey: Boolean(modifiers.meta),
        isComposing: false
    } as KeyboardEvent;
}

describe("codeToKey", () => {
    it("maps letters, digits and function keys to Ghostty names", () => {
        expect(codeToKey("KeyT")).toBe("key_t");
        expect(codeToKey("Digit1")).toBe("digit_1");
        expect(codeToKey("Numpad5")).toBe("numpad_5");
        expect(codeToKey("F5")).toBe("f5");
    });

    it("maps punctuation and navigation keys", () => {
        expect(codeToKey("Comma")).toBe("comma");
        expect(codeToKey("BracketLeft")).toBe("bracket_left");
        expect(codeToKey("ArrowUp")).toBe("arrow_up");
        expect(codeToKey("Escape")).toBe("escape");
    });

    it("returns null for keys Ghostty has no name for", () => {
        expect(codeToKey("F26")).toBeNull();
        expect(codeToKey("Unidentified")).toBeNull();
    });
});

describe("stepFromEvent", () => {
    it("reads the physical key plus the modifiers actually held", () => {
        expect(stepFromEvent(key("KeyT", {meta: true, shift: true}))).toEqual({
            key: "key_t",
            modifiers: ["shift", "super"]
        });
    });

    it("does not depend on the produced character", () => {
        // Option+T produces "†" on macOS; the key is still physical T.
        expect(stepFromEvent(key("KeyT", {alt: true}))?.key).toBe("key_t");
    });

    it("keeps waiting while only modifiers are held", () => {
        expect(stepFromEvent(key("MetaLeft", {meta: true}))).toBeNull();
    });
});

describe("isRecordingKey", () => {
    it("records combos", () => {
        expect(isRecordingKey(key("KeyT", {meta: true}))).toBe(true);
    });

    it("records keys that cannot be typed as text", () => {
        expect(isRecordingKey(key("ArrowUp"))).toBe(true);
        expect(isRecordingKey(key("Escape"))).toBe(true);
    });

    it("lets plain printable characters be typed", () => {
        expect(isRecordingKey(key("Slash"))).toBe(false);
        expect(isRecordingKey(key("KeyA", {shift: true}))).toBe(false);
    });
});

describe("keyCap", () => {
    it("shows the label printed on the key", () => {
        expect(keyCap("key_t")).toBe("T");
        expect(keyCap("digit_1")).toBe("1");
        expect(keyCap("f5")).toBe("F5");
        expect(keyCap("arrow_up")).toBe("↑");
        expect(keyCap("comma")).toBe(",");
    });

    it("leaves physical keys readable", () => {
        expect(keyCap("physical:five")).toBe("five");
    });
});

describe("modifierCap", () => {
    it("uses macOS symbols on macOS", () => {
        expect(modifierCap("super", "macos")).toBe("⌘");
        expect(modifierCap("shift", "macos")).toBe("⇧");
    });

    it("spells modifiers out elsewhere", () => {
        expect(modifierCap("super", "linux")).toBe("Win");
        expect(modifierCap("ctrl", "linux")).toBe("Ctrl");
    });
});

describe("dedicated Copy/Cut/Paste keys", () => {
    it("resolves the hardware keys to their Ghostty names", () => {
        expect(codeToKey("Copy")).toBe("copy");
        expect(codeToKey("Cut")).toBe("cut");
        expect(codeToKey("Paste")).toBe("paste");
    });

    it("labels them as keys rather than as text", () => {
        expect(keyCap("copy")).toBe("Copy");
        expect(keyCap("paste")).toBe("Paste");
    });

    it("marks them so the row can explain the missing combo", () => {
        const parsed = parseTrigger("copy");
        expect(parsed).toBeTruthy();
        expect(triggerCaps(parsed!).steps[0].dedicated).toBe(true);
        expect(isDedicatedKey("super+c")).toBe(false);
    });

    it("is not confused with the built-in ⌘C binding", () => {
        expect(isDedicatedKey("key_c")).toBe(false);
    });
});

describe("triggerCaps", () => {
    it("renders modifiers in menu order, then the key", () => {
        const parsed = parseTrigger("super+shift+ctrl+comma");
        expect(parsed).toBeTruthy();

        const caps = triggerCaps(parsed!, "macos");
        expect(caps.steps[0].caps).toEqual(["⌃", "⇧", "⌘", ","]);
    });

    it("keeps prefixes and sequence steps", () => {
        const parsed = parseTrigger("global:ctrl+a>ctrl+b");
        expect(parsed).toBeTruthy();

        const caps = triggerCaps(parsed!, "linux");
        expect(caps.prefixes).toEqual(["global"]);
        expect(caps.steps.map((step) => step.caps)).toEqual([["Ctrl", "A"], ["Ctrl", "B"]]);
    });
});
