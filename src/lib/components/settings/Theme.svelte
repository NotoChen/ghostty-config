<script lang="ts">
    import {parseTheme} from "#lib/settings/codecs";
    import {preview, type PreviewMode} from "#lib/stores/theme.svelte";
    import DualTheme from "./DualTheme.svelte";
    import PillButtons from "./PillButtons.svelte";

    // The `theme` setting's widget: a pure binding to the raw theme string (DualTheme owns the
    // single-vs-`light:A,dark:B` shape), plus — only when the value is a dual pair — a toggle
    // for which half the app previews. The toggle writes ephemeral view state, never config.

    type Props = {
        value: string;
        options: Array<string | {name: string, value: string, icon?: string}>;
    };

    // eslint-disable-next-line prefer-const
    let {value = $bindable(""), options}: Props = $props();

    const isDual = $derived(parseTheme(value).kind === "dual");
</script>

<div class="theme-setting">
    <DualTheme bind:value {options} />
    {#if isDual}
        <div class="preview-toggle">
            <span class="preview-label">预览中</span>
            <PillButtons
                bind:value={() => preview.mode as string, (v: string) => preview.mode = v as PreviewMode}
                options={[{value: "light", label: "Light"}, {value: "dark", label: "Dark"}]}
            />
        </div>
    {/if}
</div>

<style>
.theme-setting {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 8px;
}

.preview-toggle {
    display: flex;
    align-items: center;
    gap: 8px;
}

.preview-label {
    font-size: 0.72em;
    color: var(--font-color-muted);
    user-select: none;
}
</style>
