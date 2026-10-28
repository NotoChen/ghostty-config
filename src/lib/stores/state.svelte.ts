interface AppState {
    title: string;
    /**
     * Where the terminal preview lives. `docked` is the default split layout — settings on the
     * left, live preview on the right; `floating` is the draggable macOS-style window.
     */
    previewMode: "docked" | "floating";
    /** Width of the docked pane, in px. Dragged on the split divider; remembered across reloads. */
    previewWidth: number;
    /** On screen? A docked pane that is hidden collapses; a floating window is minimized. */
    previewVisible: boolean;
    /** Floating only: the window is animating into the dock icon. */
    previewMinimized: boolean;
    /** Floating only: the dock was clicked while minimized; animate the window back. */
    previewRestoreRequested: boolean;
}

export const MIN_PREVIEW_WIDTH = 280;
export const MAX_PREVIEW_WIDTH = 560;
const STORAGE_KEY = "ghostty-config:preview";

export function clampPreviewWidth(width: number): number {
    if (!Number.isFinite(width)) return MIN_PREVIEW_WIDTH;
    return Math.min(MAX_PREVIEW_WIDTH, Math.max(MIN_PREVIEW_WIDTH, Math.round(width)));
}

// Placement is a per-visitor convenience, so it lives in localStorage rather than in the config:
// someone who prefers the pop-out window keeps it after a reload, and nobody else is affected.
function loadPreview(): Partial<AppState> {
    if (typeof localStorage === "undefined") return {};

    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return {};

        const data = JSON.parse(raw) as Record<string, unknown>;
        const saved: Partial<AppState> = {};
        if (data.mode === "docked" || data.mode === "floating") saved.previewMode = data.mode;
        if (typeof data.width === "number") saved.previewWidth = clampPreviewWidth(data.width);
        if (typeof data.visible === "boolean") saved.previewVisible = data.visible;
        return saved;
    }
    catch {
        // Unreadable/blocked storage just means the defaults apply.
        return {};
    }
}

const app: AppState = $state({
    title: "Home",
    previewMode: "docked",
    previewWidth: 380,
    previewVisible: true,
    previewMinimized: false,
    previewRestoreRequested: false,
    ...loadPreview(),
});

export function savePreview() {
    if (typeof localStorage === "undefined") return;

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            mode: app.previewMode,
            width: app.previewWidth,
            visible: app.previewVisible,
        }));
    }
    catch {
        // Private mode / quota: the preference simply won't survive a reload.
    }
}

export default app;
