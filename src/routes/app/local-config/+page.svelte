<script lang="ts">
    import {onMount} from "svelte";
    import {resolve} from "$app/paths";
    import Page from "#lib/views/Page.svelte";
    import Admonition from "#lib/components/Admonition.svelte";
    import Button from "#lib/components/Button.svelte";
    import ConfigPreview from "#lib/components/ConfigPreview.svelte";
    import TerminalSample from "#lib/components/TerminalSample.svelte";
    import DialogModal from "#lib/components/modals/DialogModal.svelte";
    import Group from "#lib/components/settings/Group.svelte";
    import Item from "#lib/components/settings/Item.svelte";
    import Separator from "#lib/components/settings/Separator.svelte";
    import config, {defaults, diff, loadReplacing, resetAll} from "#lib/stores/config.svelte";
    import {attachLocalConfig, detachLocalConfig, localConfig, parsedLocalConfig, refreshLocalConfig, writeLocalConfig} from "#lib/stores/localConfig.svelte";
    import {preview, effectiveColors} from "#lib/stores/theme.svelte";
    import {success, error} from "#lib/stores/toasts.svelte";
    import {annotatedConfigText, configAnnotations} from "#lib/utils/configComments";
    import {diffConfigs, lineDiff, mergeConfigText, summarizeDiff} from "#lib/utils/configDiff";
    import {colorsToStyle, configVarsStyle, type ConfigColorSource} from "#lib/utils/configVars";
    import {serialize} from "#lib/utils/parse";

    type Value = string | string[];

    const POLL_MS = 4000;

    const localParsed = $derived(parsedLocalConfig());
    const localRecord = $derived(localParsed as Record<string, Value>);
    const appExport = $derived(diff());
    // The editor's *effective* config — defaults with the overrides on top — except the palette,
    // where only the slots the user actually overrode are interesting (`diff()` has them as
    // `N=color` lines; the raw store always carries all 256 defaults).
    const appRecord = $derived({
        ...(config as unknown as Record<string, Value>),
        palette: (appExport.palette as string[] | undefined) ?? []
    });
    const rows = $derived(diffConfigs(localRecord, appRecord));
    const summary = $derived(summarizeDiff(rows));
    const resetKeys = $derived(rows.filter(row => row.status === "reverted").map(row => row.key));
    const visibleRows = $derived(rows.filter(row => row.status !== "same"));

    // --- Rendering two configs side by side ------------------------------------------------
    // The app column reuses the live effective colors; the file column resolves its own theme
    // and overrides against the same defaults, so the terminal samples are directly comparable.
    const appColors = $derived(effectiveColors());
    const appStyle = $derived(configVarsStyle(appColors, {
        cursorOpacity: config.cursorOpacity,
        fontFamily: config.fontFamily,
        fontSize: config.fontSize
    }));

    function text(value: Value | undefined, fallback: string): string {
        return typeof value === "string" && value ? value : fallback;
    }

    const baseSource: ConfigColorSource = {...defaults, theme: ""};

    const localSource = $derived<ConfigColorSource>({
        background: text(localParsed.background, defaults.background),
        foreground: text(localParsed.foreground, defaults.foreground),
        cursorColor: text(localParsed.cursorColor, defaults.cursorColor),
        cursorText: text(localParsed.cursorText, defaults.cursorText),
        selectionBackground: text(localParsed.selectionBackground, defaults.selectionBackground),
        selectionForeground: text(localParsed.selectionForeground, defaults.selectionForeground),
        palette: Array.from({length: 16}, (_, i) => (localParsed.palette as string[] | undefined)?.[i] || defaults.palette[i]),
        cursorOpacity: text(localParsed.cursorOpacity, defaults.cursorOpacity),
        fontFamily: Array.isArray(localParsed.fontFamily) ? localParsed.fontFamily : defaults.fontFamily,
        fontSize: text(localParsed.fontSize, defaults.fontSize),
        theme: typeof localParsed.theme === "string" ? localParsed.theme : ""
    });

    const localStyle = $derived(colorsToStyle(localSource, baseSource, preview.mode));

    // --- Loading the file into the editor ---------------------------------------------------
    function loadLocalIntoEditor() {
        resetAll();
        loadReplacing(localParsed);
        success("已把本地配置载入编辑器");
    }

    // --- Manual hand-over (the only option on a static deploy) --------------------------------
    // The bridge reads `~/Library/Application Support/com.mitchellh.ghostty/config.ghostty` off
    // disk, which a hosted page cannot do. Uploading the file or pasting its text fills the same
    // state the bridge would, so the comparison below is identical — only write-back is missing,
    // and the merged result is offered as a download instead.
    let filePicker: HTMLInputElement | null = $state(null);
    let pasteText = $state("");

    function attachUpload(event: Event) {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.addEventListener("load", () => {
            const body = typeof reader.result === "string" ? reader.result : "";
            if (!body) {
                error("读取文件失败，请换一个文件或改为粘贴文本。");
                return;
            }
            attachLocalConfig(body, file.name, "file");
            success(`已载入 ${file.name}`);
        });
        reader.readAsText(file);
        // Let the same file be picked again after a detach.
        input.value = "";
    }

    function attachPaste() {
        if (!pasteText.trim()) {
            error("先粘贴一份配置文本。");
            return;
        }
        attachLocalConfig(pasteText, "粘贴的配置", "paste");
        success("已载入粘贴的配置");
    }

    function usePasteFromClipboard() {
        try {
            void window.navigator.clipboard.readText().then((clipboard) => {
                if (!clipboard.trim()) {
                    error("剪贴板里没有文本。");
                    return;
                }
                pasteText = clipboard;
                attachPaste();
            });
        }
        catch {
            error("读取剪贴板失败，请手动粘贴。");
        }
    }

    // The downloaded replacement for write-back: what the file would have become.
    function downloadMerged() {
        const blob = new Blob([targetText], {type: "text/plain"});
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "config";
        link.click();
        URL.revokeObjectURL(url);
        showWrite = false;
        success("已下载，替换 Ghostty 配置目录里的文件即可生效");
    }

    // --- Write-back -------------------------------------------------------------------------
    let showWrite = $state(false);
    let writeMode = $state<"merge" | "replace">("merge");
    let revertUnset = $state(false);
    let annotate = $state(true);
    let validation = $state<{state: "idle" | "checking" | "ok" | "error"; message?: string}>({state: "idle"});
    let isWriting = $state(false);

    // Appended keys get a module header + one-line comment, so the written file reads like a
    // hand-written one instead of a bare `key = value` dump.
    const annotations = configAnnotations();
    const mergeOptions = $derived(annotate ? {annotations} : {});

    const mergedText = $derived(mergeConfigText(localConfig.text, appExport, revertUnset ? resetKeys : [], mergeOptions));
    const replacedText = $derived(annotate ? annotatedConfigText(appExport) : serialize(appExport));
    const targetText = $derived(writeMode === "merge" ? mergedText : replacedText);
    const previewLines = $derived(lineDiff(localConfig.text, targetText));
    const changeCount = $derived(previewLines.filter(line => line.kind !== "same").length);

    // A merge with no reverts is the default action, so it decides whether there is anything to
    // write at all — "the editor is at defaults" alone must not offer a pointless overwrite.
    const defaultTarget = $derived(mergeConfigText(localConfig.text, appExport, [], {annotations}));
    const defaultChangeCount = $derived(lineDiff(localConfig.text, defaultTarget).filter(line => line.kind !== "same").length);

    function openWrite() {
        writeMode = "merge";
        revertUnset = false;
        annotate = true;
        validation = {state: "idle"};
        showWrite = true;
    }

    function closeWrite() {
        if (isWriting) return;
        showWrite = false;
    }

    async function validateTarget() {
        validation = {state: "checking"};
        const result = await writeLocalConfig(targetText, true);
        validation = result.ok
            ? {state: "ok", message: result.warning}
            : {state: "error", message: [result.error, result.detail].filter(Boolean).join("：")};
    }

    async function applyWrite() {
        if (isWriting) return;
        isWriting = true;
        const result = await writeLocalConfig(targetText, false);
        isWriting = false;

        if (!result.ok) {
            error([result.error, result.detail].filter(Boolean).join("：") || "写入本地配置失败");
            return;
        }
        if (result.warning) error(result.warning);
        success(result.backup ? `已写入本地配置，原文件备份为 ${result.backup.split("/").pop()}` : "已写入本地配置");
        showWrite = false;
        await refreshLocalConfig();
    }

    // --- Polling ----------------------------------------------------------------------------
    onMount(() => {
        void refreshLocalConfig();
        const timer = setInterval(() => {
            if (typeof document !== "undefined" && document.hidden) return;
            if (showWrite) return; // don't swap the file out from under the preview
            void refreshLocalConfig();
        }, POLL_MS);
        return () => clearInterval(timer);
    });

    const statusLabel: Record<string, string> = {
        "added": "仅应用内",
        "changed": "两边不同",
        "reverted": "仅本地（应用为默认）",
        "local-only": "应用不识别",
        "same": "相同"
    };

    function displayValue(value: Value | undefined): string {
        if (value === undefined) return "";
        return Array.isArray(value) ? value.join("\n") : value;
    }

    // `Item`'s note is rendered as HTML; the file path comes from the bridge, so escape it.
    const escapeHtml = (raw: string) => raw.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
