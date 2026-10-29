<script lang="ts">
    import type {Snippet} from "svelte";
    import {tooltip} from "#lib/actions/tooltip.svelte";

    // The two sides plus whether they are kept in sync and serialized as one.
    // Consumers supply parse/serialize that match this shape structurally.
    interface LinkedValue {
        first: string;
        second: string;
        linked: boolean;
    }

    interface Props {
        value: string; // the combined serialized form (e.g. '2' linked or '2,4' unlinked)
        labels: [string, string]; // e.g. ['Left', 'Right'], ['Top', 'Bottom'], ['Light', 'Dark']
        parse: (value: string) => LinkedValue; // split the combined value into two sides + linked flag
        serialize: (value: LinkedValue) => string; // join two sides + linked flag back into the combined value
        control: Snippet<[string, (next: string) => void]>; // renders one side's control
        // Linked mode renders a single unlabeled control (the link button becomes a "split"
        // affordance); unlinking expands to the labeled pair. For consumers where the pair is
        // the exception (themes) rather than the mental model (padding). Off by default.
        collapseLinked?: boolean;
    }

    // eslint-disable-next-line prefer-const
    let {value = $bindable(""), labels, parse, serialize, control, collapseLinked = false}: Props = $props();

    // Seed internal state from the incoming value once. Wrapped in an iife so the
    // initial read of the `parse`/`value` props doesn't trip state_referenced_locally.
    let first = $state("");
    let second = $state("");
    let linked = $state(false);

    // The value we last wrote ourselves. Skipping the reseed for our own commits lets a
    // consumer's `serialize` canonicalize an in-progress draft (e.g. DualTheme collapsing an
    // unlinked pair with an empty side to the single form) without the round-trip clobbering
    // the draft the user is still editing. External writes (reset, import) still reseed.
    let lastCommitted: string | null = null;
    $effect(() => {
        if (value === lastCommitted) return;
        lastCommitted = null;
        const initial = parse(value);
        first = initial.first;
        second = initial.second;
        linked = initial.linked;
    });

    const collapsed = $derived(collapseLinked && linked);

    function commit() {
        lastCommitted = serialize({first, second, linked});
        value = lastCommitted;
    }

    function setSide(which: "first" | "second", next: string) {
        // If linked, both sides get the same value regardless of which one changed
        if (linked) {
            first = next;
            second = next;
        }
        // Otherwise, only the changed side updates
        else {
            if (which === "first") first = next;
            else second = next;
        }

        commit();
    }

    function toggleLink() {
        second = first; // first value wins on both link and unlink
        linked = !linked;
        commit();
    }
</script>

{#snippet linkButton()}
    {@const tip = collapsed
        ? `Split into ${labels[0]} and ${labels[1]}`
        : linked ? `Unlink ${labels[0]} and ${labels[1]}` : `Link ${labels[0]} and ${labels[1]}`}
    <button
        type="button"
        class="link-btn"
        class:linked
        class:solo={collapsed}
        onclick={toggleLink}
        aria-label={tip}
        title={tip}
        use:tooltip={{text: tip}}
    >
        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 56 56">
            <path d="M0 0h56v56H0z" fill="none" />
            <path fill="currentColor" d="m27.707 37.656l3.117-3.164c-3.093-.234-5.109-1.172-6.632-2.695c-4.102-4.102-4.079-9.914-.024-13.969l7.64-7.64c4.102-4.079 9.868-4.102 13.946 0c4.125 4.101 4.078 9.89.024 13.945l-4.594 4.594c.656 1.5.797 3.234.562 4.757l6.867-6.867c5.626-5.625 5.672-13.57-.023-19.265s-13.64-5.649-19.266-.024l-7.992 8.016c-5.625 5.625-5.672 13.594.024 19.265c1.476 1.477 3.351 2.532 6.351 3.047m.586-19.312l-3.117 3.164c3.094.258 5.11 1.172 6.633 2.695c4.101 4.102 4.078 9.914.023 13.969l-7.664 7.64c-4.078 4.079-9.867 4.102-13.945.024c-4.102-4.125-4.078-9.89 0-13.969l4.593-4.594c-.656-1.476-.82-3.234-.585-4.757l-6.868 6.867c-5.601 5.625-5.648 13.594.024 19.265c5.695 5.696 13.664 5.649 19.266.047l8.015-8.039c5.625-5.625 5.672-13.593-.023-19.265c-1.477-1.477-3.352-2.532-6.352-3.047" />
        </svg>
    </button>
{/snippet}

<div class="linked-input">
    {#if collapsed}
        <!-- Linked + collapsed: one unlabeled control; the link button reads as "split". -->
        {@render control(first, next => setSide("first", next))}
        {@render linkButton()}
    {:else}
        <!-- First side -->
        <div class="field">
            <span class="field-label">{labels[0]}</span>
            {@render control(first, next => setSide("first", next))}
        </div>

        {@render linkButton()}

        <!-- Second side -->
        <div class="field">
            <span class="field-label">{labels[1]}</span>
            {@render control(second, next => setSide("second", next))}
        </div>
    {/if}
</div>

<style>
.linked-input {
    display: inline-flex;
    align-items: center;
    gap: 4px;
}

.field {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 2px;
}

.field-label {
    font-size: 0.72em;
    color: var(--font-color-muted);
    user-select: none;
    line-height: 1;
    padding-right: 2px;
}


.link-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    padding: 0;
    border: 0;
    border-radius: 50%;
    background: transparent;
    color: var(--font-color-muted);
    cursor: pointer;
    flex-shrink: 0;
    transition: background 120ms, color 120ms, border-color 120ms;
    /* nudge down to optically align with inputs when labels are showing */
    margin-top: 12px;
}

/* Collapsed linked mode has no field labels, so no nudge is needed. */
.link-btn.solo {
    margin-top: 0;
}

.link-btn svg {
    width: 16px;
    height: 16px;
}

.link-btn:hover {
    color: var(--font-color);
}

.link-btn.linked {
    border-color: var(--font-color-accent);
    color: var(--font-color-accent);
}

.link-btn.linked:hover {
    color: hsl(from var(--font-color-accent) h s calc(l + 15));
}

.link-btn:focus-visible {
    outline: var(--font-color-accent);
}
</style>
