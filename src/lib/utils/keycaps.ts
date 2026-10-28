import type {ParsedTrigger} from "./keybinds";
import {getOS, type OS} from "./platform";

// A keybind is stored and written in Ghostty's own spelling (`super+shift+comma`), but what a
// person needs to see and press is the physical key. These helpers bridge the two: reading a real
// `KeyboardEvent` into a Ghostty step, and rendering a step as keycaps.

// `KeyboardEvent.code` is the physical key position, which is what Ghostty's key names describe.
// It is also what stays usable on macOS where a modifier changes the produced character
// (Option+T gives "†"), so `event.key` would be the wrong thing to read.
const CODE_TO_KEY: Record<string, string> = {
    Backquote: "backquote",
    Backslash: "backslash",
    BracketLeft: "bracket_left",
    BracketRight: "bracket_right",
    Comma: "comma",
    Equal: "equal",
    Minus: "minus",
    Period: "period",
    Quote: "quote",
    Semicolon: "semicolon",
    Slash: "slash",
    IntlBackslash: "intl_backslash",
    IntlRo: "intl_ro",
    IntlYen: "intl_yen",
    AltLeft: "alt_left",
    AltRight: "alt_right",
    ControlLeft: "control_left",
    ControlRight: "control_right",
    ShiftLeft: "shift_left",
    ShiftRight: "shift_right",
    MetaLeft: "meta_left",
    MetaRight: "meta_right",
    Backspace: "backspace",
    CapsLock: "caps_lock",
    ContextMenu: "context_menu",
    Enter: "enter",
    Space: "space",
    Tab: "tab",
    Delete: "delete",
    End: "end",
    Home: "home",
    Insert: "insert",
    PageDown: "page_down",
    PageUp: "page_up",
    ArrowDown: "arrow_down",
    ArrowLeft: "arrow_left",
    ArrowRight: "arrow_right",
    ArrowUp: "arrow_up",
    NumLock: "num_lock",
    NumpadAdd: "numpad_add",
    NumpadBackspace: "numpad_backspace",
    NumpadClear: "numpad_clear",
    NumpadClearEntry: "numpad_clear_entry",
    NumpadComma: "numpad_comma",
    NumpadDecimal: "numpad_decimal",
    NumpadDivide: "numpad_divide",
    NumpadEnter: "numpad_enter",
    NumpadEqual: "numpad_equal",
    NumpadMemoryAdd: "numpad_memory_add",
    NumpadMemoryClear: "numpad_memory_clear",
    NumpadMemoryRecall: "numpad_memory_recall",
    NumpadMemoryStore: "numpad_memory_store",
    NumpadMemorySubtract: "numpad_memory_subtract",
    NumpadMultiply: "numpad_multiply",
    NumpadParenLeft: "numpad_paren_left",
    NumpadParenRight: "numpad_paren_right",
    NumpadSubtract: "numpad_subtract",
    NumpadSeparator: "numpad_separator",
    Escape: "escape",
    PrintScreen: "print_screen",
    ScrollLock: "scroll_lock",
    Pause: "pause",
    Eject: "eject",
    Power: "power",
    Sleep: "sleep",
    WakeUp: "wake_up",
    LaunchMail: "launch_mail",
    LaunchApp1: "launch_app_1",
    LaunchApp2: "launch_app_2",
    MediaPlayPause: "media_play_pause",
    MediaSelect: "media_select",
    MediaStop: "media_stop",
    MediaTrackNext: "media_track_next",
    MediaTrackPrevious: "media_track_previous",
    AudioVolumeUp: "audio_volume_up",
    AudioVolumeDown: "audio_volume_down",
    AudioVolumeMute: "audio_volume_mute",
    BrowserBack: "browser_back",
    BrowserFavorites: "browser_favorites",
    BrowserForward: "browser_forward",
    BrowserHome: "browser_home",
    BrowserRefresh: "browser_refresh",
    BrowserSearch: "browser_search",
    BrowserStop: "browser_stop",
    // Dedicated Copy/Cut/Paste keys (USB HID § 3.7). Some keyboards — Sun-style Unix boards,
    // specialty/multimedia boards — have real keys for these; they are not ⌘C.
    Copy: "copy",
    Cut: "cut",
    Paste: "paste"
};

/** The Ghostty key name for a DOM key code, or null when the key has no Ghostty spelling. */
export function codeToKey(code: string): string | null {
    const named = CODE_TO_KEY[code];
    if (named) return named;

    const letter = /^Key([A-Z])$/.exec(code);
    if (letter) return `key_${letter[1].toLowerCase()}`;

    const digit = /^Digit(\d)$/.exec(code);
    if (digit) return `digit_${digit[1]}`;

    const numpad = /^Numpad(\d)$/.exec(code);
    if (numpad) return `numpad_${numpad[1]}`;

    const fn = /^F(\d{1,2})$/.exec(code);
    if (fn && Number(fn[1]) <= 25) return `f${fn[1]}`;

    return null;
}

/** Display order: Ctrl, Alt, Shift, Super — the order macOS prints them in menus. */
const MODIFIER_ORDER = ["ctrl", "alt", "shift", "super"];

const MODIFIER_CODE = /^(Alt|Control|Shift|Meta)(Left|Right)$/;

/**
 * Read a key down into a Ghostty step, or null when the press is only modifiers so far — the
 * recorder waits for the actual key rather than binding a modifier by itself.
 */
