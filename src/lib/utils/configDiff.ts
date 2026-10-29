import {registry} from "#lib/settings/registry";
import {sectionHeader, type SettingAnnotation} from "./configComments";
import {LEGACY_KEYS} from "./parse";

// Comparing the on-disk Ghostty config with the config the app is currently building, and
// applying one onto the other's *text* (so the user's comments and ordering survive).

type ConfigValue = string | string[];

export type DiffStatus = "same" | "changed" | "added" | "reverted" | "local-only";

export interface ConfigDiffRow {
    id: string;
    key: string;
    name: string;
    local: ConfigValue | undefined;
    app: ConfigValue | undefined;
    status: DiffStatus;
}

const EMPTY: string[] = [];

function toLines(value: ConfigValue | undefined): string[] {
    if (value === undefined) return EMPTY;
    return Array.isArray(value) ? value.filter(v => Boolean(v)) : [value];
}

function sameValue(a: ConfigValue | undefined, b: ConfigValue | undefined): boolean {
    const left = toLines(a);
    const right = toLines(b);
    return left.length === right.length && left.every((v, i) => v === right[i]);
}

/** `font-size` → `fontSize`, i.e. the inverse of the store's id derivation. */
export function kebabToCamel(key: string): string {
    const parts = key.split("-");
    let out = parts[0];
    for (let i = 1; i < parts.length; i++) out += parts[i].charAt(0).toUpperCase() + parts[i].slice(1);
    return out;
}

