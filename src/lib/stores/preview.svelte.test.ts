import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import {clearRecentChanges, recentChanges, trackConfig} from "./preview.svelte";

// Covers the chip lifecycle in preview.svelte.ts: one chip per changed key, a slider drag widening
// the chip that is already up instead of stacking every intermediate value, bulk edits staying
// silent, and chips expiring on their own. The diffing/formatting it composes is covered in
// preview.test.ts.

describe("trackConfig()", () => {
    beforeEach(() => {
        // `previous` is module state seeded by the first call; start each test from a clean slate.
        clearRecentChanges();
        trackConfig({fontSize: "13", theme: ""});
        clearRecentChanges();
    });

    afterEach(() => {
        clearRecentChanges();
        vi.useRealTimers();
    });

    it("pushes one chip per changed key", () => {
        trackConfig({fontSize: "18", theme: ""});
        expect(recentChanges).toHaveLength(1);
        expect(recentChanges[0]).toMatchObject({key: "fontSize", from: "13", to: "18"});
    });

    it("says nothing when nothing changed", () => {
        trackConfig({fontSize: "13", theme: ""});
        expect(recentChanges).toHaveLength(0);
    });

    it("widens the existing chip while a slider is being dragged", () => {
        trackConfig({fontSize: "14", theme: ""});
        trackConfig({fontSize: "16", theme: ""});
        trackConfig({fontSize: "18", theme: ""});

        expect(recentChanges).toHaveLength(1);
        // The endpoint matters, not the intermediate values.
        expect(recentChanges[0]).toMatchObject({from: "13", to: "18"});
    });

    it("keeps chips for different keys side by side", () => {
        trackConfig({fontSize: "18", theme: ""});
        trackConfig({fontSize: "18", theme: "Dracula"});

        expect(recentChanges.map(change => change.key)).toEqual(["fontSize", "theme"]);
    });

    it("withdraws the chip when a value is dragged back to where it started", () => {
        trackConfig({fontSize: "18", theme: ""});
        expect(recentChanges).toHaveLength(1);

        trackConfig({fontSize: "13", theme: ""});
        expect(recentChanges).toHaveLength(0);
    });

    it("stays quiet for bulk changes", () => {
        trackConfig({a: "1", b: "1", c: "1", d: "1", e: "1"});
        expect(recentChanges).toHaveLength(0);
    });

    it("drops a chip after its lifetime", () => {
        vi.useFakeTimers();
        trackConfig({fontSize: "18", theme: ""});
        expect(recentChanges).toHaveLength(1);

        vi.advanceTimersByTime(6000);
        expect(recentChanges).toHaveLength(0);
    });

    it("restarts the timer when the chip is widened", () => {
        vi.useFakeTimers();
        trackConfig({fontSize: "14", theme: ""});
        vi.advanceTimersByTime(5000);
        trackConfig({fontSize: "18", theme: ""});

        // The original timer would have fired here; the widened chip is still up.
        vi.advanceTimersByTime(2000);
        expect(recentChanges).toHaveLength(1);

        vi.advanceTimersByTime(5000);
        expect(recentChanges).toHaveLength(0);
    });
});
