import type {Component} from "svelte";

import type {PreviewKey} from "#lib/settings/types";
import AppIconPreview from "#lib/views/AppIconPreview.svelte";
import BaseColorPreview from "#lib/views/BaseColorPreview.svelte";
import CursorPreview from "#lib/views/CursorPreview.svelte";
import PalettePreview from "#lib/views/PalettePreview.svelte";

// Renderer-side map: nav group `preview` key -> the component rendered above that group's
// settings. Kept out of navigation.ts so the nav tree stays pure data (no `.svelte` imports).
// Typed as Record<PreviewKey, ...> so it must stay exhaustive against the key union in types.ts.
export const previews: Record<PreviewKey, Component> = {
    baseColor: BaseColorPreview,
    cursor: CursorPreview,
    palette: PalettePreview,
    appIcon: AppIconPreview
};
