import {getOS} from "#lib/utils/platform";
import {registry} from "./registry";

type Registry = typeof registry;

type AsyncInitializer = (registry: Registry) => Promise<void>;

const asyncInitializers: AsyncInitializer[] = [
    // Font list... web: skip or no-op; desktop: shell out to `ghostty +list-fonts`
    async (_: Registry) => {
        // The following TODO was written by a clanker.
        // TODO: implement this, ideally by shelling out to `ghostty +list-fonts`
        // and parsing the output, which would ensure the list is accurate and
        // includes any custom fonts the user has installed. This is a bit more
        // complex than the theme enrichment because it involves running a child
        // process and handling its output, but it would provide a much better
        // user experience. For now, we can leave this as a no-op or populate
        // it with a static list of common fonts as a placeholder.
    },
];

export async function runAsyncInitializers() {
    await Promise.allSettled(asyncInitializers.map(fn => fn(registry)));
}


type Initializer = (registry: Registry) => void;

const syncInitializers: Initializer[] = [
    // `copy-on-select` defaults to `primary` on Linux and `none` elsewhere (Ghostty 1.4).
    (reg: Registry) => reg.copyOnSelect.default = getOS() === "linux" ? "primary" : "none",

    (reg: Registry) => reg.quitAfterLastWindowClosed.default = String(getOS() !== "macos"),
];

export function runSyncInitializers() {
    syncInitializers.map(fn => fn(registry));
}


export async function runInitializers() {
    runSyncInitializers();
    if (typeof window !== "undefined") await runAsyncInitializers();
}