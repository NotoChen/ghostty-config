<script lang="ts">
    import type {PreviewState} from "#lib/stores/import.svelte";
    import {configAnnotations, sectionHeader} from "#lib/utils/configComments";
    import {CONFIG_HEADER} from "#lib/utils/parse";

    interface Props {
        parsed?: boolean | PreviewState["parsed"];
        parsedDiff?: PreviewState["parsedDiff"];
        parseError?: boolean;
        text?: string | null;
        showEmptyState?: boolean;
        clampHeight?: boolean;
        /**
         * Lay the keys out the way the exporter writes them — module section headers and a
         * one-line comment per key — instead of a flat list. Opt-in because the import previews
         * are about *what changes*, where the headers would just be noise.
         */
        annotate?: boolean;
    }

    const {parsed, parsedDiff, parseError, text, showEmptyState = true, clampHeight = false, annotate = false}: Props = $props();

    const hasDiff = $derived(parsedDiff && Object.keys(parsedDiff).length > 0);

    // Raw text keeps its own comments, so it is highlighted rather than dumped: the same three
    // palette slots the structured branch uses (comment, key, value), which is what makes the
    // file pane and the app pane readable side by side.
    const assignment = /^(\s*)([a-zA-Z][\w-]*)(\s*=\s*)(.*)$/;

    function classify(line: string): {kind: "comment" | "setting" | "plain"; indent?: string; key?: string; eq?: string; value?: string} {
        if (line.trimStart().startsWith("#")) return {kind: "comment"};
        const match = assignment.exec(line);
        if (!match) return {kind: "plain"};
        return {kind: "setting", indent: match[1], key: match[2], eq: match[3], value: match[4]};
    }

    type Row =
        | {kind: "text"; text: string}
        | {kind: "setting"; key: string; value: string | string[]};

    // A file's final newline terminates the last line, it does not start another one — keeping
    // the empty segment would give this pane a trailing blank row the generated pane never has,
    // and the two would read as one line out of step from the bottom up.
    const rawLines = $derived.by(() => {
        const lines = (text ?? "").split("\n");
        if (lines.length > 1 && lines[lines.length - 1] === "") lines.pop();
        return lines;
    });

    const rows = $derived.by<Row[]>(() => {
        if (!parsedDiff) return [];
        if (!annotate) {
            return Object.entries(parsedDiff).map(([key, value]): Row => ({kind: "setting", key, value}));
        }

        const annotations = configAnnotations();
        const sections: Array<{name: string; order: number; rows: Row[]}> = [];
        const loose: Row[] = [];
        for (const [key, value] of Object.entries(parsedDiff)) {
            const annotation = annotations.get(key);
            if (!annotation) {
                loose.push({kind: "setting", key, value});
                continue;
            }
            let section = sections.find(s => s.name === annotation.section);
            if (!section) {
                section = {name: annotation.section, order: annotation.order, rows: []};
                sections.push(section);
            }
            section.rows.push({kind: "text", text: `# ${annotation.comment}`}, {kind: "setting", key, value});
        }

        const out: Row[] = [];
        for (const section of sections.sort((a, b) => a.order - b.order)) {
            if (out.length > 0) out.push({kind: "text", text: ""});
            out.push({kind: "text", text: sectionHeader(section.name)}, ...section.rows);
        }
        if (loose.length > 0) {
            if (out.length > 0) out.push({kind: "text", text: ""});
            out.push(...loose);
        }
        return out;
    });
</script>

<div class="preview" class:clamped={clampHeight}>
    {#if parsed}
        {#if hasDiff}
            <!-- The bytes the exporter actually writes, so this pane and the file it produced can
                 be read against each other line for line. A second copy of the header text here
                 is how the two used to disagree (English in the file, Chinese in the preview). -->
            {#each CONFIG_HEADER.filter(line => line !== "") as line (line)}
                <div class="row p2">{line}</div>
            {/each}
        {:else if showEmptyState}
            <div class="row p2"># 尚未修改默认配置</div>
        {/if}
        <div class="row">&nbsp;</div>

        {#each rows as row, i (i)}
            {#if row.kind === "text"}
                <div class="row p2">{row.text || "\u00a0"}</div>
            {:else if Array.isArray(row.value)}
                {#each row.value as val, v (v)}
                    <div class="row"><span class="p4">{row.key}</span> = <span class="p5">{val}</span></div>
                {/each}
            {:else}
                <div class="row"><span class="p4">{row.key}</span> = <span class="p5">{row.value}</span></div>
            {/if}
        {/each}
    {:else}
        {#if parseError}
            <div class="row p2"># 无法解析配置结构，以下为原始文本：</div>
            <div class="row">&nbsp;</div>
        {/if}
        {#each rawLines as line, i (i)}
            {@const c = classify(line)}
            {#if c.kind === "comment"}
                <div class="row p2">{line}</div>
            {:else if c.kind === "setting"}
                <div class="row">{c.indent}<span class="p4">{c.key}</span>{c.eq}<span class="p5">{c.value}</span></div>
            {:else}
                <!-- A blank line still has to occupy a line box: an empty block is 0px tall, which
                     silently swallows the file's blank lines and pulls this pane out of step with
                     the structured one (which already renders empty rows as an nbsp). -->
                <div class="row">{line || " "}</div>
            {/if}
        {/each}
    {/if}
</div>



<style>
.preview {
    background: var(--config-bg);
    font-family: var(--config-font-family);
    font-size: var(--config-font-size);
    color: var(--config-fg);
    min-height: 175px;
    overflow-y: auto;
    padding: 8px;
    border-radius: var(--radius-level-3);
    border: 1px solid rgba(0, 0, 0, 0.5);
    box-shadow: 0 0 1px rgba(255, 255, 255, 0.5) inset;
    flex: 1;
    user-select: text;
}

.preview.clamped {
    min-height: 80px;
    max-height: 280px;
}

.preview .row {
    display: block;
    white-space: pre;
}

.p2 {color: var(--config-palette-2);}
.p4 {color: var(--config-palette-4);}
.p5 {color: var(--config-palette-5);}

</style>