export function stepFromEvent(event: KeyboardEvent): {key: string; modifiers: string[]} | null {
    if (event.isComposing || MODIFIER_CODE.test(event.code)) return null;
    const key = codeToKey(event.code);
    if (!key) return null;
    const modifiers: string[] = [];
    if (event.ctrlKey) modifiers.push("ctrl");
    if (event.altKey) modifiers.push("alt");
    if (event.shiftKey) modifiers.push("shift");
    if (event.metaKey) modifiers.push("super");
    return {key, modifiers};
}

// Codes a person can type as characters. A press of one of these without Ctrl/Alt/Cmd keeps typing
// into a text field instead of being recorded, so plain `a`, `/`, `physical:five` stay typeable.
const TYPABLE_CODE = /^(Key[A-Z]|Digit\d|Numpad\d|Backquote|Backslash|BracketLeft|BracketRight|Comma|Equal|Minus|Period|Quote|Semicolon|Slash|Space|IntlBackslash|IntlRo|IntlYen)$/;

/** Whether a key down in a text field should be recorded as a binding rather than typed. */
export function isRecordingKey(event: KeyboardEvent): boolean {
    return event.ctrlKey || event.altKey || event.metaKey || !TYPABLE_CODE.test(event.code);
}

const KEY_CAPS: Record<string, string> = {
    "escape": "Esc",
    "backspace": "⌫",
    "enter": "↵",
    "tab": "⇥",
    "space": "Space",
    "delete": "Del",
    "insert": "Ins",
    "home": "Home",
    "end": "End",
    "page_up": "PgUp",
    "page_down": "PgDn",
    "arrow_up": "↑",
    "arrow_down": "↓",
    "arrow_left": "←",
    "arrow_right": "→",
    "caps_lock": "Caps",
    "num_lock": "Num",
    "print_screen": "PrtSc",
    "scroll_lock": "ScrLk",
    "pause": "Pause",
    "context_menu": "Menu",
    "fn": "fn",
    "fn_lock": "fn",
    "backquote": "`",
    "backslash": "\\",
    "bracket_left": "[",
    "bracket_right": "]",
    "comma": ",",
    "equal": "=",
    "minus": "-",
    "period": ".",
    "quote": "'",
    "semicolon": ";",
    "slash": "/",
    "intl_backslash": "\\",
    "intl_ro": "_",
    "intl_yen": "¥",
    "launch_mail": "Mail",
    "launch_app_1": "App1",
    "launch_app_2": "App2",
    "media_play_pause": "⏯",
    "media_stop": "⏹",
    "media_track_next": "⏭",
    "media_track_previous": "⏮",
    "audio_volume_up": "Vol+",
    "audio_volume_down": "Vol-",
    "audio_volume_mute": "Mute",
    "copy": "Copy",
    "cut": "Cut",
    "paste": "Paste"
};

// Keys that exist as their own physical key on some keyboards, not as a shortcut. A binding whose
// key is one of these has no modifiers to show, which otherwise reads like a missing key.
const DEDICATED_KEYS = new Set(["copy", "cut", "paste"]);

/** Whether this key is a dedicated hardware key (a real Copy key), rather than a combo. */
export function isDedicatedKey(key: string): boolean {
    return DEDICATED_KEYS.has(key);
}

/** The label printed on the physical key, e.g. `key_t` → `T`, `arrow_up` → `↑`, `f5` → `F5`. */
export function keyCap(key: string): string {
    if (key.startsWith("physical:")) return key.slice("physical:".length);
    const named = KEY_CAPS[key];
    if (named) return named;

    if (/^key_[a-z]$/.test(key)) return key.slice(4).toUpperCase();
    if (/^digit_\d$/.test(key)) return key.slice(6);
    if (/^numpad_\d$/.test(key)) return `Num ${key.slice(7)}`;
    if (/^f\d{1,2}$/.test(key)) return key.toUpperCase();
    if (!key) return "";
    if ([...key].length === 1) return key.toUpperCase();
    return key;
}

const MAC_MODIFIER_CAPS: Record<string, string> = {
    "ctrl": "⌃",
    "alt": "⌥",
    "shift": "⇧",
    "super": "⌘"
};

const PC_MODIFIER_CAPS: Record<string, string> = {
    "ctrl": "Ctrl",
    "alt": "Alt",
    "shift": "Shift",
    "super": "Win"
};

/** The keycap label for a modifier on this platform: `super` → `⌘` on macOS, `Win` elsewhere. */
export function modifierCap(modifier: string, os: OS = getOS()): string {
    const table = os === "macos" ? MAC_MODIFIER_CAPS : PC_MODIFIER_CAPS;
    return table[modifier] ?? modifier;
}

export interface StepCaps {
    /** Modifier keycaps in display order, then the keycap for the key itself. */
    caps: string[];
    /** True for `physical:` keys, which Ghostty matches by hardware code rather than by name. */
    physical: boolean;
    /** True when the key is its own hardware key (a dedicated Copy key), so the row has no combo. */
    dedicated: boolean;
}

export function stepCaps(step: {key: string; modifiers: string[]}, os: OS = getOS()): StepCaps {
    const caps = MODIFIER_ORDER
        .filter((modifier) => step.modifiers.includes(modifier))
        .map((modifier) => modifierCap(modifier, os));
    if (step.key) caps.push(keyCap(step.key));
    return {
        caps,
        physical: step.key.startsWith("physical:"),
        dedicated: isDedicatedKey(step.key)
    };
}

export interface TriggerCaps {
    prefixes: string[];
    steps: StepCaps[];
}

/** A whole trigger as keycaps, one entry per step of a sequence. */
export function triggerCaps(trigger: ParsedTrigger, os: OS = getOS()): TriggerCaps {
    return {
        prefixes: [...trigger.prefixes],
        steps: trigger.steps.map((step) => stepCaps(step, os))
    };
}
