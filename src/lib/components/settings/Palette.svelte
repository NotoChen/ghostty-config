<script lang="ts">
    import type {HexColor} from "#lib/utils/colors";
    import Color from "./Color.svelte";


    interface Props {
        value: HexColor[];
        defaultValue: HexColor[];
        // When provided, edits go through this per-index callback instead of mutating `value`
        // This lets a caller display one array (e.g. effective/themed colors) while writing
        // overrides elsewhere. Without it, plain two-way binding as before.
        onSet?: (index: number, color: HexColor) => void;
        resetMessage?: string; // per-swatch right-click toast override (see Color)
        swatchTooltip?: (index: number) => string | undefined; // per-index hover tooltip (e.g. theme-inheritance tier)
    }

    const {value = $bindable([]), defaultValue, onSet, resetMessage, swatchTooltip}: Props = $props();

    const countPerRow = $derived(defaultValue.length >= 8 ? 8 : defaultValue.length);
    const numRows = $derived(Math.ceil(defaultValue.length / countPerRow));
</script>

<div class="grid-container">
    <div class="color-grid" style:--count-per-row={countPerRow} style:--num-rows={numRows}>
        {#each value as _, i (i)}
            <Color defaultValue={defaultValue[i]} bind:value={() => value[i], (v: HexColor) => onSet ? onSet(i, v) : value[i] = v} size={40} label={(i + 1).toString()} {resetMessage} tooltip={swatchTooltip?.(i)} />
        {/each}
    </div>
</div>

<style>
.grid-container {
    display: flex;
    align-items: center;
    flex: 1;
}
.color-grid {
    display: grid;
    /* width: 100%; */
    flex: 1;
    grid-template-columns: repeat(var(--count-per-row), 1fr);
    grid-template-rows: repeat(var(--num-rows), 1fr);
    /* grid-column-gap: 30px; */
    justify-content: space-around;
    justify-items: center;

    /* align-items: center; */
    /* align-content: space-evenly; */
    grid-row-gap: 14px;
    margin-bottom: 12px;
}
</style>