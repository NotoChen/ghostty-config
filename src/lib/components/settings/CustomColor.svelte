<script lang="ts">
    import type {HexColor} from "#lib/utils/colors";
    import Color from "./Color.svelte";
    import CustomInput, {type Preset, type ControlProps} from "./CustomInput.svelte";

    interface Props {
        value: string; // hex color, special string, or '' (unset)
        presets: Preset[]; // which special values this setting supports
        default?: HexColor; // passed through to Color for reset
        widget?: "dropdown" | "pills"; // default: pills if 2 or fewer presets, dropdown if more than 2
        resetMessage?: string; // passed through to Color's right-click toast
    }

    // eslint-disable-next-line prefer-const
    let {value = $bindable(""), presets, default: defaultValue, widget, resetMessage}: Props = $props();
</script>

<CustomInput
    bind:value
    {presets}
    {widget}
    customDefault={defaultValue ?? "#ffffff"}
>
    {#snippet control({value: innerValue, onChange, disabled}: ControlProps)}
        <Color bind:value={() => (innerValue || "#ffffff") as HexColor, onChange} {defaultValue} {disabled} {resetMessage} />
    {/snippet}
</CustomInput>
