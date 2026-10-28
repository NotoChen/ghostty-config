interface AppState {
    title: string;
    /**
     * Where the terminal preview lives. `docked` is the default split layout — settings on the
     * left, live preview on the right; `floating` is the draggable macOS-style window.
     */
    previewMode: "docked" | "floating";
    /** On screen? A docked pane that is hidden collapses; a floating window is minimized. */
    previewVisible: boolean;
    /** Floating only: the window is animating into the dock icon. */
    previewMinimized: boolean;
    /** Floating only: the dock was clicked while minimized; animate the window back. */
    previewRestoreRequested: boolean;
}

const app: AppState = $state({
    title: "Home",
    previewMode: "docked",
    previewVisible: true,
    previewMinimized: false,
    previewRestoreRequested: false,
});

export default app;
