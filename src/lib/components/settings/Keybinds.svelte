<script lang="ts">
    import KeybindEditor from "./KeybindEditor.svelte";
    import Text from "./Text.svelte";
    import settings from "$lib/settings/registry";
    import {confirm} from "$lib/stores/modals.svelte";
    import {describeAction, formatTrigger, getDiagnostics, parseTrigger, splitKeybind} from "$lib/utils/keybinds";
    import {stepFromEvent, triggerCaps, type TriggerCaps} from "$lib/utils/keycaps";
    import {defaultKeybindSource, modifierLabel} from "$lib/utils/platform";
    import icon from "$lib/images/tabs/keybinds.webp";
    import {fly} from "svelte/transition";
    import Admonition from "../Admonition.svelte";
    import {success} from "$lib/stores/toasts.svelte";

    let selected: number[] = $state([]);
    let {value = $bindable([])}: {value: string[]} = $props();
    let showEditor = $state(false);
    let editorMode = $state<"add" | "edit">("add");
    let editorValue = $state("");

    // The row whose keycaps are currently listening for a key press.
    let recording: number | null = $state(null);

    function handleKeyPress(event: KeyboardEvent) {
        if (event.key === "Escape") selected = [];
        const shouldExpand = event.ctrlKey || event.shiftKey;
        if (!shouldExpand && selected.length) return;
    }

    function select(index: number) {
        return (event: MouseEvent | KeyboardEvent) => {
            if (!event.ctrlKey) return (selected = [index]);
            if (!selected.includes(index)) return selected.push(index);
            selected.splice(selected.indexOf(index), 1);
        };
    }

    // This saves the scroll position when opening the editor and restores
    // it when closing, so that the list doesn't jump around
    let scroller: HTMLDivElement | undefined = $state();
    let scrollPosition = $state(0);

    function onScroll(event: Event) {
        scrollPosition = (event.target as HTMLDivElement).scrollTop;
    }

    // This does the actual restoring of position
    // Could also technically use the save/cancel events too
    $effect(() => {
        if (!showEditor && scroller) {
            scroller.scrollTop = scrollPosition;
        }
    });

    function addNew() {
        editorMode = "add";
        editorValue = "";
        showEditor = true;
    }

    function editSelected() {
        if (selected.length !== 1) return;
        editorMode = "edit";
        editorValue = value[selected[0]];
        showEditor = true;
    }

    function remove() {
        value = value.filter((v, i) => {
            const shouldRemove = selected.includes(i);
            return !shouldRemove;
        });
        selected = [];
        success("已删除所选快捷键");
    }

    const defaultKeybinds = settings.keybind.default;

    function resetDefaults() {
        value = [...defaultKeybinds];
        selected = [];
        if (scroller) scroller.scrollTop = 0;
        success("快捷键已恢复默认");
    }

    async function requestResetDefaults() {
        const shouldReset = await confirm({
            title: "Are you sure?",
            message: "This will reset all keybinds to their defaults.",
            confirmText: "Reset Keybinds",
            cancelText: "Cancel",
            iconSrc: icon
        });

        if (shouldReset) resetDefaults();
    }

    function updateAction(index: number) {
        return (event: Event) => {
            const [trigger] = splitKeybind(value[index]);
            const next = (event.target as HTMLInputElement).value;
            value[index] = `${trigger}=${next}`;
        };
    }

    function handleSave(detail: string) {
        if (editorMode === "add") {
            success("Keybind added");
            value = [...value, detail];

            // Queue up scrolling to the bottom where the new item is added
            setTimeout(() => {
                if (scroller) scroller.scrollTop = scroller.scrollHeight;
            }, 1);
        }
        else if (selected.length === 1) {
            success("Keybind updated");
            value[selected[0]] = detail;
        }
        showEditor = false;
    }

    function handleCancel() {
        showEditor = false;
    }

    // Clicking the keycaps arms the row: the very next key press becomes the binding. Recording
    // replaces the whole trigger (a sequence can't be expressed by pressing one combo), so the
    // dialog stays the place for prefixes and multi-step sequences.
    function startRecording(index: number, event: MouseEvent) {
        event.stopPropagation();
        (event.currentTarget as HTMLElement).focus();
        selected = [index];
        recording = index;
    }

    function recordKey(index: number, event: KeyboardEvent) {
        if (recording !== index) return;
        if (event.key === "Escape") {
            event.preventDefault();
            recording = null;
            return;
        }
        const step = stepFromEvent(event);
        if (!step) {
            // Only modifiers so far: keep waiting for the real key instead of swallowing the press.
            event.preventDefault();
            return;
        }
        event.preventDefault();
        const [, action] = splitKeybind(value[index]);
        const prefixes = parseTrigger(splitKeybind(value[index])[0])?.prefixes ?? [];
        value[index] = `${formatTrigger({prefixes: [...prefixes], steps: [step]})}=${action}`;
        recording = null;
        success("快捷键已更新");
    }

    const diagnostics = $derived.by(() => getDiagnostics(value));

    // Everything a row renders, derived once: keycaps for the trigger, the raw action text and the
    // Chinese explanation of that action.
    const rows = $derived.by(() => value.map((entry) => {
        const [trigger, action] = splitKeybind(entry);
        const parsed = parseTrigger(trigger);
        // An unparseable trigger still has to render something: show it verbatim as one keycap.
        const caps: TriggerCaps = parsed
            ? triggerCaps(parsed)
            : {prefixes: [], steps: [{caps: [trigger], physical: false, dedicated: false}]};
        return {trigger, action, caps, description: describeAction(entry)};
    }));
