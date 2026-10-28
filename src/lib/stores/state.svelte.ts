interface AppState {
    title: string;
    /**
     * Where the terminal preview lives. `floating` is the default — the config window and the
     * terminal are two separate windows on the desktop, as in Ghostty itself; `docked` splits one
     * window into settings + preview, which some visitors prefer on a single screen.
     */
    previewMode: "docked" | "floating";
    /** Width of the docked pane, in px. Dragged on the split divider; remembered across reloads. */
    previewWidth: number;
    /** Floating only: last window position, so a dragged window comes back where it was left.
        `-1` means "never placed" — the preview then computes a spot next to the config window. */
    previewX: number;
    previewY: number;
    /** Floating only: did the visitor drag the window? A spot *we* computed is not restored — the
        layout that produced it may be gone (a narrower browser window), and re-deriving keeps the
        terminal beside the config window instead of flush against, or on top of, it. */
    previewUserPlaced: boolean;
    /** On screen? A docked pane that is hidden collapses; a floating window is minimized. */
    previewVisible: boolean;
    /** Floating only: the window is animating into the dock icon. */
    previewMinimized: boolean;
    /** Floating only: the dock was clicked while minimized; animate the window back. */
    previewRestoreRequested: boolean;
}

export const MIN_PREVIEW_WIDTH = 280;
export const MAX_PREVIEW_WIDTH = 560;
// Bumped when the default placement changed from docked to floating. A stored `docked` from the
// old default is indistinguishable from a visitor who never touched it, so the new key gives
// everyone the new default once; from here on the choice is theirs and persists.
const STORAGE_KEY = "ghostty-config:preview:v2";

export function clampPreviewWidth(width: number): number {
    if (!Number.isFinite(width)) return MIN_PREVIEW_WIDTH;
    return Math.min(MAX_PREVIEW_WIDTH, Math.max(MIN_PREVIEW_WIDTH, Math.round(width)));
}

// Placement is a per-visitor convenience, so it lives in localStorage rather than in the config:
// someone who prefers the pop-out window keeps it after a reload, and nobody else is affected.
//
// Touching the global is itself fallible: with storage blocked (Safari "Block All Cookies", a
// storage-denied iframe) the `localStorage` getter throws SecurityError, and `typeof` only guards
// ReferenceError. Since this runs at module scope, an escape would stop the app from booting.
function previewStorage(): Storage | null {
    try {
        return typeof localStorage === "undefined" ? null : localStorage;
    }
    catch {
        return null;
    }
}

function loadPreview(): Partial<AppState> {
    try {
        const raw = previewStorage()?.getItem(STORAGE_KEY);
        if (!raw) return {};

        const data = JSON.parse(raw) as Record<string, unknown>;
        const saved: Partial<AppState> = {};
        if (data.mode === "docked" || data.mode === "floating") saved.previewMode = data.mode;
        if (typeof data.width === "number") saved.previewWidth = clampPreviewWidth(data.width);
        if (typeof data.x === "number" && Number.isFinite(data.x)) saved.previewX = data.x;
        if (typeof data.y === "number" && Number.isFinite(data.y)) saved.previewY = data.y;
        if (data.userPlaced === true) saved.previewUserPlaced = true;
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
    previewMode: "floating",
    previewWidth: 380,
    previewX: -1,
    previewY: -1,
    previewUserPlaced: false,
    previewVisible: true,
    previewMinimized: false,
    previewRestoreRequested: false,
    ...loadPreview(),
});

export function savePreview() {
    try {
        previewStorage()?.setItem(STORAGE_KEY, JSON.stringify({
            mode: app.previewMode,
            width: app.previewWidth,
            x: app.previewX,
            y: app.previewY,
            userPlaced: app.previewUserPlaced,
            visible: app.previewVisible,
        }));
    }
    catch {
        // Private mode / quota: the preference simply won't survive a reload.
    }
}

export default app;
