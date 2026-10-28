<script lang="ts">
    import {marked} from "marked";
    import {type Snippet} from "svelte";
    import {createTooltipAttachment} from "$lib/attachments/tooltip";
    import type {GhosttyPlatform} from "$lib/settings/types";
    import Badge from "../Badge.svelte";
    import {searchState} from "$lib/stores/search.svelte";
    import {setSetting} from "$lib/contexts";

    interface Props {
        name?: string;
        note?: string;
        platform?: GhosttyPlatform[];
        since?: string;
        description?: string;
        settingId?: string; // for search reference
        children: Snippet;
        onReset?: () => void;
        isNonDefault?: boolean;
        inline?: boolean;
        // Tooltip text; when present, a "theme" badge marks the value as coming from the
        // active theme (rather than an explicit override or the app default).
        themeBadge?: string;
    }

    const {name = "", note = "", platform, since, description, settingId, children, onReset, isNonDefault = false, inline = true, themeBadge}: Props = $props();
    const tooltipAttachment = createTooltipAttachment("恢复默认值");


     const platformLabelMap: Record<GhosttyPlatform, string> = {
        "macos": "macOS",
        "linux": "Linux",
        "gtk": "GTK",
        "gtk-wayland": "GTK (Wayland)",
        "gtk-x11": "GTK (X11)"
    };

    const platformLabels = $derived(
        platform?.map((value) => platformLabelMap[value]).filter(Boolean) ?? []
    );

    const getPlatformBadgeLabel = (labels: string[]) => {
        if (labels.length === 0) return "";
        if (labels.length === 1) return labels[0];
        return `${labels[0]} +${labels.length - 1}`;
    };

    const infoBadges = $derived.by(() => {
        const badges: Array<{label: string, type: "platform" | "version" | "theme"}> = [];
        const platformBadge = getPlatformBadgeLabel(platformLabels);
        if (platformBadge) badges.push({label: platformBadge, type: "platform"});
        if (since) badges.push({label: since, type: "version"});
        if (themeBadge) badges.push({label: "来自主题", type: "theme"});
        return badges;
    });

    const getBadgeTooltip = (badge: {label: string, type: "platform" | "version" | "theme"}) => {
        if (badge.type === "platform") return platformLabels.length > 1 ? `可用平台：${platformLabels.join("、")}` : `平台：${platformLabels[0]}`;
        if (badge.type === "version") return `Ghostty v${since} 起支持`;
        if (badge.type === "theme") return themeBadge ?? "";
        return "";
    };

    // The schema description belongs next to the control, in full: it explains the value being
    // edited, so reading it must not cost a click. Muted, small type keeps a page of them
    // scannable, and the markdown renders in place (lists, `code`, links).
    const descriptionHtml = $derived(description ? marked.parse(description) : note);

    let itemElement: HTMLElement | null = null;
    let shouldHighlight = $state(false);
    $effect(() => {
        if (!searchState.selectedId || !itemElement) return;
        if (searchState.selectedId !== settingId) return;

        const settingEl = itemElement;
        if (!settingEl) return;

        let cancelled = false;

        // Flash the setting item to draw attention to it
        requestAnimationFrame(() => {
            if (cancelled) return;
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            settingEl.scrollIntoView({behavior: "smooth", block: "center"});
            shouldHighlight = true;
        });
        return () => {
            cancelled = true;
            shouldHighlight = false;
        };
    });

    // Give the setting context so that child components can access the setting info if needed
    // svelte-ignore state_referenced_locally
    setSetting({name, note, platform, since, description: description || ""});
</script>

<div
    class="setting-item"
    data-setting-id={settingId || undefined}
    bind:this={itemElement}
    class:flash-highlight={shouldHighlight}
    onanimationend={() => shouldHighlight = false}
