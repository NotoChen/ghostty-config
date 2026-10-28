import {untrack} from "svelte";
import {registry} from "$lib/settings/registry";
import {diffSnapshot, firstPaletteChange, formatPreviewValue, snapshotConfig, type ConfigChange, type FlatConfig} from "$lib/utils/preview";

// Tracks what the editor just changed so the terminal preview can say *what* changed instead of
// silently re-theming. One entry is created per changed setting; bulk operations (loading a
// config, resetting everything) are skipped — a wall of chips would say nothing useful.

const LIFETIME = 6000;
const MAX_CHIPS = 3;
const MAX_BULK = 4;

export interface PreviewChange {
    id: number;
    key: string;
    name: string;
    from: string;
    to: string;
}

export const recentChanges: PreviewChange[] = $state([]);

let previous: Record<string, string> | null = null;
let nextId = 1;
const timers: Record<number, ReturnType<typeof setTimeout> | undefined> = {};

function remove(id: number) {
    const timer = timers[id];
    if (timer) clearTimeout(timer);
    delete timers[id];
    const index = recentChanges.findIndex(change => change.id === id);
    if (index !== -1) recentChanges.splice(index, 1);
}

function push(key: string, name: string, from: string, to: string) {
    // A slider drag emits one value per pointer move. Widen the chip that is already up for this
    // key instead of stacking "16.5 → 17 / 17 → 17.5 / 17.5 → 18", which buries the change that
    // actually matters and pushes chips for other settings out of the list.
    const existing = recentChanges.find(change => change.key === key);
    if (existing) {
        existing.name = name;
        existing.to = to;
        const timer = timers[existing.id];
        if (timer) clearTimeout(timer);
        timers[existing.id] = setTimeout(() => remove(existing.id), LIFETIME);
        return;
    }

    const id = nextId++;
    recentChanges.push({id, key, name, from, to});
    while (recentChanges.length > MAX_CHIPS) remove(recentChanges[0].id);
    timers[id] = setTimeout(() => remove(id), LIFETIME);
}

function nameFor(key: string) {
    return registry[key as keyof typeof registry]?.name ?? key;
}

function describe(change: ConfigChange) {
    if (change.key === "palette") {
        const slot = firstPaletteChange(change.from, change.to);
        if (slot) return {name: `调色板 ${slot.index}`, from: slot.from, to: slot.to};
    }
    return {
        name: nameFor(change.key),
        from: formatPreviewValue(change.from),
        to: formatPreviewValue(change.to),
    };
}

/**
 * Diff the live config against the last snapshot. Call from an `$effect` that reads the config
 * so it also re-runs on nested array writes (palette indices, repeatable lists).
 */
export function trackConfig(conf: FlatConfig) {
    // Snapshotting is the reactive part: it reads every value, so an `$effect` calling this
    // re-runs on any edit (nested arrays included). The bookkeeping below reads and writes
    // `recentChanges`, so it must stay untracked — otherwise the effect would depend on the
    // list it is filling and trip Svelte's update-depth guard.
    const current = snapshotConfig(conf);

    untrack(() => {
        if (!previous) {
            previous = current;
            return;
        }

        const changes = diffSnapshot(previous, current);
        previous = current;
        if (changes.length === 0 || changes.length > MAX_BULK) return;

        for (const change of changes) {
            const described = describe(change);
            push(change.key, described.name, described.from, described.to);
        }
    });
}

/** Used when the preview is closed: don't greet the next open with stale edits. */
export function clearRecentChanges() {
    for (const change of [...recentChanges]) remove(change.id);
}
