import navigation from "$lib/settings/navigation";
import {registry} from "$lib/settings/registry";
import {CONFIG_HEADER, settingLines} from "./parse";
import {clip, firstSentence} from "./plainText";

// Section header + one-line comment for each config key, derived from where the setting lives in
// the navigation tree and from its schema description. A generated config that is a bare list of
// `key = value` lines is unreadable next to a hand-written one, so the write-back path uses this
// to group appended keys by module and annotate them — the same shape a person would write.

export interface SettingAnnotation {
    key: string;
    /** Navigation panel name, e.g. 「终端」. */
    panel: string;
    /** Navigation group name (may be empty), e.g. 「响铃」. */
    group: string;
    /** Panel · group, or just the panel when the group is unnamed. */
    section: string;
    /** Setting display name, e.g. 「响铃功能」. */
    name: string;
    /** One short sentence explaining the setting. */
    comment: string;
    /** Navigation-tree order, so generated sections follow the app's own grouping order. */
    order: number;
}

const MAX_COMMENT = 64;

/** `字体大小：字体大小，单位为点（point）` — the setting's name, then one plain sentence. */
function makeComment(name: string, raw: string): string {
    const sentence = firstSentence(raw, name);
    if (!sentence) return name;
    // A sentence that opens with its own label (`格式：trigger=action`) would read as
    // `快捷键：格式：…`, so join those with a comma instead of a second colon.
    const join = /^[^：]{1,6}：/.test(sentence) ? "，" : "：";
    return `${name}${join}${clip(sentence, MAX_COMMENT - name.length - 1)}`;
}

function buildAnnotations(): Map<string, SettingAnnotation> {
    const annotations = new Map<string, SettingAnnotation>();
    let order = 0;

    for (const panel of navigation) {
        const panelName = panel.name;
        const groups = "groups" in panel ? panel.groups ?? [] : [];
        for (const group of groups) {
            for (const id of group.settings) {
                const entry = registry[id];
                if (!entry || annotations.has(entry.key)) continue;
                const groupName = group.name ?? "";
                const note = "note" in entry ? entry.note : "";
                annotations.set(entry.key, {
                    key: entry.key,
                    panel: panelName,
                    group: groupName,
                    section: groupName ? `${panelName} · ${groupName}` : panelName,
                    name: entry.name,
                    comment: makeComment(entry.name, entry.description || note || ""),
                    order: order++
                });
            }
        }
    }

    return annotations;
}

let cached: Map<string, SettingAnnotation> | null = null;

/** Annotation per Ghostty config key, built once — navigation and the registry are static. */
export function configAnnotations(): Map<string, SettingAnnotation> {
    cached ??= buildAnnotations();
    return cached;
}

/** `# ========== 终端 · 响铃 ==========` — the header style hand-written configs use. */
export function sectionHeader(section: string): string {
    return `# ========== ${section} ==========`;
}

/**
 * The whole config written the way a hand-written one looks: keys grouped under the navigation
 * section they live in, one comment above each — instead of a bare `key = value` list. Keys the
 * navigation tree doesn't place keep their insertion order at the end, so nothing is dropped.
 */
export function annotatedConfigText(entries: Record<string, string | string[]>, includeHeader = true): string {
    const annotations = configAnnotations();
    const sections = new Map<string, {order: number; lines: string[]}>();
    const loose: string[] = [];

    for (const [key, value] of Object.entries(entries)) {
        const annotation = annotations.get(key);
        const lines = settingLines(key, value);
        if (!annotation) {
            loose.push(...lines);
            continue;
        }
        let section = sections.get(annotation.section);
        if (!section) {
            section = {order: annotation.order, lines: []};
            sections.set(annotation.section, section);
        }
        section.lines.push(`# ${annotation.comment}`, ...lines);
    }

    const out = includeHeader ? [...CONFIG_HEADER] : [];
    const ordered = [...sections].sort((a, b) => a[1].order - b[1].order);
    for (const [name, section] of ordered) {
        if (out.length > 0 && out[out.length - 1].trim() !== "") out.push("");
        out.push(sectionHeader(name), ...section.lines);
    }
    if (loose.length > 0) {
        if (out.length > 0 && out[out.length - 1].trim() !== "") out.push("");
        out.push(...loose);
    }

    return `${out.join("\n").replace(/\n+$/, "")}\n`;
}
