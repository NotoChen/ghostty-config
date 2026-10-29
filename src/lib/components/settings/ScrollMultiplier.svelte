<script lang="ts">
    import {scrollMultiplierCodec} from "#lib/settings/codecs";
    import DualNumber from "./DualNumber.svelte";

    interface Props { value: string; }
    let {value = $bindable("")}: Props = $props();

    // The codec translates Ghostty's `precision:x,discrete:y` <-> DualNumber's `"x,y"` pair form.
    const dualValue = $derived(scrollMultiplierCodec.parse(value));

    function onChange(next: string) {
        value = scrollMultiplierCodec.serialize(next);
    }
</script>


<DualNumber bind:value={() => dualValue, onChange} labels={["精确", "离散"]} min={0.01} max={10000} step={0.1} />