import {parse} from "$lib/utils/parse";

// Client half of the local-config bridge (see scripts/vite-plugin-local-config.ts). The endpoint
// only exists under `vite dev` / `vite preview`; when it answers 404 or the fetch fails, the page
// treats the feature as unavailable and offers file upload instead.
//
// A static deployment (GitHub Pages) never has the endpoint, so the same page also accepts a config
// the person hands over themselves — an uploaded file or pasted text. Both fill the same `text`
// field, which is all the comparison view reads; only `source` decides whether write-back exists.

const ENDPOINT = "/__ghostty/local-config";

export type LocalConfigStatus = "idle" | "loading" | "ready" | "unavailable" | "error";

/** Where the compared text came from: the dev-server bridge, an uploaded file, or pasted text. */
export type LocalConfigSource = "bridge" | "file" | "paste";

interface LocalConfigState {
    status: LocalConfigStatus;
    source: LocalConfigSource;
    path: string | null;
    text: string;
    mtimeMs: number | null;
    error: string | null;
    candidates: string[];
    lastChecked: number;
}

export const localConfig = $state<LocalConfigState>({
    status: "idle",
    source: "bridge",
    path: null,
    text: "",
    mtimeMs: null,
    error: null,
    candidates: [],
    lastChecked: 0
});

let inFlight: Promise<boolean> | null = null;

/** True when the local bridge answered — the write-back UI only appears in that case. */
export function hasLocalBridge() {
    return localConfig.status === "ready" && localConfig.source === "bridge";
}

/**
 * Compare a config the person handed over instead of reading it off disk. Used on static deploys,
 * where the bridge cannot exist, and as a manual escape hatch if it does.
 */
export function attachLocalConfig(text: string, name: string, source: Exclude<LocalConfigSource, "bridge">) {
    localConfig.source = source;
    localConfig.status = "ready";
    localConfig.path = name;
    localConfig.text = text;
    localConfig.mtimeMs = null;
    localConfig.error = null;
    localConfig.lastChecked = Date.now();
}

/** Drop an attached file/paste and go back to whatever the bridge offers. */
export function detachLocalConfig() {
    if (localConfig.source === "bridge") return;
    localConfig.source = "bridge";
    localConfig.status = "idle";
    localConfig.path = null;
    localConfig.text = "";
    localConfig.mtimeMs = null;
    void refreshLocalConfig();
}

/** Re-read the on-disk config. Concurrent calls share one request. */
export function refreshLocalConfig(): Promise<boolean> {
    if (inFlight) return inFlight;
    // An attached file is the source of truth once present; polling the bridge must not replace it.
    if (localConfig.source !== "bridge") return Promise.resolve(localConfig.status === "ready");

    localConfig.status = localConfig.status === "ready" ? "ready" : "loading";

    inFlight = (async () => {
        try {
            const response = await fetch(ENDPOINT, {headers: {Accept: "application/json"}});
            if (response.status === 404) {
                const body = await response.json().catch(() => null) as {candidates?: string[]} | null;
                localConfig.status = "unavailable";
                localConfig.path = null;
                localConfig.candidates = Array.isArray(body?.candidates) ? body.candidates : [];
                localConfig.error = null;
                return false;
            }
            if (!response.ok) {
                localConfig.status = "error";
                localConfig.error = `读取失败（HTTP ${response.status}）`;
                return false;
            }
            const body = await response.json() as {available: boolean; path?: string; text?: string; mtimeMs?: number};
            if (!body.available || typeof body.text !== "string") {
                localConfig.status = "unavailable";
                return false;
            }
            localConfig.path = body.path ?? null;
            localConfig.text = body.text;
            localConfig.mtimeMs = body.mtimeMs ?? null;
            localConfig.status = "ready";
            localConfig.error = null;
            localConfig.lastChecked = Date.now();
            return true;
        }
        catch {
            // No dev server bridge (static deploy) or it went away mid-session.
            localConfig.status = localConfig.status === "ready" ? "ready" : "unavailable";
            return false;
        }
        finally {
            inFlight = null;
        }
    })();

    return inFlight;
}

export interface WriteResult {
    ok: boolean;
    dryRun: boolean;
    path?: string;
    backup?: string;
    warning?: string;
    error?: string;
    detail?: string;
}

/**
 * Validate (and optionally apply) a full config file. `dryRun` runs `ghostty +validate-config`
 * on the text without touching disk; the real write always leaves a timestamped `.bak-*` copy.
 */
export async function writeLocalConfig(text: string, dryRun = false): Promise<WriteResult> {
    try {
        const response = await fetch(ENDPOINT, {
            method: "POST",
            headers: {"Content-Type": "application/json", "Accept": "application/json"},
            body: JSON.stringify({text, dryRun})
        });
        const body = await response.json().catch(() => ({})) as {ok?: boolean; path?: string; backup?: string; warning?: string; error?: string; detail?: string};
        if (!response.ok) {
            return {ok: false, dryRun, error: body.error ?? `写入失败（HTTP ${response.status}）`, detail: body.detail};
        }
        return {ok: true, dryRun, path: body.path, backup: body.backup, warning: body.warning};
    }
    catch (err) {
        return {ok: false, dryRun, error: err instanceof Error ? err.message : "写入请求失败"};
    }
}

/** The on-disk file, parsed into the app's flat camelCase store shape. */
export function parsedLocalConfig(): Record<string, string | string[]> {
    return parse(localConfig.text);
}