</script>


{#if showEditor}
    <KeybindEditor
        value={editorValue}
        onsave={handleSave}
        oncancel={handleCancel}
    />
{:else}
    <Admonition>
        列表里显示的是本机键盘上的实际按键；点击某行的按键区域，然后直接按下组合键即可重新录制（Esc 取消）。<br />
        需要前缀（<code>all:</code>、<code>global:</code>、<code>unconsumed:</code>、<code>performable:</code>）或按键序列时，请用「编辑所选」。<br />
        修饰键写法：<code>super</code> = {modifierLabel("super")}、<code>ctrl</code> = {modifierLabel("ctrl")}、<code>alt</code> = {modifierLabel("alt")}、<code>shift</code> = {modifierLabel("shift")}。<br />
        下方列表是 Ghostty 在 {defaultKeybindSource()} 上的默认快捷键。<br />
        不熟悉快捷键用法？请参阅 <a href="https://ghostty.org/docs/config/keybind">官方文档</a>。
    </Admonition>
<div class="expandable-list" in:fly={{y: 30, duration: 200}}>
    <div class="item-list" bind:this={scroller} onscroll={onScroll}>
        {#each value as _, i (i)}
            <div
                class="keybind"
                class:selected={selected.includes(i)}
                class:invalid={diagnostics[i]?.status === "invalid"}
                class:duplicate={diagnostics[i]?.duplicate}
                onclick={select(i)}
                onkeypress={select(i)}
                role="option"
                tabindex="0"
                aria-selected={selected.includes(i)}
            >
                <div class="keybind-row">
                    <button
                        type="button"
                        class="caps"
                        class:recording={recording === i}
                        onclick={(event) => startRecording(i, event)}
                        onkeydown={(event) => recordKey(i, event)}
                        aria-label={`快捷键 ${rows[i].trigger}，点击后按下组合键可重新设置`}
                        title={recording === i ? "按下组合键（Esc 取消）" : `${rows[i].trigger} — 点击后按下组合键可重新设置`}
                    >
                        {#if recording === i}
                            <span class="caps-listening">按下组合键…</span>
                        {:else}
                            {#each rows[i].caps.prefixes as prefix (prefix)}
                                <span class="caps-prefix">{prefix}</span>
                            {/each}
                            {#each rows[i].caps.steps as step, stepIndex (stepIndex)}
                                {#if stepIndex > 0}<span class="caps-arrow">→</span>{/if}
                                {#each step.caps as cap, capIndex (capIndex)}
                                    <kbd class:modifier={capIndex < step.caps.length - 1}>{cap}</kbd>
                                {/each}
                                {#if step.dedicated}
                                    <span class="caps-tag" title="这是键盘上独立的 Copy/Cut/Paste 键，不是 ⌘C 之类的组合键；多数键盘没有这几个键。">专用键</span>
                                {/if}
                                {#if step.physical}<span class="caps-tag">物理键</span>{/if}
                            {/each}
                        {/if}
                    </button>
                    <Text value={rows[i].action} blank={true} change={updateAction(i)} />
                </div>
                {#if rows[i].description}
                    <div class="keybind-desc">{rows[i].description}</div>
                {/if}
            </div>
        {/each}
    </div>
    <div class="list-controls">
        <button onclick={addNew} type="button" title="添加快捷键">&plus;</button>
        <button onclick={remove} disabled={selected.length === 0} type="button" title="删除所选">&ndash;</button>
        <button onclick={editSelected} disabled={selected.length !== 1} type="button" title="编辑所选">
           <svg xmlns="http://www.w3.org/2000/svg" width="16px" height="16px" viewBox="0 0 56 56"><path fill="currentColor" d="m43.293 16.926l2.367-2.32c1.196-1.196 1.242-2.485.188-3.563l-.797-.797c-1.055-1.055-2.344-.937-3.54.211l-2.367 2.344ZM15.66 44.488l25.57-25.547l-4.101-4.125l-25.594 25.57L9.31 45.59c-.211.562.375 1.219.937.984Z" /></svg>
        </button>
        <div class="list-controls-spacer"></div>
        <button onclick={requestResetDefaults} type="button" title="恢复默认">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 5H3" /><path d="M7 12H3" /><path d="M7 19H3" /><path d="M12 18a5 5 0 0 0 9-3 4.5 4.5 0 0 0-4.5-4.5c-1.33 0-2.54.54-3.41 1.41L11 14" /><path d="M11 10v4h4" /></svg>
        </button>
    </div>
</div>
{/if}

<svelte:document onkeydown={handleKeyPress} />

<style>
    .expandable-list {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        position: relative;
        background: var(--bg-level-2);
        border-radius: var(--radius-level-3);
        border: 1px solid var(--border-level-2);
        overflow: hidden;
    }

    .list-controls {
        border-radius: 0 0 var(--radius-level-3) var(--radius-level-3);
        background: var(--bg-level-4);
        min-height: 30px;
        max-height: 30px;
        border-top: 2px solid var(--border-level-4);
        display: flex;
        align-items: center;
        padding: 0 10px;
        gap: 10px;
    }

    .list-controls-spacer {
        flex: 1;
    }

    .item-list {
        display: flex;
        flex-direction: column;
        overflow-y: auto;
    }

    .keybind {
        display: flex;
        flex-direction: column;
        gap: 2px;
        padding: 8px;
    }

    .keybind-row {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 8px;
    }

    /* The key combo, shown as the physical keys it is rather than Ghostty's `super+shift+comma`
       spelling. Clicking turns the row into a recorder, so setting a binding is press-the-keys. */
    .caps {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 4px;
        background: none;
        border: 1px solid transparent;
        border-radius: var(--radius-level-5);
        margin: -3px -5px;
        padding: 2px 4px;
        color: inherit;
        font: inherit;
        text-align: left;
        cursor: pointer;
    }

    .caps:hover {
        background: rgba(255, 255, 255, 0.06);
    }

    .caps.recording {
        border-color: var(--color-input-accent);
        background: rgba(from var(--color-input-accent) r g b / 0.12);
    }

    .caps-listening {
        color: var(--color-input-accent);
        font-size: 0.8rem;
        padding: 2px 4px;
    }

    .caps kbd {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 2em;
        height: 1.9em;
        padding: 0 7px;
        border-radius: var(--radius-level-4);
        background: var(--bg-level-4);
        border: 1px solid var(--border-level-3);
        border-bottom-width: 2px;
        box-shadow: 0 1px 0 rgba(0, 0, 0, 0.35);
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        font-size: 0.95rem;
        font-weight: 500;
        line-height: 1;
        color: var(--font-color);
    }

    .caps kbd.modifier {
        color: var(--color-input-accent);
    }

    .keybind.selected .caps kbd.modifier {
        color: #fff;
    }

    .caps-arrow {
        color: var(--font-color-muted);
        font-size: 0.8rem;
    }

    .caps-prefix,
    .caps-tag {
        padding: 1px 5px;
        border-radius: var(--radius-level-5);
        background: var(--bg-level-4);
        border: 1px solid var(--border-level-2);
        color: var(--font-color-muted);
        font-size: 0.7rem;
    }

    /* What the row's action actually does, in Chinese: the action name next to it must stay the
       raw config spelling, so this line is the only place the meaning is readable. */
    .keybind-desc {
        color: var(--font-color-muted);
        font-size: 0.78rem;
        line-height: 1.45;
        padding-left: 0;
    }

    /* The muted colour disappears against the selection blue, so selected rows lighten it. */
    .keybind.selected .keybind-desc {
        color: rgba(255, 255, 255, 0.85);
    }

    .keybind.selected .caps kbd {
        background: rgba(255, 255, 255, 0.16);
        border-color: rgba(255, 255, 255, 0.3);
        color: #fff;
    }

    .keybind:nth-of-type(even) {
        background: rgba(255, 255, 255, 0.05);
    }

    .keybind.selected {
        background: #2457c9;
    }

    .keybind.duplicate {
        box-shadow: inset 4px 0 0 rgba(255, 196, 70, 0.7);
        background: rgba(255, 196, 70, 0.08);
    }

    .keybind.invalid {
        box-shadow: inset 4px 0 0 rgba(255, 106, 106, 0.8);
        background: rgba(255, 90, 90, 0.12);
    }

    .list-controls button {
        display: flex;
        justify-content: center;
        align-items: center;
        border: 0;
        background: transparent;
        color: var(--font-color);
        font-size: 1rem;
        position: relative;
        cursor: pointer;
    }

    .list-controls button:first-child {
        font-size: 1.5rem;
    }

    .list-controls button + button::before {
        content: "";
        position: absolute;
        left: -6px;
        top: 5px;
        bottom: 5px;
        background: var(--border-level-2);
        width: 2px;
    }

    .list-controls button:disabled {
        opacity: 0.5;
    }
</style>