>
    <div class="row">
        {#if name}
        <div class="row-left">
            <div class="setting-name">{name}</div>
            {#if infoBadges.length > 0 || (isNonDefault && onReset)}
                <div class="setting-extra">
                    {#each infoBadges as badge (badge.label)}
                        <Badge type={badge.type} label={badge.label} tooltip={getBadgeTooltip(badge)} />
                    {/each}

                    {#if isNonDefault && onReset}
                        <button
                            class="reset-button"
                            onclick={onReset}
                            title="恢复默认值"
                            type="button"
                            {@attach tooltipAttachment}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 56 56">
                                <path d="M0 0h56v56H0z" fill="none" />
                                <path fill="currentColor" stroke="currentColor" stroke-width="2.5" paint-order="stroke" d="M50.148 34.914c0-8.953-6.046-15.14-16.757-15.14H17.664l-5.508.257l4.454-3.797l6.75-6.609c.374-.375.562-.82.562-1.43c0-1.218-.82-2.062-2.062-2.062c-.516 0-1.126.258-1.524.656L6.555 20.312c-.469.446-.703.985-.703 1.57c0 .563.234 1.102.703 1.548l13.781 13.523a2.2 2.2 0 0 0 1.524.656c1.242 0 2.062-.843 2.062-2.062c0-.61-.188-1.055-.562-1.43l-6.75-6.586l-4.454-3.797l5.508.235h16.078c7.992 0 12.235 4.406 12.235 10.71c0 6.329-4.243 11.016-12.235 11.016h-5.39c-1.29 0-2.133.938-2.133 2.086c0 1.149.844 2.086 2.133 2.086h5.414c10.5 0 16.382-5.976 16.382-14.953" />
                            </svg>

                        </button>
                    {/if}
                </div>
            {/if}
        </div>
        {/if}
        {#if inline}
            <div class="row-right">
                <div class="setting">{@render children()}</div>
            </div>
        {/if}
    </div>
    {#if descriptionHtml}
        <div class="desc">
            <!-- eslint-disable-next-line svelte/no-at-html-tags -->
            {@html descriptionHtml}
        </div>
    {/if}
    {#if !inline}<div class="setting">{@render children()}</div>{/if}
</div>


<style>
.setting-item {
    display: flex;
    flex-direction: column;
    gap: 5px;
    /* width: 100%; */
    /* box-sizing: border-box; */
    /* padding: 4px 8px; */
    /* margin: -4px -8px; */
    /* position: relative; */
}

.setting-item.flash-highlight {
    position: relative;
}

.setting-item:global(.flash-highlight)::before {
    content: "";
    position: absolute;
    /* group padding size */
    top: -12px;
    left: -12px;
    right: -12px;
    bottom: -12px;
    animation: flash-highlight 2s ease-in-out;
    pointer-events: none;
}

.setting-item:global(.flash-highlight):first-child::before {
    border-radius: var(--radius-level-4) var(--radius-level-4) 0 0;
}

.setting-item:global(.flash-highlight):last-child::before {
    border-radius: 0 0 var(--radius-level-4) var(--radius-level-4);
}

.setting-item .row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
}

.row-left {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
}

.setting-name {
    font-weight: 500;
}

.setting-extra {
    display: inline-flex;
    align-items: center;
    gap: 5px;
}

.reset-button {
    background: none;
    border: 0;
    padding: 0;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-level-5);
    color: var(--font-color-muted);
    transition: all 150ms cubic-bezier(0.2, 0, 0.38, 0.9);
    outline: none;
}

.reset-button:focus-visible {
    outline: var(--border-input-focus);
}

.reset-button:hover {
    background-color: var(--bg-level-2);
    color: var(--font-color);
}

.reset-button:active {
    transform: scale(0.95);
}

.reset-button svg {
    width: 14px;
    height: 14px;
}

.row-right {
    display: flex;
    align-items: center;
    flex: 1;
    justify-content: flex-end;
    gap: 10px;
}

.setting {
    display: flex;
    flex: 1;
    justify-content: flex-end;
}

.row-right .setting {
    flex: none;
}

/* When the setting is not inline, the description sits under the name and the setting content goes below it. */
.setting-item > .setting {
    margin-top: 4px;
    justify-content: flex-start;
}

/* The setting's explanation, next to its control: the full schema markdown, always on screen
   instead of behind an info icon or an expand toggle. */
.desc {
    color: var(--font-color-muted);
    font-size: 0.85rem;
    line-height: 1.55;
    min-width: 0;
}

.desc :global(p) {
    margin: 0 0 6px;
}

.desc :global(p:last-child) {
    margin-bottom: 0;
}

.desc :global(ul),
.desc :global(ol) {
    margin: 4px 0 6px;
    padding-left: 1.1rem;
}

.desc :global(li + li) {
    margin-top: 3px;
}

.desc :global(a) {
    color: var(--color-input-accent);
}

.desc :global(code) {
    padding: 1px 4px;
    border-radius: var(--radius-level-4);
    background: rgba(from var(--bg-level-2) r g b / 0.6);
    border: 1px solid var(--border-level-1);
    font-size: 0.95em;
}

@keyframes flash-highlight {
    0% {
        background: rgba(128, 199, 255, 0.45);
        box-shadow: 0 0 0 1px rgba(152, 217, 255, 0.6);
    }

    100% {
        background: transparent;
        box-shadow: 0 0 0 1px rgba(152, 217, 255, 0);
    }
}
</style>