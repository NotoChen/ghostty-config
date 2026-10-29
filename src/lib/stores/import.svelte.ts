import {parse} from "#lib/utils/parse";
import {diffFromDefaults, load} from "#lib/stores/config.svelte";
import {decodeConfig, getSharePayloadFromHash, removeSharePayloadFromHash} from "#lib/utils/share";
import {error, success} from "#lib/stores/toasts.svelte";
import {alert as showAlert} from "#lib/stores/modals.svelte";

export type ImportSource = "share" | "clipboard" | "file";

export interface PreviewState {
    source: ImportSource;
    text: string;
    parsed: Record<string, string | string[]> | null;
    parsedDiff: Record<string, string | string[]> | null;
    parseError: boolean;
}

const SOURCE_INFO: Record<ImportSource, {title: string; description: string; noConfigMessage: string; successMessage: string;}> = {
    share: {
        title: "共享配置",
        description: "有人与你分享了一份 Ghostty 配置，导入前请先检查。",
        noConfigMessage: "分享链接中没有找到有效的配置项。",
        successMessage: "共享配置已导入"
    },
    clipboard: {
        title: "导入配置",
        description: "导入会覆盖你当前的所有改动，导入前请先检查。",
        noConfigMessage: "你提供的剪贴板内容中没有找到有效的配置项。",
        successMessage: "配置已导入"
    },
    file: {
        title: "导入配置",
        description: "导入会覆盖你当前的所有改动，导入前请先检查。",
        noConfigMessage: "你提供的文件中没有找到有效的配置项。",
        successMessage: "配置已导入"
    }
};

export const incomingImport = $state<{preview: PreviewState | null; show: boolean;}>({preview: null, show: false});

export function getSourceInfo(source: ImportSource) {
    return SOURCE_INFO[source];
}

function clearHash() {
    if (typeof window === "undefined") return;
    const cleaned = removeSharePayloadFromHash(window.location.hash);
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}${cleaned}`);
}

function buildPreview(source: ImportSource, text: string): PreviewState {
    try {
        const parsed = parse(text);
        const parsedDiff = diffFromDefaults(parsed);
        return {source, text, parsed, parsedDiff, parseError: false};
    }
    catch {
        return {source, text, parsed: null, parsedDiff: null, parseError: true};
    }
}

export function checkTextForImport(source: ImportSource, text: string) {
    const preview = buildPreview(source, text);
    const hasKeys = preview.parsedDiff && Object.keys(preview.parsedDiff).length > 0;

    if (!hasKeys && !preview.parseError) {
        void showAlert({title: "未找到配置", message: SOURCE_INFO[source].noConfigMessage, buttonText: "关闭"});
        if (source === "share") clearHash();
        return;
    }

    incomingImport.preview = preview;
    incomingImport.show = true;
}

export function checkHashForShare() {
    if (typeof window === "undefined") return;
    const payload = getSharePayloadFromHash(window.location.hash);
    if (!payload) return;

    try {
        checkTextForImport("share", decodeConfig(payload));
    }
    catch {
        error("无法从 URL 读取共享配置");
        clearHash();
    }
}

export async function applyIncomingImport() {
    if (!incomingImport.preview?.parsed) return;
    const {source, parsed} = incomingImport.preview;

    try {
        load(parsed);
        success(SOURCE_INFO[source].successMessage);
    }
    catch (err) {
        console.error(err); // eslint-disable-line no-console
        await showAlert({
            title: "无法加载配置",
            message: "加载解析后的配置时出错，请在 GitHub 上提交 issue。",
            buttonText: "关闭"
        });
    }

    dismissIncomingImport();
}

export function dismissIncomingImport() {
    incomingImport.show = false;
    incomingImport.preview = null;
    clearHash();
}