function camelToKebab(id: string): string {
    return id.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`);
}

const PALETTE_LINE = /^(\d+)=(.+)$/;

/** The palette slots a config actually sets, as `index → color`. */
function paletteSlots(entries: ConfigValue | undefined): Map<number, string> {
    const slots = new Map<number, string>();
    for (const line of toLines(entries)) {
        const match = PALETTE_LINE.exec(line.trim());
        if (!match) continue;
        const index = Number.parseInt(match[1], 10);
        if (index >= 0 && index <= 255) slots.set(index, match[2].trim());
    }
    return slots;
}

/**
 * The palette is compared per slot and only over the slots *either* side overrides — the app's
 * defaults carry all 256 entries, so comparing the full arrays would flag every untouched slot.
 */
function diffPalette(localEntries: ConfigValue | undefined, appEntries: ConfigValue | undefined): {status: DiffStatus; local?: string[]; app?: string[]} {
    const local = paletteSlots(localEntries);
    const app = paletteSlots(appEntries);
    const indices = [...new Set([...local.keys(), ...app.keys()])].sort((a, b) => a - b);

    const localOut: string[] = [];
    const appOut: string[] = [];
    let added = 0;
    let reverted = 0;
    let changed = 0;

    for (const index of indices) {
        const left = local.get(index);
        const right = app.get(index);
        if (left === right) continue;
        if (left === undefined) {
            added++;
            appOut.push(`${index}=${right}`);
        }
        else if (right === undefined) {
            reverted++;
            localOut.push(`${index}=${left}`);
        }
        else {
            changed++;
            localOut.push(`${index}=${left}`);
            appOut.push(`${index}=${right}`);
        }
    }

    const status: DiffStatus = changed > 0 ? "changed"
        : added > 0 && reverted > 0 ? "changed"
        : added > 0 ? "added"
        : reverted > 0 ? "reverted"
        : "same";

    return {
        status,
        local: localOut.length ? localOut : undefined,
        app: appOut.length ? appOut : undefined
    };
}

/**
 * Diff rows, keyed by registry id. `app` is the config the editor would export (defaults plus
 * overrides), `local` the values the on-disk file sets:
 * - added    — the app sets it, the file doesn't
 * - changed  — both set, different values
 * - reverted — the file sets it, the app is back at the default (a merge write comments it out)
 * - local-only — a key the app doesn't know (retired or unknown)
 */
export function diffConfigs(
    local: Record<string, ConfigValue>,
    app: Record<string, ConfigValue>
): ConfigDiffRow[] {
    const rows: ConfigDiffRow[] = [];

    for (const [id, entry] of Object.entries(registry)) {
        // The palette is compared per slot below, not as one giant value.
        if (id === "palette") continue;
        const localValue = local[id];
        const appValue = app[id];
        const defaultValue = entry.default;
        // A missing app value is the default by definition: the caller may hand over only the
        // keys the editor overrides (that is exactly what `diff()` returns). Likewise a file
        // line that spells out the default value carries no opinion worth diffing.
        const appIsDefault = appValue === undefined || sameValue(appValue, defaultValue);
        const localIsDefault = localValue === undefined || sameValue(localValue, defaultValue);

        let status: DiffStatus;
        if (localIsDefault) status = appIsDefault ? "same" : "added";
        else if (sameValue(localValue, appValue)) status = "same";
        else if (appIsDefault) status = "reverted";
        else status = "changed";

        rows.push({id, key: entry.key, name: entry.name, local: localValue, app: appValue, status});
    }

    for (const [id, localValue] of Object.entries(local)) {
        if (id === "palette" || id in registry) continue;
        rows.push({
            id,
            key: camelToKebab(id),
            name: camelToKebab(id),
            local: localValue,
            app: undefined,
            status: "local-only"
        });
    }

    // Palette: one logical row, compared per overridden slot (the file's `N=color` lines).
    const palette = diffPalette(local.palette, app.palette);
    if (palette.status !== "same" || local.palette !== undefined || app.palette !== undefined) {
        rows.unshift({
            id: "palette",
            key: "palette",
            name: "调色板",
            local: palette.local,
            app: palette.app,
            status: palette.status
        });
    }

    return rows;
}

export interface DiffSummary {
    added: number;
    changed: number;
    reverted: number;
    localOnly: number;
    same: number;
    total: number;
}

export function summarizeDiff(rows: ConfigDiffRow[]): DiffSummary {
    const summary: DiffSummary = {added: 0, changed: 0, reverted: 0, localOnly: 0, same: 0, total: rows.length};
    for (const row of rows) {
        switch (row.status) {
            case "added": summary.added++; break;
            case "changed": summary.changed++; break;
            case "reverted": summary.reverted++; break;
            case "local-only": summary.localOnly++; break;
            case "same": summary.same++; break;
        }
    }
    return summary;
}

/** Flatten a parsed record into the file's `<key> = <value>` lines. */
export function toConfigLines(entries: Record<string, ConfigValue>): string[] {
    const lines: string[] = [];
    for (const [key, value] of Object.entries(entries)) {
        for (const line of toLines(value)) lines.push(`${key} = ${line}`);
    }
    return lines;
}

const CONFIG_LINE = /^(\s*)([A-Za-z0-9_-]+)(\s*=\s*)(.*)$/;
const COMMENTED_LINE = /^(\s*)#\s*([A-Za-z0-9_-]+)\s*=\s*(.*)$/;

export interface MergeOptions {
    /**
     * Section header + comment per config key. When given, keys that have to be *appended* (the
     * file doesn't mention them yet) are emitted grouped by module, each under a header and a
     * one-line comment — otherwise a generated block is a bare list of `key = value` lines that
     * reads nothing like the hand-written rest of the file.
     */
    annotations?: Map<string, SettingAnnotation>;
}

/**
 * Merge `app` (kebab key → value(s), as produced by `diff()`) into the file's text, keeping
 * every other line — comments included — exactly where it is. Each existing line for a key the
 * app owns is rewritten in place, so a repeatable block stays interleaved with its comments;
 * values beyond the ones the file already has are appended, and surplus lines are dropped.
 *
 * Lines the file sets but the app leaves at its default are untouched by default: writing back
 * "what the editor has" must not silently delete customizations the user never loaded here. Pass
 * them in `commentOut` to opt into reverting those keys, which comments the lines rather than
 * deleting them so the original values stay readable.
 */
export function mergeConfigText(
    localText: string,
    app: Record<string, ConfigValue>,
    commentOut: Iterable<string> = [],
    options: MergeOptions = {}
): string {
    // Values still to be written, per canonical key. A file line spelled with a retired alias
    // (`scrollback-limit`) is rewritten as its replacement, so the two never both appear.
    const pending = new Map<string, string[]>();
    for (const [key, value] of Object.entries(app)) pending.set(key, toLines(value));
    const resetKeys = new Set(commentOut);
    const annotations = options.annotations;

    const source = localText.split("\n");
    const hadTrailingNewline = source.length > 0 && source[source.length - 1] === "";
    const body = hadTrailingNewline ? source.slice(0, -1) : source;

    const out: string[] = [];
    const touched = new Set<string>();
    const disabled = new Set<string>();

    for (const line of body) {
        const match = CONFIG_LINE.exec(line);
        if (!match) {
            // A line we already commented out last time must not be commented again.
            const commented = COMMENTED_LINE.exec(line);
            if (commented) disabled.add(LEGACY_KEYS[commented[2]] ?? commented[2]);
            out.push(line);
            continue;
        }
        const indent = match[1];
        const key = LEGACY_KEYS[match[2]] ?? match[2];
        const values = pending.get(key);
        touched.add(key);

        if (values) {
            const next = values.shift();
            if (next === undefined) continue; // surplus duplicate line: the app owns the key now
            out.push(`${indent}${key} = ${next}`);
            continue;
        }
        if (resetKeys.has(key)) {
            if (disabled.has(key)) continue;
            disabled.add(key);
            out.push(`# ${line.trim()}  # Ghostty Config 中未设置此项`);
            continue;
        }
        out.push(line);
    }

    const remaining = [...pending].filter(([, values]) => values.length > 0);
    const annotated = annotations ? remaining.filter(([key]) => annotations.has(key)) : [];
    const plain = annotations ? remaining.filter(([key]) => !annotations.has(key)) : remaining;

    // Emit the new keys the way a person would write them: grouped under module headers, in the
    // navigation tree's own order, one comment above each key.
    annotated.sort((a, b) => (annotations?.get(a[0])?.order ?? 0) - (annotations?.get(b[0])?.order ?? 0));
    let lastSection = "";
    for (const [key, values] of annotated) {
        const annotation = annotations?.get(key);
        if (!annotation) continue;
        if (annotation.section !== lastSection) {
            if (out.length > 0 && out[out.length - 1].trim() !== "") out.push("");
            out.push(sectionHeader(annotation.section));
            lastSection = annotation.section;
        }
        out.push(`# ${annotation.comment}`);
        for (const value of values) out.push(`${key} = ${value}`);
    }

    for (const [key, values] of plain) {
        if (!touched.has(key) && out.length > 0 && out[out.length - 1].trim() !== "") out.push("");
        for (const value of values) out.push(`${key} = ${value}`);
    }

    return `${out.join("\n")}\n`;
}

