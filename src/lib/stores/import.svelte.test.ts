import {afterEach, describe, expect, it, vi} from "vitest";

// Covers the import/export *flow orchestration* in import.svelte.ts — source routing, preview
// staging, the "no config found" alert, apply/dismiss lifecycle, and the share-hash entry
// point. The pure data transforms it composes (parse/serialize/diff/load, share encode/decode)
// are covered in parse.test.ts, config.svelte.test.ts, and share.test.ts respectively.
//
// Mocking strategy: toasts + modals are mocked so we can assert user feedback fired and so the
// error path's `await showAlert()` resolves instead of hanging on a never-dismissed modal.
// config.svelte's `load` is wrapped in a spy over the REAL implementation, so the store still
// mutates for real — we can both assert it ran and force it to throw for one test.

vi.mock("#lib/stores/toasts.svelte", async (importOriginal) => {
    const actual = await importOriginal<typeof import("#lib/stores/toasts.svelte")>();
    return {...actual, success: vi.fn(), error: vi.fn()};
});

vi.mock("#lib/stores/modals.svelte", async (importOriginal) => {
    const actual = await importOriginal<typeof import("#lib/stores/modals.svelte")>();
    return {...actual, alert: vi.fn(() => Promise.resolve())};
});

vi.mock("#lib/stores/config.svelte", async (importOriginal) => {
    const actual = await importOriginal<typeof import("#lib/stores/config.svelte")>();
    return {...actual, load: vi.fn(actual.load)};
});

import config, {diffFromDefaults, load, resetSetting} from "#lib/stores/config.svelte";
import {alert as showAlert} from "#lib/stores/modals.svelte";
import {error, success} from "#lib/stores/toasts.svelte";
import {encodeConfig, SHARE_HASH_KEY} from "#lib/utils/share";
import {applyIncomingImport, checkHashForShare, checkTextForImport, dismissIncomingImport, getSourceInfo, incomingImport} from "./import.svelte";

afterEach(() => {
    for (const k of ["fontSize", "keybind", "palette"] as const) resetSetting(k);
    incomingImport.show = false;
    incomingImport.preview = null;
    vi.clearAllMocks();
    vi.unstubAllGlobals();
});

describe("getSourceInfo", () => {
    it("returns per-source copy for each import source", () => {
        expect(getSourceInfo("share").title).toBe("共享配置");
        expect(getSourceInfo("share").successMessage).toBe("共享配置已导入");
        expect(getSourceInfo("clipboard").title).toBe("导入配置");
        expect(getSourceInfo("clipboard").successMessage).toBe("配置已导入");
        expect(getSourceInfo("file").title).toBe("导入配置");
    });
});

describe("checkTextForImport", () => {
    it("stages a preview when the text carries non-default settings", () => {
        checkTextForImport("clipboard", "font-size = 20");

        expect(incomingImport.show).toBe(true);
        expect(incomingImport.preview?.source).toBe("clipboard");
        expect(incomingImport.preview?.parsed?.fontSize).toBe("20");
        expect(incomingImport.preview?.parsedDiff?.["font-size"]).toBe("20");
        expect(incomingImport.preview?.parseError).toBe(false);
        expect(showAlert).not.toHaveBeenCalled();
    });

    it("alerts and stages nothing when the text has no changes over defaults", () => {
        // font-size = 13 is the default, so the diff is empty even though parse succeeds
        checkTextForImport("clipboard", "# a comment\nfont-size = 13");

        expect(incomingImport.show).toBe(false);
        expect(incomingImport.preview).toBe(null);
        expect(showAlert).toHaveBeenCalledOnce();
    });

    it("does not mutate the config store — staging is preview-only", () => {
        checkTextForImport("clipboard", "font-size = 20");
        expect(config.fontSize).toBe("13"); // unchanged until applied
    });
});

describe("applyIncomingImport", () => {
    it("applies the staged config to the store, confirms, and dismisses", async () => {
        checkTextForImport("clipboard", "font-size = 21");
        await applyIncomingImport();

        expect(load).toHaveBeenCalledOnce();
        expect(config.fontSize).toBe("21");
        expect(success).toHaveBeenCalledOnce();
        expect(incomingImport.show).toBe(false);
        expect(incomingImport.preview).toBe(null);
    });

    it("no-ops when there is no staged preview", async () => {
        incomingImport.preview = null;
        await applyIncomingImport();

        expect(load).not.toHaveBeenCalled();
        expect(success).not.toHaveBeenCalled();
    });

    it("surfaces an alert and dismisses without confirming when load throws", async () => {
        const consoleErr = vi.spyOn(console, "error").mockImplementation(() => {});
        vi.mocked(load).mockImplementationOnce(() => {
            throw new Error("boom");
        });

        checkTextForImport("clipboard", "font-size = 21");
        await applyIncomingImport();

        expect(showAlert).toHaveBeenCalledOnce();
        expect(success).not.toHaveBeenCalled();
        expect(incomingImport.show).toBe(false);
        consoleErr.mockRestore();
    });
});

describe("import merge semantics", () => {
    // The edge flagged in app-prefs-and-persistence.md: keybind import *appends* to the default
    // set. diff() then emits only the addition, so a single import doesn't duplicate defaults.
    it("appends an imported keybind over the defaults; diff emits only the addition", async () => {
        checkTextForImport("clipboard", "keybind = ctrl+shift+z=undo");
        await applyIncomingImport();

        expect(config.keybind).toContain("ctrl+shift+z=undo");
        expect(diffFromDefaults(config).keybind).toEqual(["ctrl+shift+z=undo"]);
    });
});

describe("dismissIncomingImport", () => {
    it("clears the staged preview and hides the dialog", () => {
        checkTextForImport("clipboard", "font-size = 20");
        expect(incomingImport.show).toBe(true);

        dismissIncomingImport();

        expect(incomingImport.show).toBe(false);
        expect(incomingImport.preview).toBe(null);
    });
});

describe("checkHashForShare", () => {
    it("returns early (no throw, nothing staged) when there is no window", () => {
        // Node test env: `window` is undefined, so the share entry point is a no-op
        expect(() => checkHashForShare()).not.toThrow();
        expect(incomingImport.show).toBe(false);
    });

    it("decodes a share payload from the URL hash into a staged preview", () => {
        const hash = `#${new URLSearchParams({[SHARE_HASH_KEY]: encodeConfig("font-size = 24")}).toString()}`;
        vi.stubGlobal("window", {
            location: {hash, pathname: "/", search: ""},
            history: {replaceState: vi.fn()}
        });

        checkHashForShare();

        expect(incomingImport.show).toBe(true);
        expect(incomingImport.preview?.source).toBe("share");
        expect(incomingImport.preview?.parsed?.fontSize).toBe("24");
    });

    it("reports an error for a share payload that fails to decode", () => {
        vi.stubGlobal("window", {
            location: {hash: `#${SHARE_HASH_KEY}=@@not-valid-base64@@`, pathname: "/", search: ""},
            history: {replaceState: vi.fn()}
        });

        checkHashForShare();

        expect(error).toHaveBeenCalledOnce();
        expect(incomingImport.show).toBe(false);
    });
});
