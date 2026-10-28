// Schema descriptions are markdown: inline code, links, HTML-ish tags and multi-paragraph,
// list-heavy bodies. Setting this text next to a control needs one short sentence, so the
// flattening rules live here rather than being re-derived per call site (the settings renderer
// shows a summary under each setting, the config writer puts the same sentence in a `#` comment).

/** Strip the markdown/HTML that the schema text carries, leaving plain prose on one line. */
export function toPlainText(raw: string): string {
    return raw
        .replace(/<[^>]+>/g, "")
        .replace(/`/g, "")
        .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
        .replace(/\s+/g, " ")
        .trim();
}

/**
 * The first sentence that actually says something: schema descriptions open with the setting
 * name more often than not (`快捷键。格式：…`), and restating the name is noise.
 */
export function firstSentence(raw: string, name = ""): string {
    for (const part of toPlainText(raw).split(/[。！？]|\.\s+/)) {
        const sentence = part.trim().replace(/^[-*]\s+/, "").replace(/[。．.]$/, "");
        if (sentence && sentence !== name) return sentence;
    }
    return "";
}

/** Clamp on a clause boundary (`，` or a space) so the ellipsis doesn't cut mid-word. */
export function clip(text: string, room: number): string {
    if (text.length <= room) return text;
    const clipped = text.slice(0, room);
    const cut = clipped.lastIndexOf("，") > 20 ? clipped.lastIndexOf("，") : clipped.lastIndexOf(" ");
    return `${(cut > 20 ? clipped.slice(0, cut) : clipped).trim()}…`;
}
