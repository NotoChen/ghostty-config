<script lang="ts">
    import {tick, untrack} from "svelte";
    import {fade, fly} from "svelte/transition";
    import InteractiveTerminalDom from "$lib/views/InteractiveTerminalDom.svelte";
    import app, {clampPreviewWidth, MAX_PREVIEW_WIDTH, MIN_PREVIEW_WIDTH, savePreview} from "$lib/stores/state.svelte";
    import config from "$lib/stores/config.svelte";
    import {clearRecentChanges, recentChanges, trackConfig} from "$lib/stores/preview.svelte";

    const DEFAULT_WIDTH = 680;
    const DEFAULT_HEIGHT = 480;
    const MIN_WIDTH = 420;
    const MIN_HEIGHT = 280;

    /**
     * Default floating size. It has to leave the config window room beside it — the two are separate
     * windows now — so on a narrower screen the terminal window starts proportionally smaller
     * instead of covering the settings.
     */
    function defaultFloatingWidth(viewport: number): number {
        return Math.round(Math.max(MIN_WIDTH, Math.min(DEFAULT_WIDTH, viewport * 0.42)));
    }
    const MINIMIZE_DURATION = 280;
    const RESTORE_DURATION = 260;
    // Below this width the docked split has no room left for the settings column, so the preview
    // falls back to the floating window (still the same component instance, same scrollback).
    const DOCK_MIN_VIEWPORT = 900;

    type ResizeDirection = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

    let x = $state(0);
    let y = $state(0);
    let width = $state(defaultFloatingWidth(typeof window === "undefined" ? 1440 : window.innerWidth));
    let height = $state(DEFAULT_HEIGHT);
    let dragging = $state(false);
    let resizing = $state(false);
    let resizingDock = $state(false);
    let animating = $state(false);
    let viewportWidth = $state(typeof window === "undefined" ? 1440 : window.innerWidth);
    let viewportHeight = $state(typeof window === "undefined" ? 900 : window.innerHeight);
    let resizeDirection: ResizeDirection | null = null;
    let dragOffsetX = 0;
    let dragOffsetY = 0;
    let resizeStartX = 0;
    let resizeStartY = 0;
    let dockStartX = 0;
    let dockStartWidth = 0;
    let startWidth = DEFAULT_WIDTH;
    let startHeight = DEFAULT_HEIGHT;
    let startLeft = 0;
    let startTop = 0;
    let windowElement = $state<HTMLDivElement | null>(null);
    /** Has the initial spot been decided? It waits for a tick, so the config window can narrow first. */
    let placed = $state(false);
    /** Has the visitor set the window's size? A window they sized keeps it across viewport changes. */
    let userSized = false;

    const isDocked = $derived(app.previewMode === "docked" && viewportWidth >= DOCK_MIN_VIEWPORT);

    // The widest the docked pane may get at the current window size. Every way of changing the
    // width — dragging, the arrow keys, a width restored from last visit — goes through this, so a
    // narrow window can't end up with the settings column squeezed to nothing.
    function dockWidthLimit(viewport: number): number {
        const parentWidth = windowElement?.parentElement?.getBoundingClientRect().width ?? viewport;
        // ~420px is the sidebar plus a settings column that still fits a label and its control.
        return Math.max(MIN_PREVIEW_WIDTH, Math.min(MAX_PREVIEW_WIDTH, parentWidth - 420));
    }

    function setDockWidth(next: number) {
        app.previewWidth = clampPreviewWidth(Math.min(dockWidthLimit(viewportWidth), next));
    }

    // A width remembered from a wider window (or from storage) is pulled back into that limit.
    // `viewportWidth` is read here on purpose: `isDocked` stays true across a resize, so reading
    // only the derived value would leave this effect dormant while the pane is still too wide.
    $effect(() => {
        if (!isDocked) return;
        const limit = dockWidthLimit(viewportWidth);
        untrack(() => {
            if (app.previewWidth > limit) app.previewWidth = limit;
        });
    });

    // A viewport change moves the floating window with it — the config window re-measures too, so
    // this waits for the layout the same way the initial placement does.
    $effect(() => {
        void viewportWidth;
        void viewportHeight;
        if (isDocked || !placed) return;
        untrack(() => placeAfterLayout());
    });

    // The config window narrows itself while the terminal is a separate window (see the
    // `.preview-floating` rule in +layout.svelte). It has to know how much room to leave, and the
    // floating width is here — publish it as a custom property rather than duplicating the number.
    $effect(() => {
        // Both reads are outside `untrack` — the width is the whole point of this effect, and
        // reading it inside would publish the *first* width only.
        const px = `${width}px`;
        const docked = isDocked;
        untrack(() => {
            const root = document.documentElement;
            if (docked) root.style.removeProperty("--preview-float-width");
            else root.style.setProperty("--preview-float-width", px);
        });
    });

    /**
     * Where a never-placed window starts: immediately right of the config window, top-aligned with
     * it, so the two read as two windows on the desktop rather than one rectangle. The layout gives
     * the config window a narrower column when the preview floats (see +layout.svelte), so measure
     * it rather than guessing. When the viewport is too small for that, cascade with a visible
     * offset — still a separate window, never a perfectly-aligned overlay.
     */
    function defaultPlacement(): {x: number; y: number} {
        const appRect = document.querySelector(".app-window")?.getBoundingClientRect();
        const gap = 24;
        const fallbackTop = appRect ? appRect.top + 56 : Math.max(16, (viewportHeight - height) / 3);

        if (appRect) {
            const right = Math.round(appRect.right + gap);
            if (right + width <= viewportWidth - 8) {
                return {x: right, y: Math.max(8, Math.round(appRect.top + 56))};
            }
            // No room beside it: sit over the config window's lower-right, offset on both axes so it
            // still reads as a window on top rather than a continuation of the one below.
            return {
                x: Math.max(0, Math.min(viewportWidth - width - 24, Math.round(appRect.right - width * 0.35))),
                y: Math.max(0, Math.min(viewportHeight - height - 24, Math.round(fallbackTop + 80))),
            };
        }

        return {x: Math.max(0, Math.round((viewportWidth - width) / 2)), y: Math.max(0, Math.round(fallbackTop))};
    }

    /** Keep a (restored or resized) window fully on screen. */
    function clampToViewport(nextX: number, nextY: number, vw = viewportWidth, vh = viewportHeight): {x: number; y: number} {
        return {
            x: Math.max(0, Math.round(Math.min(nextX, vw - width))),
            y: Math.max(0, Math.round(Math.min(nextY, vh - height))),
        };
    }

    /**
     * Put the window where it belongs for this viewport. A spot the visitor chose is theirs: it is
     * only pulled back on screen. A spot we computed ourselves is re-derived from the config
     * window's current position, because "24px to the right of it" stops being true as soon as the
     * window it was measured against moves.
     */
    function position(vw: number, vh: number) {
        const spot = app.previewUserPlaced ? clampToViewport(x, y, vw, vh) : defaultPlacement();
        if (spot.x === x && spot.y === y) return;
        x = spot.x;
        y = spot.y;
        app.previewX = x;
        app.previewY = y;
    }

    /**
     * Keep the window fitting beside the config window. A window the visitor never sized follows the
     * viewport the way the default size does; otherwise a browser window narrowed from 1600px to
     * 1200px would leave a 672px terminal with nowhere to sit but on top of the settings.
     */
    function placeNextToConfig(vw: number, vh: number) {
        if (!userSized) {
            const fitted = defaultFloatingWidth(vw);
            if (fitted !== width) {
                width = fitted;
                // The config window re-narrows from the new `--preview-float-width`; measure after.
                void tick().then(() => position(vw, vh));
                return;
            }
        }
        position(vw, vh);
    }

    /**
     * Place once the layout has stopped moving. One `tick()` is not enough: the config window is
     * narrowed by `--preview-float-width`, and a measurement that lands before that style is
     * applied reports the old, wider window — which is how the terminal ended up 24px further right
     * than it should be. Two frames is what it takes for the narrowed layout to be measurable.
     *
     * `placed` flips at the end, not the start: it is what lifts the hidden-until-placed class, so
     * flipping earlier would show the window at (0, 0) for the very frames this waits through.
     */
    function placeAfterLayout() {
        void tick().then(() => requestAnimationFrame(() => {
            if (isDocked) return;
            placeNextToConfig(viewportWidth, viewportHeight);
            placed = true;
        }));
    }

    // The initial spot is decided once, after the first layout. At mount the config window still
    // owns the full width, so measuring then would put the terminal on top of it.
    $effect(() => {
        if (isDocked || placed) return;
        untrack(() => {
            // Only a spot the visitor chose is restored. A spot we computed ourselves is
            // re-derived, because it was relative to a layout that may not exist any more.
            if (app.previewUserPlaced && app.previewX >= 0 && app.previewY >= 0) {
                x = app.previewX;
                y = app.previewY;
            }
            placeAfterLayout();
        });
    });

    // Record what the editor changed so the chips in the preview can name the difference.
    $effect(() => {
        trackConfig(config);
    });

    // Placement is a per-visitor convenience, so remember it across reloads. savePreview() reads
    // mode/width/visible, so the effect re-runs whenever any of them changes.
    $effect(() => {
        savePreview();
    });

    // Every new change flashes the pane border once. Keyed on the newest chip's id — writing a
    // counter from an effect that reads the list is the same update-depth trap as above.
    const flashKey = $derived(recentChanges.at(-1)?.id ?? 0);

    function startDrag(e: MouseEvent) {
        if (isDocked || resizing || animating || !app.previewVisible) return;
        dragging = true;
        dragOffsetX = e.clientX - x;
        dragOffsetY = e.clientY - y;
    }

    function startResize(e: MouseEvent, direction: ResizeDirection) {
        if (isDocked || animating || !app.previewVisible) return;
        e.preventDefault();
        e.stopPropagation();
        resizing = true;
        resizeDirection = direction;
        resizeStartX = e.clientX;
        resizeStartY = e.clientY;
        startWidth = width;
        startHeight = height;
        startLeft = x;
        startTop = y;
    }

    /**
     * Drag the split divider. The pane width is the only thing that changes, so the settings
     * column gets whatever is left — the split stays a real two-pane layout rather than an overlay.
     */
    function startDockResize(e: MouseEvent) {
        if (!isDocked) return;
        e.preventDefault();
        e.stopPropagation();
        resizingDock = true;
        dockStartX = e.clientX;
        dockStartWidth = app.previewWidth;
    }

    $effect(() => {
        if (!dragging && !resizing && !resizingDock) return;

        function onMove(e: MouseEvent) {
            if (resizingDock) {
                setDockWidth(dockStartWidth - (e.clientX - dockStartX));
                return;
            }

            if (dragging) {
                x = Math.max(0, Math.min(window.innerWidth - width, e.clientX - dragOffsetX));
                y = Math.max(0, Math.min(window.innerHeight - height, e.clientY - dragOffsetY));
                return;
            }

            if (!resizing || !resizeDirection) return;

            const dx = e.clientX - resizeStartX;
            const dy = e.clientY - resizeStartY;

            let nextX = startLeft;
            let nextY = startTop;
            let nextWidth = startWidth;
            let nextHeight = startHeight;

            if (resizeDirection.includes("e")) {
                nextWidth = startWidth + dx;
            }

            if (resizeDirection.includes("s")) {
                nextHeight = startHeight + dy;
            }

            if (resizeDirection.includes("w")) {
                nextWidth = startWidth - dx;
                nextX = startLeft + dx;
            }

            if (resizeDirection.includes("n")) {
                nextHeight = startHeight - dy;
                nextY = startTop + dy;
            }

            if (resizeDirection.includes("w") && nextWidth < MIN_WIDTH) {
                nextX = startLeft + (startWidth - MIN_WIDTH);
                nextWidth = MIN_WIDTH;
            }
            else {
                nextWidth = Math.max(MIN_WIDTH, nextWidth);
            }

            if (resizeDirection.includes("n") && nextHeight < MIN_HEIGHT) {
                nextY = startTop + (startHeight - MIN_HEIGHT);
                nextHeight = MIN_HEIGHT;
            }
            else {
                nextHeight = Math.max(MIN_HEIGHT, nextHeight);
            }

            if (nextX < 0) {
                if (resizeDirection.includes("w")) {
                    nextWidth += nextX;
                }
                nextX = 0;
            }

            if (nextY < 0) {
                if (resizeDirection.includes("n")) {
                    nextHeight += nextY;
                }
                nextY = 0;
            }

            nextWidth = Math.max(MIN_WIDTH, Math.min(nextWidth, window.innerWidth - nextX));
            nextHeight = Math.max(MIN_HEIGHT, Math.min(nextHeight, window.innerHeight - nextY));

            x = nextX;
            y = nextY;
            width = nextWidth;
            height = nextHeight;
        }

        function onUp() {
            // Remember where the window was left, so it comes back there next visit. Writing the
            // store fields here (rather than in the move handler) keeps one save per gesture.
            if (!isDocked) {
                if (resizing) userSized = true;
                app.previewUserPlaced = true;
                app.previewX = x;
                app.previewY = y;
            }
            dragging = false;
            resizing = false;
            resizeDirection = null;
            resizingDock = false;
        }

        window.addEventListener("mousemove", onMove);
        window.addEventListener("mouseup", onUp);
        return () => {
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("mouseup", onUp);
        };
    });

    function clearAnimationStyles() {
        windowElement?.style.removeProperty("transform");
        windowElement?.style.removeProperty("opacity");
    }

    function shouldReduceMotion() {
        return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }

    function getDockButtonRect() {
        const dockButton = document.getElementById("ghostty-terminal-dock-button");
        return dockButton?.getBoundingClientRect() ?? null;
    }

    async function animateDockTransition(mode: "minimize" | "restore") {
        if (!windowElement) return false;

        const dockRect = getDockButtonRect();
        if (!dockRect) return false;

        const sourceRect = windowElement.getBoundingClientRect();
        const deltaX = (dockRect.left + dockRect.width / 2) - (sourceRect.left + sourceRect.width / 2);
        const deltaY = (dockRect.top + dockRect.height / 2) - (sourceRect.top + sourceRect.height / 2);
        const scaleX = sourceRect.width > 0 ? Math.max(0.12, dockRect.width / sourceRect.width) : 0.12;
        const scaleY = sourceRect.height > 0 ? Math.max(0.12, dockRect.height / sourceRect.height) : 0.12;

        const keyframes = mode === "minimize"
            ? [
                {transform: "translate3d(0px, 0px, 0px) scale(1, 1)", opacity: 1},
                {transform: `translate3d(${deltaX}px, ${deltaY}px, 0px) scale(${scaleX}, ${scaleY})`, opacity: 0.18},
            ]
            : [
                {transform: `translate3d(${deltaX}px, ${deltaY}px, 0px) scale(${scaleX}, ${scaleY})`, opacity: 0.18},
                {transform: "translate3d(0px, 0px, 0px) scale(1, 1)", opacity: 1},
            ];

        const animation = windowElement.animate(keyframes, {
            duration: mode === "minimize" ? MINIMIZE_DURATION : RESTORE_DURATION,
            easing: mode === "minimize"
                ? "cubic-bezier(0.18, 0.9, 0.22, 1)"
                : "cubic-bezier(0.2, 0.8, 0.2, 1)",
            fill: "both",
        });

        try {
            await animation.finished;
            return true;
        }
        catch {
            return false;
        }
        finally {
            animation.cancel();
            clearAnimationStyles();
        }
    }

    /** Swap between the docked split pane and the floating window, keeping the same terminal. */
    async function setMode(mode: "docked" | "floating") {
        if (app.previewMode === mode) {
            app.previewVisible = true;
            return;
        }

        const element = windowElement;
        const before = element?.getBoundingClientRect();

        app.previewMode = mode;
        app.previewVisible = true;
        app.previewMinimized = false;
        app.previewRestoreRequested = false;
        await tick();

        if (!element || !before || shouldReduceMotion()) return;

        const after = element.getBoundingClientRect();
        if (after.width === 0 || after.height === 0) return;

        const deltaX = before.left - after.left;
        const deltaY = before.top - after.top;
        const scaleX = before.width / after.width;
        const scaleY = before.height / after.height;

        const animation = element.animate([
            {transformOrigin: "top left", transform: `translate(${deltaX}px, ${deltaY}px) scale(${scaleX}, ${scaleY})`},
            {transformOrigin: "top left", transform: "translate(0px, 0px) scale(1, 1)"},
        ], {duration: 280, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)"});

        try {
            await animation.finished;
        }
        catch {
            // Interrupted by a new transition; nothing to restore.
        }
        finally {
            animation.cancel();
        }
    }

    async function minimize() {
        if (!app.previewVisible || app.previewMinimized || animating) return;

        dragging = false;
        resizing = false;
        resizeDirection = null;
        app.previewRestoreRequested = false;

        if (shouldReduceMotion()) {
            app.previewVisible = false;
            app.previewMinimized = true;
            app.previewRestoreRequested = false;
            clearRecentChanges();
            return;
        }

        animating = true;
        await animateDockTransition("minimize");
        animating = false;

        app.previewVisible = false;
        app.previewMinimized = true;
        clearRecentChanges();
    }

    /** The dock / close / traffic-light action for whichever placement is current. */
    function hidePreview() {
        if (isDocked) {
            app.previewVisible = false;
            clearRecentChanges();
            return;
        }
        void minimize();
    }

    $effect(() => {
        if (!app.previewRestoreRequested || app.previewMinimized) return;

        app.previewRestoreRequested = false;
        if (shouldReduceMotion()) return;

        let canceled = false;
        void (async () => {
            animating = true;
            await animateDockTransition("restore");
            if (!canceled) {
                animating = false;
            }
        })();

        return () => {
            canceled = true;
            animating = false;
            clearAnimationStyles();
        };
    });

    let title = $state("交互式预览");
    function onCwdChange(cwd: string) {
        title = cwd;
    }
</script>

<svelte:window
    onresize={() => {
        viewportWidth = window.innerWidth;
        viewportHeight = window.innerHeight;
    }}
/>

<div
    bind:this={windowElement}
    class="ghostty-window"
    class:docked={isDocked}
    class:floating={!isDocked}
    class:minimized={!isDocked && !app.previewVisible && !animating}
    class:placing={!isDocked && !placed}
    class:docked-hidden={isDocked && !app.previewVisible}
    style:left={isDocked ? undefined : `${x}px`}
    style:top={isDocked ? undefined : `${y}px`}
    style:width={isDocked ? `${app.previewWidth}px` : `${width}px`}
    style:height={isDocked ? undefined : `${height}px`}
    style:cursor={dragging ? "grabbing" : undefined}
    role="dialog"
    aria-label="交互式终端预览"
    aria-hidden={!app.previewVisible && !animating}
    aria-modal="false"
>
    {#if isDocked}
        <button
            type="button"
            class="dock-divider"
            class:active={resizingDock}
            onmousedown={startDockResize}
            aria-label={`拖动调整预览宽度（当前 ${app.previewWidth}px）`}
            title="拖动调整预览宽度"
            onkeydown={(e) => {
                if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
                e.preventDefault();
                setDockWidth(app.previewWidth + (e.key === "ArrowLeft" ? 24 : -24));
            }}
        ></button>
        <div class="titlebar docked-titlebar">
            <span class="live-dot" aria-hidden="true"></span>
            <span class="window-title">实时预览</span>
            <div class="preview-actions">
                <button type="button" class="action-button" onclick={() => setMode("floating")} title="弹出为窗口" aria-label="弹出为窗口">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4h6v6" /><path d="M20 4 11 13" /><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" /></svg>
                </button>
                <button type="button" class="action-button" onclick={hidePreview} title="隐藏预览" aria-label="隐藏预览">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                </button>
            </div>
        </div>
    {:else}
        <div class="titlebar" role="presentation" onmousedown={startDrag}>
            <div class="traffic-lights">
                <button type="button" class="dot dot-red" onclick={hidePreview} aria-label="关闭预览窗口" title="关闭">
                    <span class="dot-symbol">&times;</span>
                </button>
                <button type="button" class="dot dot-yellow" onclick={hidePreview} aria-label="最小化" title="最小化">
                    <span class="dot-symbol">&ndash;</span>
                </button>
                <button type="button" class="dot dot-green" onclick={() => setMode("docked")} aria-label="停靠到右侧" title="停靠到右侧">
                    <span class="dot-symbol">&plus;</span>
                </button>
            </div>
            <span class="window-title">{title}</span>
            <div class="titlebar-end"></div>
        </div>
    {/if}

    <div class="terminal-body">
        <!-- Each comparison hard-codes what ""/unset means for that setting: the
             selection-clear-* keys have concrete boolean defaults, while copy-on-select and
             cursor-style-blink are *enabled* when unset — so boolCodec ("" -> false) can't
             be used uniformly here. copy-on-select is a four-way enum whose default is `none`;
             only the modes that reach the system clipboard are observable here (`primary` is the
             X11 selection clipboard, which a page cannot write). -->
        <InteractiveTerminalDom
            {onCwdChange}
            selectionClearOnCopy={config.selectionClearOnCopy === "true"}
            selectionClearOnTyping={config.selectionClearOnTyping === "true"}
            copyOnSelect={["clipboard", "both", "true"].includes(config.copyOnSelect)}
            cursorBlink={config.cursorStyleBlink !== "false"}
            cursorStyle={config.cursorStyle as "block" | "underline" | "bar" | "block_hollow"}
        />

        {#if recentChanges.length > 0}
            <div class="change-overlay" aria-live="polite" aria-atomic="false">
                {#each recentChanges as change (change.id)}
                    <div
                        class="change-chip"
                        in:fly={{y: -6, duration: 180}}
                        out:fade={{duration: 160}}
                    >
                        <span class="change-name">{change.name}</span>
                        <span class="change-values">
                            <span class="change-from">{change.from}</span>
                            <span class="change-arrow" aria-hidden="true">→</span>
                            <span class="change-to">{change.to}</span>
                        </span>
                    </div>
                {/each}
            </div>
        {/if}
    </div>

    {#if !isDocked}
        <div class="resize-handle resize-n" onmousedown={(e) => startResize(e, "n")} aria-hidden="true"></div>
        <div class="resize-handle resize-s" onmousedown={(e) => startResize(e, "s")} aria-hidden="true"></div>
        <div class="resize-handle resize-e" onmousedown={(e) => startResize(e, "e")} aria-hidden="true"></div>
        <div class="resize-handle resize-w" onmousedown={(e) => startResize(e, "w")} aria-hidden="true"></div>
        <div class="resize-handle resize-ne" onmousedown={(e) => startResize(e, "ne")} aria-hidden="true"></div>
        <div class="resize-handle resize-nw" onmousedown={(e) => startResize(e, "nw")} aria-hidden="true"></div>
        <div class="resize-handle resize-se" onmousedown={(e) => startResize(e, "se")} aria-hidden="true"></div>
        <div class="resize-handle resize-sw" onmousedown={(e) => startResize(e, "sw")} aria-hidden="true"></div>
    {/if}

    {#if flashKey > 0}
        {#key flashKey}
            <div class="flash-ring" aria-hidden="true"></div>
        {/key}
    {/if}
</div>

<style>
.ghostty-window {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    /* Transparent so `background-opacity` can show the wallpaper behind the pane; the tint and the
       background image are painted by .terminal-body. */
    background: transparent;
    position: relative;
}

/* --- docked: the default right-hand split pane --- */
.ghostty-window.docked {
    /* Width comes from app.previewWidth (the inline style), so the divider drag has one source
       of truth; `0 0 auto` keeps the pane from being stretched by the flex row. */
    flex: 0 0 auto;
    height: 100%;
    z-index: 1;
}

.dock-divider {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    width: 7px;
    cursor: col-resize;
    z-index: 7;
    background: none;
    border: none;
    padding: 0;
    touch-action: none;
}

.dock-divider::after {
    content: "";
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    width: 2px;
    background: var(--border-level-1);
    transition: background-color 140ms ease;
}

.dock-divider:hover::after,
.dock-divider:focus-visible::after,
.dock-divider.active::after {
    background: var(--color-input-accent);
}

.dock-divider:focus-visible {
    outline: none;
}

.ghostty-window.docked-hidden {
    display: none;
}

.docked-titlebar {
    height: 53px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 0 10px 0 16px;
    background: rgba(44, 39, 51, 0.9);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--border-separator);
    color: var(--font-color);
    user-select: none;
    position: relative;
    z-index: 1;
}

.docked-titlebar .window-title {
    flex: 1;
    text-align: left;
    font-size: 1.05rem;
    font-weight: 600;
    pointer-events: none;
}

.live-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--color-success);
    box-shadow: 0 0 6px var(--color-success);
    flex-shrink: 0;
}

.preview-actions {
    display: flex;
    gap: 2px;
    flex-shrink: 0;
}

.action-button {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    width: 26px;
    height: 26px;
    padding: 0;
    background: none;
    border: none;
    border-radius: var(--radius-level-5);
    color: var(--font-color-muted);
    cursor: pointer;
}

.action-button:hover {
    background: rgba(255, 255, 255, 0.1);
    color: var(--font-color);
}

.action-button:active {
    background: rgba(255, 255, 255, 0.2);
}

.action-button svg {
    width: 15px;
    height: 15px;
}

/* --- floating: the draggable macOS-style window --- */
.ghostty-window.floating {
    position: fixed;
    z-index: 1000;
    border-radius: 12px;
    border: 1px solid var(--border-level-1);
    box-shadow: 0 0 20px -1px rgba(0, 0, 0, 0.7);
    pointer-events: all;
    transform-origin: center center;
}

.ghostty-window.floating.minimized {
    opacity: 0;
    pointer-events: none;
}

/* The first spot is measured two frames after mount (see placeAfterLayout), so without this the
   window would paint once in the top-left corner before jumping to where it belongs. Hidden for
   that one frame only — no transition, since it is never a state anyone should see. */
.ghostty-window.floating.placing {
    opacity: 0;
    pointer-events: none;
}

.ghostty-window.floating::before {
    content: "";
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    box-shadow: 0 0 1px white inset;
    border-radius: inherit;
    z-index: 2;
    pointer-events: none;
}

.floating .titlebar {
    height: 38px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    padding: 0 12px;
    /* The window itself is transparent so `background-opacity` reaches the wallpaper, so the
       titlebar lays down the same tint as .terminal-body and the two read as one surface. */
    background: color-mix(in srgb, var(--config-bg) calc(var(--config-bg-opacity) * 100%), transparent);
    backdrop-filter: blur(var(--config-blur));
    border-bottom: 1px solid transparent;
    cursor: grab;
    user-select: none;
    transition: border-color 250ms cubic-bezier(0, 0.3, 0.7, 1);
    position: relative;
    z-index: 1;
}

.floating .titlebar:active {
    cursor: grabbing;
    border-bottom: 1px solid var(--border-level-1);
}

.traffic-lights {
    display: flex;
    gap: 8px;
    flex-shrink: 0;
}

.dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: none;
    cursor: pointer;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    padding: 0;
}

.dot-red {background: #FF5F57;}
.dot-yellow {background: #FEBC2E;}
.dot-green {background: #28C840;}

.dot-symbol {
    line-height: 1;
    color: rgba(0, 0, 0, 0);
    font-weight: 400;
    margin-top: -3px;
}

.traffic-lights:hover .dot-symbol {
    color: rgba(0, 0, 0, 0.6);
}

.window-title {
    flex: 1;
    text-align: center;
    font-weight: 700;
    pointer-events: none;
}

.titlebar-end {
    width: 52px;
    flex-shrink: 0;
}

/* --- shared body + change feedback --- */
.terminal-body {
    flex: 1;
    overflow: hidden;
    min-height: 0;
    position: relative;
    z-index: 1;
    /* Ghostty's window background: the config color at its configured opacity over the wallpaper,
       blurred by `background-blur`. */
    background: color-mix(in srgb, var(--config-bg) calc(var(--config-bg-opacity) * 100%), transparent);
    backdrop-filter: blur(var(--config-blur));
}

/* `background-image` is drawn above that tint (Ghostty blends it over the base color) but below
   the cells, and it stays put while the terminal scrolls. */
.terminal-body::before {
    content: "";
    position: absolute;
    inset: 0;
    background-image: var(--config-bg-image);
    background-position: var(--config-bg-image-position);
    background-size: var(--config-bg-image-fit);
    background-repeat: var(--config-bg-image-repeat);
    opacity: var(--config-bg-image-opacity);
    pointer-events: none;
    z-index: 0;
}

.change-overlay {
    position: absolute;
    /* Bottom edge: the top lines are where the welcome text and the prompt live, and covering
       those is exactly what makes a live preview unreadable while you tweak a setting. */
    bottom: 10px;
    right: 10px;
    left: 10px;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 6px;
    pointer-events: none;
    z-index: 5;
}

.change-chip {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 2px 8px;
    max-width: min(100%, 340px);
    padding: 6px 10px;
    border-radius: 999px;
    background: color-mix(in srgb, var(--config-bg) 82%, black);
    border: 1px solid color-mix(in srgb, var(--config-fg) 22%, transparent);
    color: var(--config-fg);
    font-family: var(--font-family);
    font-size: 11px;
    line-height: 1.2;
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.35);
    backdrop-filter: blur(6px);
}

.change-name {
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
}

.change-values {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-family: var(--font-family-mono);
    white-space: nowrap;
    opacity: 0.85;
    min-width: 0;
}

.change-from {
    text-decoration: line-through;
    opacity: 0.6;
    overflow: hidden;
    text-overflow: ellipsis;
}

.change-to {
    font-weight: 700;
    overflow: hidden;
    text-overflow: ellipsis;
}

.change-arrow {
    opacity: 0.5;
}

.flash-ring {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 6;
    border-radius: inherit;
    box-shadow: inset 0 0 0 2px var(--color-input-accent);
    animation: flash-ring 650ms ease-out forwards;
}

@keyframes flash-ring {
    from {
        opacity: 0.95;
        box-shadow: inset 0 0 0 2px var(--color-input-accent), inset 0 0 28px -6px var(--color-input-accent);
    }
    to {
        opacity: 0;
        box-shadow: inset 0 0 0 2px transparent, inset 0 0 0 0 transparent;
    }
}

@media (prefers-reduced-motion: reduce) {
    .flash-ring {
        animation: none;
    }

    .live-dot {
        box-shadow: none;
    }
}

/* --- floating resize handles --- */
.resize-handle {
    position: absolute;
    z-index: 3;
}

.resize-n,
.resize-s {
    left: 10px;
    right: 10px;
    height: 8px;
}

.resize-n {
    top: -4px;
    cursor: ns-resize;
}

.resize-s {
    bottom: -4px;
    cursor: ns-resize;
}

.resize-e,
.resize-w {
    top: 10px;
    bottom: 10px;
    width: 8px;
}

.resize-e {
    right: -4px;
    cursor: ew-resize;
}

.resize-w {
    left: -4px;
    cursor: ew-resize;
}

.resize-ne,
.resize-nw,
.resize-se,
.resize-sw {
    width: 12px;
    height: 12px;
}

.resize-ne {
    top: -4px;
    right: -4px;
    cursor: nesw-resize;
}

.resize-nw {
    top: -4px;
    left: -4px;
    cursor: nwse-resize;
}

.resize-se {
    right: -4px;
    bottom: -4px;
    cursor: nwse-resize;
}

.resize-sw {
    left: -4px;
    bottom: -4px;
    cursor: nesw-resize;
}
</style>