</script>

<Page title="本地配置">
    {#if localConfig.status === "ready"}
        <Group title={localConfig.source === "bridge" ? "本地配置文件" : "已载入的配置"}>
            <Item
                name="来源"
                note={localConfig.source === "bridge"
                    ? `磁盘上的文件：<code>${escapeHtml(localConfig.path ?? "")}</code>`
                    : `${localConfig.source === "file" ? "上传的文件" : "粘贴的文本"}：<code>${escapeHtml(localConfig.path ?? "")}</code>，只存在于这个页面里，不会上传到任何服务器。`}
            >
                <span class="state ok">
                    {localConfig.source === "bridge" ? "已连接本机" : "已载入"}
                </span>
            </Item>
            {#if localConfig.mtimeMs}
                <Separator />
                <Item name="最近修改" note="每 4 秒自动重读一次，文件在别处被改过时这里会跟着刷新。">
                    <span class="muted">{new Date(localConfig.mtimeMs).toLocaleString("zh-CN")}</span>
                </Item>
            {/if}
            <Separator />
            <Item
                name="操作"
                note={localConfig.source === "bridge"
                    ? "「载入到编辑器」会把本地配置读进设置页，之后你的改动就会出现在差异里。"
                    : "「载入到编辑器」会把这份配置读进设置页；改完后可以下载合并结果，自己替换掉配置文件。"}
            >
                <div class="button-row">
                    {#if localConfig.source === "bridge"}
                        <Button onclick={() => void refreshLocalConfig()}>重新读取</Button>
                    {:else}
                        <Button onclick={detachLocalConfig}>换一份配置</Button>
                    {/if}
                    <Button primary onclick={loadLocalIntoEditor}>载入到编辑器</Button>
                    <Button
                        primary
                        disabled={defaultChangeCount === 0}
                        title={defaultChangeCount === 0 ? "还没有可合并的改动" : "预览并应用这份改动"}
                        onclick={openWrite}
                    >{localConfig.source === "bridge" ? "写入本地…" : "合并并下载…"}</Button>
                </div>
            </Item>
        </Group>
        <div class="compare">
            <section class="pane">
                <h3>本地配置文件</h3>
                <p class="pane-note">
                    {localConfig.source === "bridge"
                        ? "磁盘上的原始文本，包含注释。"
                        : "你提供的原始文本，包含注释。"}
                </p>
                <!-- eslint-disable-next-line svelte/require-optimized-style-attribute -->
                <div class="terminal" style={localStyle}>
                    <TerminalSample />
                </div>
                <ConfigPreview parsed={false} text={localConfig.text} />
            </section>
            <section class="pane">
                <h3>应用内配置</h3>
                <p class="pane-note">当前编辑器将要导出的内容（只含非默认项）。还没改过任何设置时这里是空的。</p>
                <!-- eslint-disable-next-line svelte/require-optimized-style-attribute -->
                <div class="terminal" style={appStyle}>
                    <TerminalSample />
                </div>
                <ConfigPreview parsed={true} parsedDiff={appExport} showEmptyState={true} annotate={true} />
            </section>
        </div>

        <Group title="差异">
            <div class="summary">
                <span class="chip changed">两边不同 {summary.changed}</span>
                <span class="chip added">仅应用内 {summary.added}</span>
                <span class="chip reverted">仅本地 {summary.reverted}</span>
                <span class="chip local-only">不识别 {summary.localOnly}</span>
                <span class="chip">相同 {summary.same}</span>
            </div>
            <p class="legend">
                「仅本地」表示文件里设了这一项、而应用内还是默认值——点「载入到编辑器」后这些项就会变成一致。
                「不识别」是 1.4.0 已移除或本工具未收录的键，合并时不会被改动。
            </p>
        </Group>

        {#if visibleRows.length === 0}
            <Admonition size="1.5rem">本地文件与应用内配置完全一致。</Admonition>
        {:else}
            <div class="diff-table">
                <div class="diff-head">
                    <span>设置</span>
                    <span>本地文件</span>
                    <span>应用内</span>
                </div>
                {#each visibleRows as row (row.id)}
                    <div class="diff-row {row.status}">
                        <span class="setting-cell">
                            <span class="name">{row.name}</span>
                            <code class="key">{row.key}</code>
                            <span class="status">{statusLabel[row.status]}</span>
                        </span>
                        <pre class="value">{displayValue(row.local) || "—"}</pre>
                        <pre class="value">{displayValue(row.app) || "—"}</pre>
                    </div>
                {/each}
            </div>
        {/if}
    {:else}
        <Admonition size="1.5rem">
            {#if localConfig.status === "loading" || localConfig.status === "idle"}
                正在检查本机是否运行着带桥接的开发服务器…
            {:else}
                当前页面读不到磁盘上的 Ghostty 配置——静态部署（比如 GitHub Pages）没有本机桥接。
                把配置交给它即可：上传文件或粘贴文本，之后的差异对比、合并与注释分组和本机运行完全一致，
                只是「直接写回磁盘」改为下载合并后的文件。
            {/if}
        </Admonition>
        {#if localConfig.candidates.length}
            <p class="probed">本机桥接尝试过的路径：</p>
            <ul class="probed">
                {#each localConfig.candidates as candidate (candidate)}
                    <li><code>{candidate}</code></li>
                {/each}
            </ul>
        {/if}
        <Group title="读取配置文件">
            <Item name="上传配置文件" note="选 Ghostty 的配置文件（通常在 <code>~/.config/ghostty/config</code> 或 macOS 的 <code>~/Library/Application Support/com.mitchellh.ghostty/config.ghostty</code>）。文件只在浏览器里读取，不会上传。">
                <div class="button-row">
                    <input id="local-config-input" type="file" accept=".ghostty,config,.conf,text/plain" onchange={attachUpload} bind:this={filePicker} />
                    <Button primary onclick={() => filePicker?.click()}>选择文件…</Button>
                </div>
            </Item>
            <Separator />
            <Item name="粘贴配置文本" note="把配置文件的内容整段粘进来，效果和上传文件一样。">
                <div class="paste">
                    <textarea bind:value={pasteText} rows="6" placeholder="# 在这里粘贴你的 Ghostty 配置…"></textarea>
                    <div class="button-row">
                        <Button onclick={usePasteFromClipboard}>从剪贴板读取</Button>
                        <Button primary onclick={attachPaste} disabled={!pasteText.trim()}>载入这段文本</Button>
                    </div>
                </div>
            </Item>
        </Group>
        <div class="actions">
            <Button onclick={() => void refreshLocalConfig()}>重新检测本机桥接</Button>
            <a class="link" href={resolve("/app/import-export")}>或到「导入与导出」直接导入</a>
        </div>
    {/if}
</Page>

{#if showWrite}
    <DialogModal title={localConfig.source === "bridge" ? "写入本地配置" : "合并并下载"} maxWidth="760px" onclose={closeWrite}>
        <div class="mode-row">
            <label>
                <input type="radio" bind:group={writeMode} value="merge" />
                合并（保留注释与顺序）
            </label>
            <label>
                <input type="radio" bind:group={writeMode} value="replace" />
                覆盖整个文件
            </label>
        </div>
        <p class="write-note">
            {#if localConfig.source === "bridge"}
                目标文件：<code>{localConfig.path}</code><br />
                写入前会自动备份为 <code>*.bak-时间戳</code>。共 {changeCount} 行发生变化。
            {:else}
                下载后用它替换 Ghostty 配置目录里的文件；替换前请自己留一份备份。
                共 {changeCount} 行发生变化。
            {/if}
        </p>
        <label class="opt-row">
            <input type="checkbox" bind:checked={annotate} />
            <span>
                生成中文注释并按功能模块分组，带 <code># ========== 面板 · 分组 ==========</code> 分节标题
            </span>
        </label>
        {#if writeMode === "merge"}
            <p class="write-note subtle">只在文件里还没有这一项时添加注释；文件里已有的行原样保留你自己的注释。</p>
            <label class="opt-row">
                <input type="checkbox" bind:checked={revertUnset} />
                <span>
                    同时处理「仅本地」的 {summary.reverted} 项：把它们注释掉，让应用内默认值生效
                </span>
            </label>
            {#if !revertUnset && summary.reverted > 0}
                <p class="write-note subtle">未勾选时，文件里这些行会原样保留——不会删掉你没在应用里载入过的自定义项。</p>
            {/if}
        {:else}
            <p class="write-note subtle">覆盖模式会用「应用内配置」的整体内容替换文件，你原有的注释和未收录的键都会丢失。</p>
        {/if}
        <div class="diff-preview">
            {#each previewLines as line, i (i)}
                {#if line.kind === "same"}
                    <div class="line">{line.text || " "}</div>
                {:else if line.kind === "add"}
                    <div class="line add">+ {line.text}</div>
                {:else}
                    <div class="line remove">- {line.text}</div>
                {/if}
            {/each}
        </div>
        {#if validation.state === "ok"}
            <p class="validation ok">
                Ghostty 校验通过。
                {#if validation.message}<br />{validation.message}{/if}
            </p>
        {:else if validation.state === "error"}
            <p class="validation error">校验未通过：{validation.message}</p>
        {/if}
        {#snippet footer()}
            <Button onclick={closeWrite} disabled={isWriting}>取消</Button>
            {#if localConfig.source === "bridge"}
                <Button onclick={validateTarget} disabled={validation.state === "checking" || isWriting}>
                    {validation.state === "checking" ? "校验中…" : "校验"}
                </Button>
                <Button primary onclick={applyWrite} disabled={isWriting}>
                    {isWriting ? "写入中…" : "确认写入"}
                </Button>
            {:else}
                <!-- No bridge on a static deploy: hand the merged file over instead of writing disk. -->
                <Button primary onclick={downloadMerged} disabled={changeCount === 0}>
                    下载配置文件
                </Button>
            {/if}
        {/snippet}
    </DialogModal>
{/if}

<style>
.probed {
    font-size: 0.85rem;
    color: var(--font-color-muted);
}

.actions,
.button-row {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    align-items: center;
}

.link {
    font-size: 0.85rem;
    color: var(--font-color-muted);
}

#local-config-input {
    display: none;
}

.paste {
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;
}

.paste textarea {
    width: 100%;
    box-sizing: border-box;
    resize: vertical;
    background: rgba(0, 0, 0, 0.15);
    border: 1px solid var(--border-input);
    border-radius: var(--radius-level-5);
    padding: 8px;
    color: inherit;
    font-family: var(--config-font-family);
    font-size: 0.8rem;
    line-height: 1.5;
    outline: none;
}

.paste textarea:focus {
    background: var(--bg-input-focus);
    outline: var(--border-input-focus);
}

.state {
    color: var(--font-color-muted);
}

.state.ok {
    color: var(--config-palette-2);
}

.muted {
    color: var(--font-color-muted);
}

.compare {
    display: grid;
    grid-template-columns: 1fr 1fr;
    /* Four shared rows — heading, note, terminal sample, config preview — so a note that wraps
       to a second line on one side can't push that column's terminal and preview out of line
       with the other's. */
    grid-template-rows: auto auto auto 1fr;
    column-gap: 16px;
    row-gap: 8px;
    margin: 16px 0;
}

/* Both panes are subgrids over those four rows, so the rows stay in step; the row gap comes
   from the parent grid. */
.pane {
    display: grid;
    grid-row: span 4;
    grid-template-rows: subgrid;
    min-width: 0;
}

@media (max-width: 900px) {
    /* Stacked: the panes no longer share rows, so each is a plain column of its own again. */
    .compare {
        grid-template-columns: 1fr;
        grid-template-rows: none;
    }

    .pane {
        grid-row: auto;
        grid-template-rows: none;
        row-gap: 8px;
    }
}

.pane h3 {
    margin: 0;
    font-size: 0.95rem;
    font-weight: 600;
}

.pane-note {
    margin: 0;
    font-size: 0.8rem;
    color: var(--font-color-muted);
}

.terminal {
    border-radius: var(--radius-level-3);
    overflow: hidden;
}

.summary {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    padding: 4px 0;
}

.chip {
    font-size: 0.78rem;
    padding: 3px 8px;
    border-radius: 999px;
    border: 1px solid var(--border-level-3);
    color: var(--font-color-muted);
}

.chip.added {color: var(--config-palette-2); border-color: var(--config-palette-2);}
.chip.changed {color: var(--config-palette-4); border-color: var(--config-palette-4);}
.chip.reverted {color: var(--config-palette-1); border-color: var(--config-palette-1);}
.chip.local-only {color: var(--config-palette-6); border-color: var(--config-palette-6);}

.diff-table {
    border: 1px solid var(--border-level-3);
    border-radius: var(--radius-level-3);
    overflow: hidden;
    margin-bottom: 20px;
}

.diff-head,
.diff-row {
    display: grid;
    grid-template-columns: 1.1fr 1fr 1fr;
    gap: 12px;
    padding: 8px 12px;
    align-items: start;
}

.diff-head {
    font-size: 0.78rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--font-color-muted);
    background: var(--bg-level-2);
    border-bottom: 1px solid var(--border-level-3);
}

.diff-row + .diff-row {
    border-top: 1px solid var(--border-level-1);
}

.diff-row.changed {background: rgba(255, 199, 57, 0.06);}
.diff-row.added {background: rgba(179, 224, 58, 0.06);}
.diff-row.reverted {background: rgba(255, 102, 109, 0.05);}
.diff-row.local-only {background: rgba(157, 234, 246, 0.05);}

.setting-cell {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
}

.setting-cell .name {
    font-weight: 500;
}

.setting-cell .key,
.setting-cell .status {
    font-size: 0.72rem;
    color: var(--font-color-muted);
}

.value {
    margin: 0;
    font-family: var(--config-font-family);
    font-size: 0.78rem;
    white-space: pre-wrap;
    word-break: break-word;
    user-select: text;
}

.mode-row {
    display: flex;
    gap: 18px;
    flex-wrap: wrap;
    font-size: 0.9rem;
}

.mode-row label {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
}

.write-note {
    font-size: 0.85rem;
    color: var(--font-color-muted);
    line-height: 1.6;
}

.write-note.subtle {
    margin-top: -4px;
    opacity: 0.8;
}

.opt-row {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    font-size: 0.85rem;
    line-height: 1.5;
    cursor: pointer;
}

.legend {
    margin: 4px 0 0;
    font-size: 0.8rem;
    color: var(--font-color-muted);
    line-height: 1.6;
}

.diff-preview {
    background: var(--config-bg);
    color: var(--config-fg);
    font-family: var(--config-font-family);
    font-size: 0.75rem;
    border-radius: var(--radius-level-3);
    border: 1px solid rgba(0, 0, 0, 0.5);
    padding: 8px;
    max-height: 320px;
    overflow: auto;
    user-select: text;
}

.diff-preview .line {
    white-space: pre-wrap;
    word-break: break-word;
    padding: 0 4px;
    border-radius: 2px;
}

.diff-preview .add {
    background: rgba(80, 200, 120, 0.18);
}

.diff-preview .remove {
    background: rgba(255, 99, 71, 0.18);
}

.validation {
    font-size: 0.85rem;
    margin: 0;
}

.validation.ok {color: var(--config-palette-2);}
.validation.error {color: #ff9b9b; white-space: pre-wrap;}
</style>
