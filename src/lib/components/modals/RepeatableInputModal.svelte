<script lang="ts">
    import DialogModal from "#lib/components/modals/DialogModal.svelte";
    import Button from "#lib/components/Button.svelte";
    import Text from "../settings/Text.svelte";
    import Admonition from "../Admonition.svelte";
    import {onMount} from "svelte";

    interface Props {
        draftValues: string[];
        placeholder?: string;
        canReorder?: boolean;
        title?: string;
        allowDuplicates?: boolean;
        allowEmpty?: boolean;
        onclose?: () => void;
        onsave?: (values: string[]) => void;
    }

    let {
        draftValues = $bindable([]),
        placeholder = "New item", // eslint-disable-line prefer-const
        canReorder = true, // eslint-disable-line prefer-const
        title = "Repeatable Value Editor", // eslint-disable-line prefer-const
        allowDuplicates = false, // eslint-disable-line prefer-const
        allowEmpty = true, // eslint-disable-line prefer-const
        onclose, // eslint-disable-line prefer-const
        onsave, // eslint-disable-line prefer-const
    }: Props = $props();


    const duplicateValues = $derived((() => {
        const counts: Record<string, number> = Object.create(null) as Record<string, number>;
        for (const item of draftValues) {
            const normalized = item.trim().toLowerCase();
            if (!normalized) continue;
            counts[normalized] = (counts[normalized] ?? 0) + 1;
        }
        return new Set(Object.entries(counts).filter(([, count]) => count > 1).map(([item]) => item));
    })());

    const hasDuplicates = $derived(duplicateValues.size > 0);
    const isEmpty = $derived(draftValues.every(item => item.trim() === ""));
    const canSave = $derived.by(() => {
        if (!allowDuplicates && hasDuplicates) return false;
        if (!allowEmpty && isEmpty) return false;
        return true;
    });


    function addRow() {
        draftValues = [...draftValues, ""];
    }

    function removeRow(index: number) {
        draftValues = draftValues.filter((_, itemIndex) => itemIndex !== index);
    }

    function moveUp(index: number) {
        if (index === 0) return;
        const newValues = [...draftValues];
        const current = newValues[index];
        newValues[index] = newValues[index - 1];
        newValues[index - 1] = current;
        draftValues = newValues;
    }

    function moveDown(index: number) {
        if (index >= draftValues.length - 1) return;
        const newValues = [...draftValues];
        const current = newValues[index];
        newValues[index] = newValues[index + 1];
        newValues[index + 1] = current;
        draftValues = newValues;
    }

    let editorRef: HTMLDivElement | null = $state(null);
    onMount(() => {
        if (!editorRef) return;

        // TODO: figure out why eslint is having a hissy fit about this, it's perfectly valid code
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
        const firstInput = editorRef.querySelector<HTMLInputElement>("input");
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        if (firstInput) firstInput.focus();
    });
</script>

<DialogModal {title} {onclose}>
    {#snippet icon()}
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 56 56">
            <path d="M0 0h56v56H0z" fill="none" />
            <path fill="currentColor" d="M16.293 29.64c6.469 0 11.906-5.413 11.906-11.93c0-6.515-5.367-11.905-11.906-11.905c-6.516 0-11.906 5.39-11.906 11.906c0 6.562 5.39 11.93 11.906 11.93M33.8 13.376h16.008c1.008 0 1.804-.774 1.804-1.781c0-.985-.797-1.758-1.804-1.758H33.8c-1.008 0-1.782.773-1.782 1.758c0 1.008.774 1.781 1.782 1.781m-17.485 12.07c-.82 0-1.546-.562-1.546-1.43v-4.874h-4.477c-.797 0-1.453-.657-1.453-1.43s.656-1.43 1.453-1.43h4.477V11.43c0-.891.726-1.43 1.546-1.43s1.524.539 1.524 1.43v4.851h4.476c.797 0 1.454.657 1.454 1.43s-.657 1.43-1.454 1.43H17.84v4.875c0 .867-.703 1.43-1.524 1.43m17.485.211h16.008c1.008 0 1.804-.773 1.804-1.781c0-.984-.797-1.758-1.804-1.758H33.8c-1.008 0-1.782.774-1.782 1.758c0 1.008.774 1.781 1.782 1.781M6.168 37.938h43.64a1.786 1.786 0 0 0 1.805-1.782c0-.984-.797-1.758-1.804-1.758H6.168c-1.008 0-1.781.774-1.781 1.758c0 .985.773 1.782 1.78 1.782m0 12.257h43.64c1.008 0 1.805-.773 1.805-1.758c0-.984-.797-1.78-1.804-1.78H6.168a1.766 1.766 0 0 0-1.781 1.78c0 .985.773 1.758 1.78 1.758" />
        </svg>
    {/snippet}

    {#if hasDuplicates && !allowDuplicates}
        <Admonition>
            以下值重复：
            <ul>
                {#each Array.from(duplicateValues) as value, i (i)}
                    <li>{value}</li>
                {/each}
            </ul>
            保存前请删除或修改重复的值。
        </Admonition>
    {/if}

    <div class="editor" bind:this={editorRef}>
        <!--
            Keyed by index intentionally: draftValues are plain strings that are neither
            unique nor stable, so there's no natural key to derive. Text is a thin native-input
            wrapper with no internal state or transitions, so index keying is safe here. The
            only wart is that reordering a focused row moves focus by position rather than by row.
            If that becomes a problem, switch to identity keys via either (a) a parallel `ids`
            array mutated in lockstep with every add/remove/move, or (b) modelling rows as
            {id, value} objects. Both were considered and judged not worth the bookkeeping.
        -->
        <!-- eslint-disable-next-line svelte/require-each-key -->
        {#each draftValues as _, index}
            <div class="editor-row" class:duplicate={duplicateValues.has(draftValues[index].trim().toLowerCase()) && draftValues[index].trim() !== ""}>
                <Text bind:value={draftValues[index]} {placeholder} />
                <div class="row-actions">
                    {#if canReorder}
                        <Button icon type="button" title="上移" onclick={() => moveUp(index)} disabled={index === 0}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m18 15-6-6-6 6" /></svg>
                        </Button>
                        <Button icon type="button" title="下移" onclick={() => moveDown(index)} disabled={index === draftValues.length - 1}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                        </Button>
                    {/if}
                    <Button icon danger type="button" title="移除" onclick={() => removeRow(index)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                    </Button>
                </div>
            </div>
        {/each}
    </div>

    {#snippet footer()}
        <div class="footer-left">
            <Button onclick={addRow}>添加一行</Button>
        </div>
        <Button onclick={onclose}>关闭</Button>
        <Button primary onclick={() => onsave?.(draftValues)} disabled={!canSave}>保存</Button>
    {/snippet}
</DialogModal>

<style>

/* .editor {
    display: flex;
    flex-direction: column;
    gap: 8px;
    background: var(--bg-level-2);
    border: 1px solid var(--border-level-2);
    border-radius: var(--radius-level-3);
    padding: 8px;
} */

.editor {
    display: flex;
    flex-direction: column;
    gap: 6px;
    max-height: 210px;
    overflow-y: auto;
    padding: 4px;
}

.editor-row {
    display: flex;
    align-items: center;
    gap: 8px;
    /* margin-top: 4px; */
    /* padding-top: 8px; */
}

.editor-row :global(input) {
    max-width: 100%;
    flex: 1;
}

.editor-row.duplicate :global(input) {
    border-color: var(--color-warning);
}

.row-actions {
    display: flex;
    align-items: center;
    gap: 4px;
}

.footer-left {
    margin-right: auto;
}
</style>
