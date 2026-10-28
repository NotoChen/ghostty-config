<script lang="ts">
    /**
     * FIXME: this was made specifically with the `adjust-` settings in mind, hence
     * the reliance on the "px" and "%" units. The plan is to eventually make this
     * more generic by allowing a mapping of units to keys and labels, and only allow
     * a single "unit" to have an empty inline label (e.g. "px" -> "", "pct" -> "%"),
     * but for now this is good enough for the primary use case.
     *
     * TODO: also consider if this could be folded into the Number component as an
     * optional "units" feature, since it's basically just a number input with some
     * extra parsing and a pill button group attached.
     */
    import {numberCodec, numberUnitsCodec, type NumberUnit} from "$lib/settings/codecs";
    import PillButtonGroup from "./PillButtons.svelte";
    import Number from "./Number.svelte";

    interface Props {
        value: string; // '' | '2' | '-1' | '20%' | '-15%'
    }

    let {value = $bindable("")}: Props = $props();

    const parsed = $derived(numberUnitsCodec.parse(value));

    // Per-unit reasonable bounds, percentages and pixel offsets have different sane ranges
    const PX_BOUNDS = {min: -100, max: 100};
    const PCT_BOUNDS = {min: -200, max: 200};

    const bounds = $derived(parsed.unit === "pct" ? PCT_BOUNDS : PX_BOUNDS);

    function onNumberChange(n: number | undefined) {
        value = numberUnitsCodec.serialize({num: n, unit: parsed.unit});
    }

    function onUnitChange(next: string) {
        const unit = next as NumberUnit;
        // Re-serialize the same numeric value under the new unit, clamped to the new unit's bounds
        const newBounds = unit === "pct" ? PCT_BOUNDS : PX_BOUNDS;
        const clamped = parsed.num === undefined
            ? undefined
            : Math.min(newBounds.max, Math.max(newBounds.min, parsed.num));
        value = numberUnitsCodec.serialize({num: clamped, unit});
    }
</script>

<div class="adjust">
    <Number
        value={numberCodec.serialize(parsed.num)}
        min={bounds.min}
        max={bounds.max}
        step={1}
        integer
        nullable
        placeholder="未设置"
        onchange={onNumberChange}
    />
    <PillButtonGroup
        value={parsed.unit}
        options={[
            {label: "px", value: "px", variant: "neutral"},
            {label: "%", value: "pct", variant: "neutral"},
        ]}
        onchange={onUnitChange}
        size="compact"
    />
</div>

<style>
.adjust {
    display: inline-flex;
    align-items: center;
    gap: 6px;
}
</style>
