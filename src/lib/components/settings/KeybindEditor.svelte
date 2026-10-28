<script lang="ts">
    import {
        ACTION_DEFINITIONS,
        directionOptions,
        formatTrigger,
        parseKeybind,
        VALID_PREFIXES,
        VALID_MODIFIERS,
        KEY_NAMES,

        resizeDirectionOptions

    } from "$lib/utils/keybinds";
    import {createTooltipAttachment} from "$lib/attachments/tooltip";
    import {isRecordingKey, stepCaps, stepFromEvent} from "$lib/utils/keycaps";
    import {modifierChip} from "$lib/utils/platform";
    import {fly, scale} from "svelte/transition";
    import Group from "./Group.svelte";
    import Item from "./Item.svelte";
    import Dropdown from "./Dropdown.svelte";
    import Separator from "./Separator.svelte";
    import Number from "./Number.svelte";
    import Text from "./Text.svelte";
    import Checkbox from "./Checkbox.svelte";
    import Button from "../Button.svelte";

    interface Props {
        value?: string;
        onsave?: (value: string) => void;
        oncancel?: () => void;
    }

    const {value = "", onsave, oncancel}: Props = $props();

    const PREFIX_HINTS: Record<string, string> = {
        all: "应用于所有终端界面",
        global: "系统范围快捷键（仅 macOS）",
        unconsumed: "不消耗按键，匹配后仍传给终端",
        performable: "仅在该操作当前可执行时匹配"
    };

    type Modifier = string;

    type Step = {
        key: string;
        modifiers: Modifier[];
    };

    const parsed = $derived.by(() => parseKeybind(value));
    let prefixes: string[] = $derived.by(() => {
        if (!parsed.trigger) return [];
        return [...parsed.trigger.prefixes];
    });
    let steps: Step[] = $derived.by(() => {
        if (!parsed.trigger) return [{key: "a", modifiers: []}];
        return parsed.trigger.steps.map((step) => ({
            key: step.key,
            modifiers: [...step.modifiers]
        }));
    });

    let actionName = $derived(parsed.action || ACTION_DEFINITIONS[0].name);
    let actionArg = $derived(parsed.args || "");
    let resizeDirection = $derived.by(() => {
        if (actionName !== "resize_split") return directionOptions[0];
        if (!parsed.args) return directionOptions[0];
        const [dir] = parsed.args.split(",").map((segment) => segment.trim());
        return dir || directionOptions[0];
    });
    let resizeAmount = $derived.by(() => {
        if (actionName !== "resize_split") return "";
        if (!parsed.args) return "";
        const [, amount] = parsed.args.split(",").map((segment) => segment.trim());
        return amount || "";
    });
    const dropdownOptions = $derived.by(() => {
        const currentAction = getCurrentAction();
        if (!currentAction || currentAction.type !== "enum") return [];
        const options = [];
        if (getAllowEmpty()) options.push({name: "default", value: ""});
        if (currentAction.options) {
            options.push(...currentAction.options.map((option) => ({name: option, value: option})));
        }
        return options;
    });


    function togglePrefix(prefix: string) {
        if (prefixes.includes(prefix)) {
            prefixes = prefixes.filter((v) => v !== prefix);
        }
        else {
            prefixes = [...prefixes, prefix];
            if ((prefix === "global" || prefix === "all") && steps.length > 1) {
                steps = [steps[0]];
            }
        }
    }

    function toggleModifier(stepIndex: number, modifier: Modifier) {
        steps = steps.map((step, index) => {
            if (index !== stepIndex) return step;
            const nextModifiers = step.modifiers.includes(modifier)
                ? step.modifiers.filter((v) => v !== modifier)
                : [...step.modifiers, modifier];
            return {key: step.key, modifiers: nextModifiers};
        });
    }

    function updateStepKey(stepIndex: number, v: string) {
        const normalized = v.trim().toLowerCase();
        steps = steps.map((step, index) =>
            index === stepIndex ? {...step, key: normalized} : step
        );
    }

    // Pressing a combo in the key field records it — key name *and* modifiers, so the checkboxes
    // below always reflect the keys actually pressed. Single printable characters without
    // Ctrl/Alt/Cmd are left alone so names like `physical:five` stay typeable.
    function captureKey(event: KeyboardEvent, stepIndex: number) {
        if (!isRecordingKey(event)) return;
        const recorded = stepFromEvent(event);
        if (!recorded) {
            // Only modifiers so far — wait for the real key rather than typing nothing.
            event.preventDefault();
            return;
        }
        event.preventDefault();
        steps = steps.map((step, index) => index === stepIndex ? recorded : step);
    }

    function addSequenceStep() {
        if (steps.length >= 4) return;
        if (prefixes.includes("global") || prefixes.includes("all")) return;
        steps = [...steps, {key: "", modifiers: []}];
    }

    function removeSequenceStep(indexToRemove: number) {
        if (steps.length === 1) return;
        steps = steps.filter((_, index) => index !== indexToRemove);
    }

    const actionMap = Object.fromEntries(ACTION_DEFINITIONS.map((action) => [action.name, action]));

    function getCurrentAction() {
        return actionMap[actionName];
    }

    function getAllowEmpty() {
        const current = getCurrentAction();
        return current && "allowEmpty" in current ? Boolean(current.allowEmpty) : false;
    }

    function getComputedArg() {
        const currentAction = getCurrentAction();
        if (!currentAction) return actionArg;
        if (currentAction.type === "none") return "";
        if (currentAction.type === "resize") return `${resizeDirection},${resizeAmount}`;
        return actionArg;
    }

    function getTrigger() {
        return formatTrigger({prefixes: [...prefixes], steps});
    }

    function getPreview() {
        const trigger = getTrigger();
        const computedArg = getComputedArg();
        return `${trigger}=${actionName}${computedArg ? `:${computedArg}` : ""}`;
    }

    function getErrors() {
        return parseKeybind(getPreview()).error ?? [];
    }

    function handleSave() {
        if (getErrors().length) return;
        const v = getPreview();
        if (onsave) onsave(v);
    }

    function close() {
        if (oncancel) oncancel();
    }

    function actionChanged() {
        actionArg = "";
        resizeDirection = directionOptions[0];
        resizeAmount = "";
    }

    const hasGlobalOrAllPrefix = $derived(prefixes.includes("global") || prefixes.includes("all"));
    const hasMaxSequenceSteps = $derived(steps.length >= 4);
    const isAddStepDisabled = $derived(hasGlobalOrAllPrefix || hasMaxSequenceSteps);

    function getAddStepTooltipMessage() {
        if (hasGlobalOrAllPrefix) return "global/all 快捷键不能是按键序列";
        if (hasMaxSequenceSteps) return "按键序列最多 4 步";
        return "添加序列步骤";
    }

    const addStepTooltipAttachment = createTooltipAttachment(getAddStepTooltipMessage);
