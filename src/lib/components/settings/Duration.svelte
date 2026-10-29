<script lang="ts">
    import {humanizeDuration, parseDuration} from "#lib/settings/codecs";

    interface Props {
        value: string;
        nullable?: boolean; // if true, empty string is valid (means "unset")
        placeholder?: string; // overrides default placeholder
        disabled?: boolean; // if true, disables the input
    }

    // eslint-disable-next-line prefer-const
    let {value = $bindable(""), nullable = false, placeholder = "", disabled = false}: Props = $props();

    // Internal input state tracks the bound `value` via a writable $derived: local edits override
    // it while typing, but it reverts to `value` whenever that changes from the outside
    // (reset-to-default, config import). We only push back to `value` once the input parses, so a
    // live preview/error can be shown for an invalid draft without mutating the bound value.
    let internalValue = $derived(value);
    const result = $derived(parseDuration(internalValue, nullable));
    const preview = $derived(humanizeDuration(result.segments));
    const showError = $derived(!result.ok && internalValue !== "");
    const showPreview = $derived(result.ok && preview !== "");


    function onchange(next: string) {
        const nextResult = parseDuration(next, nullable);
        if (nextResult.ok) value = next;
        internalValue = next;
    }
</script>

{#snippet label()}
{#if showError}
    <span class="feedback error-text">{result.error}</span>
{:else if showPreview}
    <span class="feedback preview-text">{preview}</span>
{/if}
{/snippet}


<div class="duration-wrap">
    <div class="input-row">
        {@render label()}
        <input
            class="duration-input"
            class:error={showError}
            type="text"
            bind:value={() => internalValue, onchange}
            placeholder={placeholder || (nullable ? "Default" : "e.g. 750ms")}
            spellcheck="false"
            autocomplete="off"
            size={Math.max(internalValue.length, 8) - 2}
            {disabled}
        />
        <!-- <span class="format-hint">y d h m s ms us ns</span> -->
    </div>
    <!-- {@render label()} -->
</div>


<style>
.duration-wrap {
    display: flex;
    flex-direction: column;
    gap: 4px;
    align-items: flex-end;
    min-width: 180px;
}

.input-row {
    display: flex;
    align-items: center;
    gap: 6px;
    width: 100%;
    justify-content: flex-end;
}

.duration-input {
    background: var(--bg-level-2);
    border: 1px solid var(--border-input);
    border-radius: var(--radius-level-5);
    color: inherit;
    font-family: inherit;
    font-size: inherit;
    outline: 3px solid transparent;
    /* padding: 2px 8px 3px; */
    padding: 0 4px 2px 0; /* This matches text component, but the other one feels better */
    text-align: right;
    transition: border-color 120ms, background-color 120ms;
}

.duration-input:focus {
    background: var(--bg-input-focus);
    outline: var(--border-input-focus);
}

.duration-input.error {
    outline-color: var(--color-danger)
}

.feedback {
    font-size: 0.8em;
    text-align: right;
    line-height: 1.3;
    min-height: 1.3em;
}

.preview-text {
    color: var(--font-color);
    opacity: 0.85;
}

.error-text {
    color: var(--color-danger);
}
</style>
