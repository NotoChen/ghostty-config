// Ghostty's modifier names are platform-neutral (`super`, `alt`), so the same config line means a
// different physical key depending on the host. These helpers name the real keys for the machine
// the editor is running on; they never change what gets written to the config.

export type OS = "macos" | "linux" | "other";

export function getOS(): OS {
    if (typeof navigator === "undefined") return "other";
    const platform = navigator.userAgent?.toLowerCase() ?? "";
    if (platform.includes("linux")) return "linux";
    if (platform.includes("mac")) return "macos";
    return "other";
}

const MAC_SYMBOLS: Record<string, string> = {
    "super": "⌘",
    "ctrl": "⌃",
    "alt": "⌥",
    "shift": "⇧"
};

const MAC_NAMES: Record<string, string> = {
    "super": "Command",
    "ctrl": "Control",
    "alt": "Option",
    "shift": "Shift"
};

/** The physical key a Ghostty modifier name refers to here: `super` → `⌘ Command` on macOS. */
export function modifierLabel(modifier: string, os: OS = getOS()): string {
    if (os === "macos") {
        const symbol = MAC_SYMBOLS[modifier];
        const name = MAC_NAMES[modifier];
        return symbol && name ? `${symbol} ${name}` : modifier;
    }
    // Only `super` differs from its own name outside macOS (the Windows key); ctrl/alt/shift are
    // spelled the way they are on the keycap, so no annotation is needed.
    return modifier === "super" ? "Win" : modifier;
}

/** Short chip for a checkbox row: `⌘ super` on macOS, `Win super` on a PC. */
export function modifierChip(modifier: string, os: OS = getOS()): string {
    const symbol = os === "macos" ? MAC_SYMBOLS[modifier] : undefined;
    if (symbol) return `${symbol} ${modifier}`;
    return modifier === "super" ? "Win super" : modifier;
}

/** Where the default keybind list came from — it is Ghostty's own macOS default set. */
export function defaultKeybindSource(os: OS = getOS()): string {
    return os === "macos"
        ? "macOS"
        : "macOS（当前系统并非 macOS，请按需把 super 等修饰键换成对应按键）";
}