</script>


<div class="editor" in:fly={{y: 30, duration: 200}}>
    <Group>
        <Item name="前缀" note="all 让快捷键作用于所有终端界面；global 使其成为系统范围快捷键（仅 macOS）；unconsumed 表示匹配后仍把按键传给终端；performable 表示仅当该操作当前可执行时才匹配。">
            <div class="prefix-row">
                {#each VALID_PREFIXES as prefix (prefix)}
                    <label title={PREFIX_HINTS[prefix] ?? ""}>
                        <Checkbox checked={prefixes.includes(prefix)} onchange={() => togglePrefix(prefix)} />
                        {prefix}
                    </label>
                {/each}
            </div>
        </Item>
    </Group>
    <Group title="触发器" borderless>
        <div class="sequence">
            <datalist id="key-options">
                {#each KEY_NAMES as keyName (keyName)}
                    <option value={keyName}></option>
                {/each}
            </datalist>
            {#each steps as step, index (index)}
                <div class="sequence-step" class:invalid={!step.key}>
                    {#if steps.length > 1}
                        <button transition:scale={{duration: 200}} type="button" class="remove" onclick={() => removeSequenceStep(index)} disabled={steps.length === 1}>
                            &times;
                        </button>
                    {/if}

                    <Item
                        name={steps.length > 1 ? `按键名 ${index + 1}` : "按键名"}
                        note={steps.length > 1
                            ? `序列中第 ${index + 1} 步使用的按键。直接按下组合键即可录入。`
                            : "直接按下组合键即可录入，修饰键会自动勾选；也可手动输入按键名（如 physical:five）。"}
                    >
                        <div class="key-entry">
                            <input
                                type="text"
                                placeholder="按下按键…"
                                bind:value={step.key}
                                list="key-options"
                                oninput={(event) => updateStepKey(index, event.currentTarget.value)}
                                onkeydown={(event) => captureKey(event, index)}
                                {@attach (node: HTMLInputElement) => {
                                    // Focus the first step so the editor is ready to record a combo
                                    // the moment it opens.
                                    if (index === 0) node.focus();
                                }}
                            />
                            <span class="key-caps">
                                {#each stepCaps(step).caps as cap, capIndex (capIndex)}
                                    <kbd class:modifier={capIndex < stepCaps(step).caps.length - 1}>{cap}</kbd>
                                {/each}
                                {#if stepCaps(step).dedicated}
                                    <span class="key-tag">专用键</span>
                                {/if}
                            </span>
                        </div>
                    </Item>
                    <Separator />
                    <Item name="修饰键" note="配置里写成 super/ctrl/alt/shift；方框前的符号是它们在本机键盘上的实体键（⌘ 为 Command）。">
                        <div class="modifiers">
                            {#each VALID_MODIFIERS as modifier (modifier)}
                                <label>
                                    <Checkbox checked={step.modifiers.includes(modifier)} onchange={() => toggleModifier(index, modifier)} />
                                    <span>{modifierChip(modifier)}</span>
                                </label>
                            {/each}
                        </div>
                    </Item>
                </div>
                {#if index < steps.length - 1}
                    <div class="sequence-arrow">→</div>
                {/if}
            {/each}
            <button
                class="add-step"
                type="button"
                onclick={addSequenceStep}
                disabled={isAddStepDisabled}
                {@attach addStepTooltipAttachment}
            >
                <!-- Add Step -->
                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
            </button>
        </div>
    </Group>
    <Group title="操作">
        <Item name="名称" note="按下快捷键时要执行的操作。">
            <Dropdown
                bind:value={actionName}
                options={ACTION_DEFINITIONS.map((action) => ({
                    name: action.name,
                    value: action.name,
                    description: action.description
                }))}
                change={actionChanged}
                searchable
            />
        </Item>

        {#if getCurrentAction()?.type !== "none"}
            <Separator />
            <Item name="参数" note="操作的参数，可选，格式取决于操作类型。">
            {#if getCurrentAction()?.type === "enum"}
                <Dropdown bind:value={actionArg} options={dropdownOptions} />
            {:else if getCurrentAction()?.type === "number"}
                <Number bind:value={actionArg} integer={false} nullable />
            {:else if getCurrentAction()?.type === "integer"}
                <Number bind:value={actionArg} step={1} nullable />
            {:else if getCurrentAction()?.type === "unsignedInteger"}
                <Number bind:value={actionArg} min={getCurrentAction()?.min ?? 0} step={1} nullable />
            {:else if getCurrentAction()?.type === "resize"}
                <!-- TODO: should these be split to separate rows? -->
                <Dropdown
                    bind:value={resizeDirection}
                    options={resizeDirectionOptions.map((direction) => ({
                        name: direction,
                        value: direction
                    }))}
                />
                <Number bind:value={resizeAmount} min={0} step={1} placeholder="像素" nullable />
            {:else if getCurrentAction()?.type === "text"}
                <Text bind:value={actionArg} placeholder="Zig 字符串字面量" />
            {:else if getCurrentAction()?.type === "free"}
                <Text bind:value={actionArg} placeholder="原始序列" />
            {/if}
            </Item>
        {/if}
     </Group>
    <Group title="结果" borderless>
        <div class="preview-box">
            <div class="row">
                    <span class="p4">{getTrigger()}</span>
                    <span> = </span>
                    <span class="p5">{actionName}{getComputedArg() ? `:${getComputedArg()}` : ""}</span>
            </div>
        </div>
        {#if getErrors().length}
            <ul class="errors">
                {#each getErrors() as error (error)}
                    <li>{error}</li>
                {/each}
            </ul>
        {/if}
    </Group>
    <div class="actions">
        <Button onclick={close}>取消</Button>
        <Button
            primary
            onclick={handleSave}
            disabled={getErrors().length > 0}
        >
            完成
        </Button>
    </div>
</div>


<style>
    .editor {
        width: 100%;
        flex: 1;
        padding-bottom: 20px;
        display: flex;
        flex-direction: column;
    }

    .prefix-row {
        display: flex;
        gap: 16px;
        flex-wrap: wrap;
    }

    .prefix-row label {
        border-radius: var(--radius-level-4);
        font-size: 0.8rem;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        background: var(--bg-level-2);
    }

    .sequence {
        display: flex;
        gap: 14px;
        flex-direction: column;
    }

    .sequence-step {
        display: grid;
        background: var(--bg-level-2);
        border: 1px solid var(--border-level-3);
        border-radius: var(--radius-level-3);
        padding: 12px;
        position: relative;
    }

    .sequence-step.invalid {
        border-color: rgba(255, 99, 71, 0.8);
        box-shadow: 0 0 0 1px rgba(255, 99, 71, 0.2);
    }

    .modifiers {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
    }

    .modifiers label {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        color: var(--font-color);
        font-size: 0.75rem;
        cursor: pointer;
        white-space: nowrap;
    }

    .key-entry {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .key-caps {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        flex-wrap: wrap;
    }

    .key-caps kbd {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 1.6em;
        padding: 2px 6px;
        border-radius: var(--radius-level-5);
        background: var(--bg-level-4);
        border: 1px solid var(--border-level-3);
        border-bottom-width: 2px;
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        font-size: 0.75rem;
        line-height: 1.2;
    }

    .key-caps kbd.modifier {
        color: var(--color-input-accent);
    }

    .key-tag {
        padding: 1px 5px;
        border-radius: var(--radius-level-5);
        background: var(--bg-level-4);
        border: 1px solid var(--border-level-2);
        color: var(--font-color-muted);
        font-size: 0.7rem;
    }

    .key-entry input {
        background: rgba(0, 0, 0, 0.15);
        border: 1px solid var(--border-input);
        border-radius: var(--radius-level-5);
        outline: none;
        color: inherit;
        text-align: right;
        max-width: 150px;
        padding: 2px 8px 2px 0;
    }

    .key-entry input:focus {
        background:var(--bg-input-focus);
        outline: var(--border-input-focus);
    }

    .sequence-step .remove {
        background: var(--color-danger);
        color: white;
        position: absolute;
        top: -6px;
        right: -6px;
        border-radius: 50%;
        height: 16px;
        width: 16px;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 0.8rem;
        padding: 0;
        cursor: pointer;
        border: 0;
        outline: 0;
    }

    .sequence-arrow {
        font-size: 1.25rem;
        text-align: center;
    }

    .add-step {
        align-self: center;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 999px;
        border: 1px dashed var(--border-level-3);
        padding: 4px;
        background: transparent;
        color: var(--font-color);
        cursor: pointer;
    }

    .add-step:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .preview-box {
        background: var(--config-bg);
        font-family: var(--config-font-family);
        font-size: var(--config-font-size);
        color: var(--config-fg);
        max-height: 200px;
        overflow-y: auto;
        padding: 8px;
        border-radius: var(--radius-level-3);
        border: 1px solid rgba(0, 0, 0, 0.5);
        box-shadow: 0 0 1px rgba(255, 255, 255, 0.5) inset;
        user-select: text;
    }

    .preview-box .row {
        display: block;
        white-space: pre;
    }

    .p4 {color: var(--config-palette-4);}
    .p5 {color: var(--config-palette-5);}

    .errors {
        margin-top: 8px;
        padding-left: 16px;
        color: #ff9b9b;
    }

    .actions {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        margin-top: 20px;
    }
</style>
