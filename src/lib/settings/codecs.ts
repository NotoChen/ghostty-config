import type {FeatureDef} from "./types";

// Pure string <-> value codecs for the config-value formats. The store holds flat
// `string | string[]` values (mirroring Ghostty's own string-at-rest model); each widget
// binds the raw string and talks only to a codec here. Co-locating parse + serialize keeps the
// round-trip contract reviewable in one place, and keeps the logic testable without mounting a
// component (see codecs.test.ts). Matches parseKeybind/parseTrigger in #lib/utils/keybinds.ts.

/** A reversible string <-> value codec for one config-value format. */
export interface Codec<T> {
    /** Stored string -> working value. Must be total: tolerate "" and malformed input. */
    parse(raw: string): T;
    /** Working value -> stored string. Invariant: parse(serialize(v)) deep-equals v. */
    serialize(value: T): string;
}



/**
 * Primitive scalar codecs (drive the Switch / Number widgets over the flat string store)
 */

/** Boolean switch: `"true"` <-> true, everything else (incl. `""`/`"false"`) <-> false. */
export const boolCodec: Codec<boolean> = {
    parse: raw => raw.trim().toLowerCase() === "true",
    serialize: value => value ? "true" : "false",
};

/** Numeric field: `""` <-> undefined (unset), otherwise the parsed number. */
export const numberCodec: Codec<number | undefined> = {
    parse(raw) {
        const trimmed = raw.trim();
        if (trimmed === "") return undefined;
        const n = Number(trimmed);
        return Number.isNaN(n) ? undefined : n;
    },
    serialize: value => value === undefined ? "" : String(value),
};



/**
 * Feature list (`feature,no-feature` comma list, diff-encoded against per-feature defaults)
 */

export type FeatureState = Record<string, boolean>;

/** Parameterized by the widget's `features`, so it's a factory rather than a singleton codec. */
export function featureListCodec(features: FeatureDef[]): Codec<FeatureState> {
    return {
        parse(raw) {
            const result: FeatureState = {};

            // Special case: a bare "true"/"false" sets every feature on/off at once.
            const trimmed = raw.trim().toLowerCase();
            if (trimmed === "true" || trimmed === "false") {
                const val = trimmed === "true";
                for (const f of features) result[f.id] = val;
                return result;
            }

            // Otherwise start from defaults and apply the comma list, `no-` negating.
            for (const f of features) result[f.id] = f.default;
            for (const token of raw.split(",").map(t => t.trim()).filter(Boolean)) {
                const isNegation = token.startsWith("no-");
                const id = isNegation ? token.slice(3) : token;
                if (!(id in result)) continue; // ignore unknown/future features
                result[id] = !isNegation;
            }
            return result;
        },
        // Emit only features that differ from their default.
        serialize(current) {
            return features
                .filter(f => current[f.id] !== f.default)
                .map(f => current[f.id] ? f.id : `no-${f.id}`)
                .join(",");
        },
    };
}



/**
 * Linked pair (`2` linked / `2,4` unlinked, `light:x,dark:y` themes) shared by LinkedInput
 */

/** Two sides plus whether they're kept in sync and serialized as one combined value. */
export interface LinkedValue {
    first: string;
    second: string;
    linked: boolean;
}

/** Dual number: `"2"` (linked) or `"2,4"` (unlinked). */
export const dualNumberCodec: Codec<LinkedValue> = {
    parse(raw) {
        const parts = raw.split(",").map(p => parseFloat(p.trim()));
        if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
            return {first: String(parts[0]), second: String(parts[1]), linked: false};
        }
        const single = parseFloat(raw);
        const v = isNaN(single) ? 0 : single;
        return {first: String(v), second: String(v), linked: true};
    },
    serialize({first, second, linked}) {
        return linked ? first : `${first},${second}`;
    },
};

/** Dual theme: `"Name"` (one theme) or `"light:Name,dark:Name"` (per light/dark). */
export const dualThemeCodec: Codec<LinkedValue> = {
    parse(raw) {
        const trimmed = raw.trim();
        let light: string | undefined;
        let dark: string | undefined;

        for (const part of trimmed.split(",")) {
            const match = part.match(/^\s*(light|dark)\s*:(.*)$/i);
            if (!match) continue;
            if (match[1].toLowerCase() === "light") light = match[2].trim();
            else dark = match[2].trim();
        }

        // Only a pair when both modes are specified, per the docs.
        if (light !== undefined && dark !== undefined) {
            return {first: light, second: dark, linked: false};
        }
        return {first: trimmed, second: trimmed, linked: true};
    },
    serialize({first, second, linked}) {
        return linked ? first : `light:${first},dark:${second}`;
    },
};


/**
 * Theme selection: `""` | `"Name"` | `"light:A,dark:B"` -> a discriminated view for the
 * effective-colors resolver and the dual-preview toggle. Built on dualThemeCodec's pair
 * parsing so the DualTheme widget and the resolver share one source of truth for the syntax.
 */
export type ThemeSelection =
    | {kind: "unset"}
    | {kind: "single"; name: string}
    | {kind: "dual"; light: string; dark: string};

/**
 * `single` covers built-in names AND custom names/absolute paths — an unknown name can't be
 * previewed, but the string still round-trips through the store, so imports lose nothing.
 */
export function parseTheme(raw: string): ThemeSelection {
    const trimmed = raw.trim();
    if (trimmed === "") return {kind: "unset"};
    const {first, second, linked} = dualThemeCodec.parse(trimmed);
    if (!linked) return {kind: "dual", light: first, dark: second};
    return {kind: "single", name: trimmed};
}



