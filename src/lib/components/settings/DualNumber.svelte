<script lang="ts">
    import {dualNumberCodec, type LinkedValue} from "#lib/settings/codecs";
    import LinkedInput from "./LinkedInput.svelte";
    import Number from "./Number.svelte";

    interface Props {
        value: string; // '2' (linked) or '2,4' (unlinked)
        labels: [string, string]; // e.g. ['Left', 'Right'] or ['Top', 'Bottom']
        min?: number;
        max?: number;
        step?: number;
    }

    // eslint-disable-next-line prefer-const
    let {value = $bindable("0"), labels, min, max, step = 1}: Props = $props();
</script>

<LinkedInput bind:value {labels} parse={(raw: string) => dualNumberCodec.parse(raw)} serialize={(v: LinkedValue) => dualNumberCodec.serialize(v)}>
    {#snippet control(num: string, setNum: (next: string) => void)}
        <Number
            value={num}
            size={2}
            {min}
            {max}
            {step}
            onchange={(n: number | undefined) => {
                if (n !== undefined) setNum(String(n));
            }}
        />
    {/snippet}
</LinkedInput>
