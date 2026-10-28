// Pure helpers behind the "what changed" cue in the terminal preview. The store holds flat
// `string | string[]` values, so a snapshot stringifies arrays and `diffSnapshot` compares those
// flattened strings — one implementation shared by the preview store and its unit tests.

export type FlatConfig = Record<string, string | string[]>;

export interface ConfigChange {
    key: string;
    from: string;
    to: string;
}

/** Flatten a config object into comparable strings (arrays become JSON). */
export function snapshotConfig(conf: FlatConfig): Record<string, string> {
    const snapshot: Record<string, string> = {};
    for (const key of Object.keys(conf)) {
        const value = conf[key];
        snapshot[key] = Array.isArray(value) ? JSON.stringify(value) : value;
    }
    return snapshot;
}

/** Keys whose flattened value differs between two snapshots. */
export function diffSnapshot(before: Record<string, string>, after: Record<string, string>): ConfigChange[] {
    const changes: ConfigChange[] = [];
    for (const key of Object.keys(after)) {
        if (before[key] === after[key]) continue;
        changes.push({key, from: before[key] ?? "", to: after[key]});
    }
    return changes;
}

function asArray(raw: string): string[] | null {
    if (!raw.startsWith("[")) return null;
    try {
        const parsed: unknown = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed.map(String) : null;
    }
    catch {
        return null;
    }
}

/**
 * Human-readable one-liner for a config value, sized for a preview chip: booleans and the
 * unset state read in Chinese, lists collapse to a count, and long strings are clipped.
 */
export function formatPreviewValue(raw: string, maxLength = 18): string {
    if (raw === "") return "未设置";
    if (raw === "true") return "开启";
    if (raw === "false") return "关闭";

    const list = asArray(raw);
    if (list) return `${list.length} 项`;

    return raw.length > maxLength ? `${raw.slice(0, maxLength - 1)}…` : raw;
}

/**
 * The palette is one array-valued setting, so a single palette edit would otherwise read as
 * "16 项 → 16 项". Pick the first differing slot so the chip can name the index and show the
 * two colors instead.
 */
export function firstPaletteChange(fromRaw: string, toRaw: string): {index: number; from: string; to: string} | null {
    const before = asArray(fromRaw) ?? [];
    const after = asArray(toRaw) ?? [];
    const length = Math.max(before.length, after.length);
    for (let i = 0; i < length; i++) {
        if ((before[i] ?? "") === (after[i] ?? "")) continue;
        return {index: i, from: before[i] || "未设置", to: after[i] || "未设置"};
    }
    return null;
}
