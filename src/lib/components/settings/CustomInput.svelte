<script module lang="ts">
    export interface Preset {
        value: string; // e.g. 'bright', 'transparent', 'off'
        label: string; // e.g. 'Bright', 'Transparent', 'Off'
        description?: string; // optional description for the preset
    }

    export interface ControlProps {
        disabled?: boolean; // whether the inner control should be disabled
        value: string; // the inner control's string value, a preset value, or '' (unset)
        onChange: (next: string) => void; // called when the inner control's value changes
    }
</script>

<script lang="ts">
    import type {Snippet} from "svelte";
    import Dropdown from "./Dropdown.svelte";
    import PillButtonGroup, {type PillOption} from "./PillButtons.svelte";

    interface Props {
        value: string; // the inner control's string value, a preset value, or '' (unset)
        presets: Preset[]; // which special values this setting supports
        widget?: "dropdown" | "pills"; // default: pills if 2 or fewer presets, dropdown if more than 2
        customDefault?: string; // string to seed the custom control with when value is currently a preset
        control: Snippet<[ControlProps]>; // renders the inner custom control
    }

    // eslint-disable-next-line prefer-const
    let {value = $bindable(""), presets, widget, customDefault = "", control}: Props = $props();

    const isPreset = (v: string): boolean => presets.some(s => s.value === v);

    const mode = $derived(isPreset(value) ? value : "custom");

    // Use an iife because svelte linting
    let customValue = $state<string>((() => isPreset(value) ? customDefault : value)());

    // Use an effect to keep the customValue in sync with the value prop, but only if the value is not a preset
    // This allows the customValue to be updated when the value prop changes, but not when the user is actively editing the custom control
    $effect(() => {
        if (isPreset(value)) return; // if the value is a preset, don't change the customValue
        if (value === customValue) return; // if the value is already the same as the customValue, don't change it
        customValue = value;
    });

    const shouldUseDropdown = $derived.by(() => {
        if (widget === "dropdown") return true;
        if (widget === "pills") return false;
        return presets.length > 2;
    });

    const pillOptions = $derived<PillOption[]>([
        {label: "自定义", value: "custom", variant: "neutral"},
        ...presets.map(s => ({label: s.label, value: s.value, variant: "accent" as const})),
    ]);

    const dropdownOptions = $derived([
        {name: "自定义", value: "custom"},
        ...presets.map(s => ({name: s.label, value: s.value, description: s.description})),
    ]);


    function onModeChange(next: string) {
        if (next === "custom") value = customValue;
        else value = next;
    }

    // Track changes coming from the inner custom control
    function onCustomChange(next: string) {
        customValue = next;
        if (mode !== "custom") return; // don't allow the inner control to change the value if we're not in custom mode
        value = customValue;
    }
</script>

<div class="custom-input">
    {#if shouldUseDropdown}
        <Dropdown
            value={mode}
            options={dropdownOptions}
            change={onModeChange}
        />
    {/if}

    <div class="custom-wrapper" class:dimmed={mode !== "custom"}>
        {@render control({value: customValue, onChange: onCustomChange, disabled: mode !== "custom"})}
    </div>

    {#if !shouldUseDropdown}
        <PillButtonGroup
            value={mode}
            options={pillOptions}
            onchange={onModeChange}
        />
    {/if}
</div>

<style>
.custom-input {
    display: inline-flex;
    align-items: center;
    gap: 8px;
}

.custom-wrapper {
    display: inline-flex;
    align-items: center;
    transition: opacity 0.2s ease, filter 0.2s ease;
}

.dimmed {
    opacity: 0.5;
    filter: brightness(0.8);
}
</style>
