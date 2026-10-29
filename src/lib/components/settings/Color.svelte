<script lang="ts">
    import {fade, fly} from "svelte/transition";
    import {luminosity, isDark, type HexColor} from "#lib/utils/colors";
    import ColorPicker from "#lib/components/ColorPicker.svelte";
    import {success} from "#lib/stores/toasts.svelte";
    import {toAppWindow} from "#lib/attachments/portal";
    import {createTooltipAttachment} from "#lib/attachments/tooltip";

    interface Props {
        value: HexColor;
        size?: number;
        label?: string;
        defaultValue?: HexColor;
        disabled?: boolean;
        resetMessage?: string; // right-click toast override, e.g. "now follows the theme" while a theme is active
        tooltip?: string; // hover tooltip on the swatch, e.g. its theme-inheritance state
    }

    // eslint-disable-next-line prefer-const
    let {value = $bindable(), size = 20, label = "", defaultValue, disabled = false, resetMessage, tooltip}: Props = $props();
    const swatchTooltip = createTooltipAttachment(() => tooltip ?? "");
    const borderColor = $derived(`rgba(255, 255, 255, ${(value ? luminosity(value) : 0) * 0.0027451 + 0.3})`);
    const labelColor = $derived(value && isDark(value) ? `var(--font-color)` : "black");
    let popoutOpen = $state(false);

    function click(event: Event) {
        if (disabled) return;
        event.preventDefault();
        event.stopPropagation();
        popoutOpen = !popoutOpen;
    }

    function reset(event: MouseEvent) {
        if (disabled) return;
        event.preventDefault();
        event.stopPropagation();
        if (defaultValue !== undefined) {
            value = defaultValue;
            success(resetMessage ?? "颜色已恢复默认值");
        }
    }

    function keydown(event: KeyboardEvent) {
        if (!popoutOpen) return;
        if (event.key === "Escape") click(event);
    }
</script>


<svelte:document onkeydown={keydown} />

<div class="color-wrap" style:width="{size}px" style:height="{size}px" style:background-color={value} style:border-color={borderColor} class:disabled {@attach swatchTooltip}>
    {#if label}<span class="label" style:color={labelColor}>{label}</span>{/if}
    <input type="color" bind:value style:width="{size}px" style:height="{size}px" onclick={click} oncontextmenu={reset} {disabled} />
</div>

{#if popoutOpen}
<div class="shadow" onclick={click} transition:fade={{duration: 200}} role="none" {@attach toAppWindow}></div>
<div class="picker-container" transition:fly={{y: 32, duration: 200}} {@attach toAppWindow}>
    <ColorPicker bind:value />
    <button class="close" onclick={click} type="button" title="关闭"><span>×</span></button>
</div>
{/if}


<style>
/* .color-wrap-container {
    position: relative;
} */
.shadow {
    background: rgba(18, 18, 18, 0.75);
    position: absolute;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
    z-index: 1;
}

.picker-container {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 1000;
}
.picker-container .close {
    background: var(--color-danger);
    color: white;
    position: absolute;
    top: -4px;
    right: -4px;
    border-radius: 50%;
    height: 16px;
    width: 16px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 1.1rem;
    padding: 0;
    cursor: pointer;
    border: 0;
    outline: 0;
}

.picker-container .close span {
    margin-top: -1.5px;
}

.color-wrap {
    position: relative;
    display: flex;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    outline: none;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.3);
    /* box-shadow: 0 0 1px 0px rgba(255, 255, 255, 0.5) inset; */
    box-shadow: 0 0 3px 0px black;
    justify-content: center;
    align-items: center;
}

.color-wrap.disabled {
    opacity: 0.4;
    cursor: not-allowed;
}

input {
    position: absolute;
    top: -2px;
    left: -2px;
    width: 20px;
    height: 20px;
    border: 0;
    padding: 0;
    outline: none;
    box-shadow: none;
    opacity: 0;
}

input:focus {
    outline: var(--border-input-focus);
}

.label {
    /* text-shadow: 0 0 5px black; */
    font-weight: 600;
}
</style>