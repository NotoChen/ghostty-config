<script lang="ts">
    import {onMount} from "svelte";
    import ShareIcon from "#lib/components/icons/ShareIcon.svelte";
    import DialogModal from "#lib/components/modals/DialogModal.svelte";
    import Button from "#lib/components/Button.svelte";
    import {error, success} from "#lib/stores/toasts.svelte";
    import {debounce} from "#lib/utils/debounce";


    // Prereq
    onMount(() => {
        canUseNativeShare = !isTooLong && !!window.navigator.share;
    });

    // Local props and state
    interface Props {
        isTooLong: boolean;
        shareUrl: string | null;
        configText: string;
        onclose?: () => void;
        ondownload?: () => void;
    }

    const {isTooLong, shareUrl, configText, onclose, ondownload}: Props = $props();

    let notice = $state<string | null>(null);
    let canUseNativeShare = $state(false);

    const displayNotice = $derived(
        notice ?? (isTooLong ? null : "此链接包含你的配置数据，请只分享给你信任的人。")
    );

    // Button handlers
    async function copyToClipboard(text: string, successNotice: string, failureNotice: string) {
        try {
            await window.navigator.clipboard.writeText(text);
            notice = successNotice;
            success(successNotice);
        }
        catch {
            notice = failureNotice;
            error(failureNotice);
        }
    }

    const onClickCopy = debounce(() => {
        if (isTooLong) {
            void copyToClipboard(
                configText,
                "配置已复制。你也可以直接用纯文本分享，而不走链接。",
                "无法访问剪贴板，请改用导出文件。"
            );
        }
        else if (shareUrl) {
            void copyToClipboard(
                shareUrl,
                "分享链接已复制到剪贴板。",
                "请手动选中链接并复制。"
            );
        }
    }, 300);

    async function nativeShareLink() {
        if (!shareUrl) return;
        try {
            await navigator.share({title: "Ghostty Config", text: "Ghostty config share link", url: shareUrl});
        }
        catch {
            // User cancellation should not show an error.
        }
    }
</script>


<DialogModal title="分享配置" {onclose}>
    {#snippet icon()}
        <ShareIcon />
    {/snippet}

    {#if isTooLong}
        <p class="share-modal-desc">配置过大，无法在各应用和浏览器之间可靠地通过 URL 分享。</p>
    {:else}
        <p class="share-modal-desc">请在下方查看并复制分享链接。</p>
        <input
            type="text"
            class="share-link-input"
            value={shareUrl ?? ""}
            readonly
            onclick={(event) => event.currentTarget.select()}
        />
    {/if}
    {#if displayNotice}
        <p class="status-text" role="status">{displayNotice}</p>
    {/if}

    {#snippet footer()}
        <Button onclick={onclose}>关闭</Button>

        {#if isTooLong}
            <Button onclick={ondownload}>下载文件</Button>
        {:else if canUseNativeShare}
            <Button onclick={nativeShareLink}>分享…</Button>
        {/if}

        <Button primary onclick={onClickCopy}>{isTooLong ? "复制配置文本" : "复制链接"}</Button>
    {/snippet}
</DialogModal>


<style>
.share-modal-desc {
    color: var(--font-color-muted);
    font-size: 0.9rem;
    margin: 0;
    line-height: 1.5;
}

.status-text {
    color: var(--font-color-muted);
    font-size: 0.9rem;
    line-height: 1.4;
    margin: 8px 0 0;
}

.share-link-input {
    width: 100%;
    resize: vertical;
    font-family: var(--config-font-family);
    border: 1px solid var(--border-level-3);
    border-radius: var(--radius-level-4);
    background: var(--bg-input);
    color: var(--font-color);
    padding: 8px;
}

.share-link-input:focus-visible {
    outline: 1px solid var(--color-input-accent);
}
</style>