export type LineDiffKind = "same" | "add" | "remove";

export interface LineDiffEntry {
    kind: LineDiffKind;
    text: string;
}

/** LCS line diff — only for the write-back preview, so both sides stay under a few hundred lines. */
export function lineDiff(before: string, after: string): LineDiffEntry[] {
    const a = before.split("\n");
    const b = after.split("\n");
    const rows = a.length;
    const cols = b.length;

    // dp[i][j] = LCS length of a[i:], b[j:]
    const dp: Uint32Array[] = Array.from({length: rows + 1}, () => new Uint32Array(cols + 1));
    for (let i = rows - 1; i >= 0; i--) {
        for (let j = cols - 1; j >= 0; j--) {
            dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
        }
    }

    const out: LineDiffEntry[] = [];
    let i = 0;
    let j = 0;
    while (i < rows && j < cols) {
        if (a[i] === b[j]) {
            out.push({kind: "same", text: a[i]});
            i++;
            j++;
        }
        else if (dp[i + 1][j] >= dp[i][j + 1]) {
            out.push({kind: "remove", text: a[i]});
            i++;
        }
        else {
            out.push({kind: "add", text: b[j]});
            j++;
        }
    }
    while (i < rows) out.push({kind: "remove", text: a[i++]});
    while (j < cols) out.push({kind: "add", text: b[j++]});

    return out;
}