/**
 * Scroll multiplier: Ghostty's `precision:x,discrete:y` <-> DualNumber's `"x,y"` pair form
 */

export const scrollMultiplierCodec: Codec<string> = {
    parse(raw) {
        const trimmed = raw.trim();
        if (trimmed === "") return "1,3"; // default precision=1, discrete=3
        if (!trimmed.includes(":")) return trimmed; // already bare/uniform
        let discrete = 3, precision = 1;
        for (const part of trimmed.split(",").map(p => p.trim())) {
            const [prefix, num] = part.split(":");
            const n = parseFloat(num);
            if (isNaN(n)) continue;
            if (prefix === "discrete") discrete = n;
            if (prefix === "precision") precision = n;
        }
        return `${precision},${discrete}`;
    },
    serialize(dualValue) {
        const parts = dualValue.split(",").map(p => parseFloat(p.trim()));
        if (parts.length === 1) return String(parts[0]); // uniform
        const [precision, discrete] = parts;
        return `precision:${precision},discrete:${discrete}`;
    },
};



/**
 * Number with units: `""` | `"2"` | `"-1"` | `"20%"` | `"-15%"` (the `adjust-*` metric knobs)
 */

export type NumberUnit = "px" | "pct";
export interface NumberUnitsValue {
    num: number | undefined;
    unit: NumberUnit;
}

export const numberUnitsCodec: Codec<NumberUnitsValue> = {
    parse(raw) {
        const trimmed = raw.trim();
        if (trimmed === "") return {num: undefined, unit: "px"};
        if (trimmed.endsWith("%")) {
            const n = parseInt(trimmed.slice(0, -1), 10);
            return {num: isNaN(n) ? undefined : n, unit: "pct"};
        }
        const n = parseInt(trimmed, 10);
        return {num: isNaN(n) ? undefined : n, unit: "px"};
    },
    serialize({num, unit}) {
        if (num === undefined) return "";
        return unit === "pct" ? `${num}%` : String(num);
    },
};



/**
 * Duration is a compound (`1h30m`) parse + humanize. Asymmetric, i.e. `serialize(parse("90m"))`
 * canonicalizes to `"1h30m"`, so the string round-trip doesn't hold. The general rule:
 * when `serialize(parse(x)) !== x`, the format wants a parse-for-display + validate helper,
 * NOT a symmetric `Codec<T>`.
 */

export interface DurationUnit {
    suffix: string;
    label: string;
    plural: string;
    ms: number;
}

export interface DurationSegment {
    value: number;
    unit: DurationUnit;
}

export interface DurationParseResult {
    ok: boolean;
    segments: DurationSegment[];
    error?: string;
}

export const DURATION_UNITS: DurationUnit[] = [
    {suffix: "ns", label: "纳秒", plural: "纳秒", ms: 0.000001},
    {suffix: "us", label: "微秒", plural: "微秒", ms: 0.001},
    {suffix: "ms", label: "毫秒", plural: "毫秒", ms: 1},
    {suffix: "s", label: "秒", plural: "秒", ms: 1000},
    {suffix: "m", label: "分钟", plural: "分钟", ms: 60_000},
    {suffix: "h", label: "小时", plural: "小时", ms: 3_600_000},
    {suffix: "d", label: "天", plural: "天", ms: 86_400_000},
    {suffix: "y", label: "年", plural: "年", ms: 31_536_000_000},
];

// Longest suffix first so 'ms' matches before 's', 'us' before 's', etc.
const UNITS_BY_SUFFIX_DESC = [...DURATION_UNITS].sort((a, b) => b.suffix.length - a.suffix.length);

/** Parse a compound duration. `nullable` controls whether `""` is valid (means "unset"). */
export function parseDuration(raw: string, nullable = false): DurationParseResult {
    const trimmed = raw.trim();
    if (trimmed === "") {
        return nullable
            ? {ok: true, segments: []}
            : {ok: false, segments: [], error: "此项必填"};
    }

    const segments: DurationSegment[] = [];
    let remaining = trimmed;
    const seenUnits = new Set<string>();

    while (remaining.length > 0) {
        remaining = remaining.trim();
        if (remaining.length === 0) break;

        const numMatch = remaining.match(/^(\d+)/);
        if (!numMatch) {
            return {ok: false, segments, error: `Expected a number, got "${remaining}"`};
        }

        const num = parseInt(numMatch[1], 10);
        remaining = remaining.slice(numMatch[1].length);

        const unit = UNITS_BY_SUFFIX_DESC.find(u => remaining.startsWith(u.suffix));
        if (!unit) {
            return {
                ok: false,
                segments,
                error: remaining.length ? `Unknown unit "${remaining}"` : "Missing unit after number",
            };
        }

        if (seenUnits.has(unit.suffix)) {
            return {ok: false, segments, error: `Duplicate unit "${unit.suffix}"`};
        }

        seenUnits.add(unit.suffix);
        segments.push({value: num, unit});
        remaining = remaining.slice(unit.suffix.length);
    }

    if (segments.length === 0) {
        return {ok: false, segments, error: "请输入时长"};
    }

    return {ok: true, segments};
}

export function humanizeDuration(segments: DurationSegment[]): string {
    if (segments.length === 0) return "";
    return segments
        .map(s => `${s.value} ${s.value === 1 ? s.unit.label : s.unit.plural}`)
        .join(", ");
}
