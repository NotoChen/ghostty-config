const KEY_NAMES = [
    "unidentified",
    "backquote",
    "backslash",
    "bracket_left",
    "bracket_right",
    "comma",
    "digit_0",
    "digit_1",
    "digit_2",
    "digit_3",
    "digit_4",
    "digit_5",
    "digit_6",
    "digit_7",
    "digit_8",
    "digit_9",
    "equal",
    "intl_backslash",
    "intl_ro",
    "intl_yen",
    "key_a",
    "key_b",
    "key_c",
    "key_d",
    "key_e",
    "key_f",
    "key_g",
    "key_h",
    "key_i",
    "key_j",
    "key_k",
    "key_l",
    "key_m",
    "key_n",
    "key_o",
    "key_p",
    "key_q",
    "key_r",
    "key_s",
    "key_t",
    "key_u",
    "key_v",
    "key_w",
    "key_x",
    "key_y",
    "key_z",
    "minus",
    "period",
    "quote",
    "semicolon",
    "slash",
    "alt_left",
    "alt_right",
    "backspace",
    "caps_lock",
    "context_menu",
    "control_left",
    "control_right",
    "enter",
    "meta_left",
    "meta_right",
    "shift_left",
    "shift_right",
    "space",
    "tab",
    "convert",
    "kana_mode",
    "non_convert",
    "delete",
    "end",
    "help",
    "home",
    "insert",
    "page_down",
    "page_up",
    "arrow_down",
    "arrow_left",
    "arrow_right",
    "arrow_up",
    "num_lock",
    "numpad_0",
    "numpad_1",
    "numpad_2",
    "numpad_3",
    "numpad_4",
    "numpad_5",
    "numpad_6",
    "numpad_7",
    "numpad_8",
    "numpad_9",
    "numpad_add",
    "numpad_backspace",
    "numpad_clear",
    "numpad_clear_entry",
    "numpad_comma",
    "numpad_decimal",
    "numpad_divide",
    "numpad_enter",
    "numpad_equal",
    "numpad_memory_add",
    "numpad_memory_clear",
    "numpad_memory_recall",
    "numpad_memory_store",
    "numpad_memory_subtract",
    "numpad_multiply",
    "numpad_paren_left",
    "numpad_paren_right",
    "numpad_subtract",
    "numpad_separator",
    "numpad_up",
    "numpad_down",
    "numpad_right",
    "numpad_left",
    "numpad_begin",
    "numpad_home",
    "numpad_end",
    "numpad_insert",
    "numpad_delete",
    "numpad_page_up",
    "numpad_page_down",
    "escape",
    "f1",
    "f2",
    "f3",
    "f4",
    "f5",
    "f6",
    "f7",
    "f8",
    "f9",
    "f10",
    "f11",
    "f12",
    "f13",
    "f14",
    "f15",
    "f16",
    "f17",
    "f18",
    "f19",
    "f20",
    "f21",
    "f22",
    "f23",
    "f24",
    "f25",
    "fn",
    "fn_lock",
    "print_screen",
    "scroll_lock",
    "pause",
    "browser_back",
    "browser_favorites",
    "browser_forward",
    "browser_home",
    "browser_refresh",
    "browser_search",
    "browser_stop",
    "eject",
    "launch_app_1",
    "launch_app_2",
    "launch_mail",
    "media_play_pause",
    "media_select",
    "media_stop",
    "media_track_next",
    "media_track_previous",
    "power",
    "sleep",
    "audio_volume_down",
    "audio_volume_mute",
    "audio_volume_up",
    "wake_up",
    "copy",
    "cut",
    "paste"
] as const;

export type KeyName = (typeof KEY_NAMES)[number];

const MODIFIER_ALIASES: Record<string, string> = {
    control: "ctrl",
    cmd: "super",
    command: "super",
    opt: "alt",
    option: "alt"
};

const VALID_MODIFIERS = ["shift", "ctrl", "alt", "super"];
const VALID_PREFIXES = ["all", "global", "unconsumed", "performable"];
const directionOptions = ["right", "down", "left", "up", "auto"];
const resizeDirectionOptions = ["up", "down", "left", "right"];
const inspectOptions = ["toggle", "show", "hide"];
const writeOptions = [
    "copy",
    "paste",
    "open",
    "copy,plain",
    "copy,vt",
    "copy,html",
    "paste,plain",
    "paste,vt",
    "paste,html",
    "open,plain",
    "open,vt",
    "open,html"
];
const gotoSplitOptions = [...directionOptions, "previous", "next"];
const adjustSelectionOptions = [
    "left",
    "right",
    "up",
    "down",
    "page_up",
    "page_down",
    "home",
    "end",
    "beginning_of_line",
    "end_of_line"
];

type ActionArgType =
    | "none"
    | "number"
    | "integer"
    | "unsignedInteger"
    | "free"
    | "enum"
    | "direction"
    | "resize"
    | "text";

export interface ActionDefinition {
    name: string;
    description?: string;
    type: ActionArgType;
    options?: string[];
    allowEmpty?: boolean;
    min?: number;
}

const ACTION_DEFINITIONS: ActionDefinition[] = [
    {name: "ignore", description: "忽略此按键，不转发给终端。", type: "none"},
    {name: "unbind", description: "移除此前定义的 Ghostty 或用户快捷键。", type: "none"},
    {name: "csi", description: "发送不带 ESC[ 前缀的 CSI 序列。", type: "free"},
    {name: "esc", description: "发送原始 ESC 序列。", type: "free"},
    {name: "text", description: "以 Zig 字符串字面量语法发送文本。", type: "text"},
    {name: "cursor_key", description: "按普通或应用模式发送光标键数据。", type: "none"},
    {name: "reset", description: "重置终端状态。", type: "none"},
    {
        name: "copy_to_clipboard",
        description: "将选中内容以 plain、vt、html 或 mixed 形式复制到剪贴板。",
        type: "enum",
        options: ["plain", "vt", "html", "mixed"],
        allowEmpty: true
    },
    {name: "paste_from_clipboard", description: "从默认剪贴板粘贴。", type: "none"},
    {name: "paste_from_selection", description: "从选区剪贴板粘贴。", type: "none"},
    {name: "copy_url_to_clipboard", description: "复制光标下的 URL 到剪贴板。", type: "none"},
    {name: "copy_title_to_clipboard", description: "复制终端标题到剪贴板。", type: "none"},
    {name: "increase_font_size", description: "按指定点数增大字号。", type: "number"},
    {name: "decrease_font_size", description: "按指定点数减小字号。", type: "number"},
    {name: "reset_font_size", description: "将字号恢复为配置的默认值。", type: "none"},
    {name: "set_font_size", description: "将字号设为指定点数。", type: "number"},
    {name: "search", description: "开始或替换搜索词；传空文本可清除搜索条件。", type: "free"},
    {name: "search_selection", description: "用当前选中文本搜索。", type: "none"},
    {name: "navigate_search", description: "跳到上一个或下一个匹配项。", type: "enum", options: ["previous", "next"]},
    {name: "start_search", description: "打开搜索界面但不设置搜索词。", type: "none"},
    {name: "end_search", description: "结束当前搜索并隐藏搜索界面。", type: "none"},
    {name: "clear_screen", description: "清屏并清空回滚缓冲。", type: "none"},
    {name: "select_all", description: "选中终端全部文本。", type: "none"},
    {name: "scroll_to_top", description: "视口滚动到顶部。", type: "none"},
    {name: "scroll_to_bottom", description: "视口滚动到底部。", type: "none"},
    {name: "scroll_to_selection", description: "视口滚动到当前选区。", type: "none"},
    {name: "scroll_to_row", description: "滚动到从 0 开始计数的绝对行号。", type: "unsignedInteger"},
    {name: "scroll_page_up", description: "向上翻一页。", type: "none"},
    {name: "scroll_page_down", description: "向下翻一页。", type: "none"},
    {name: "scroll_page_fractional", description: "按页面比例滚动。", type: "number"},
    {name: "scroll_page_lines", description: "按行数滚动。", type: "integer"},
    {name: "adjust_selection", description: "向指定方向调整当前选区。", type: "enum", options: adjustSelectionOptions},
    {name: "jump_to_prompt", description: "按提示符计数跳转视口（需要 Shell 集成）。", type: "integer"},
    {name: "write_scrollback_file", description: "将完整回滚缓冲写入临时文件，并复制、粘贴或打开其路径。", type: "enum", options: writeOptions},
    {name: "write_screen_file", description: "将当前屏幕写入临时文件，并复制、粘贴或打开其路径。", type: "enum", options: writeOptions},
    {name: "write_selection_file", description: "将选中内容写入临时文件，并复制、粘贴或打开其路径。", type: "enum", options: writeOptions},
    {name: "new_window", description: "新建窗口。", type: "none"},
    {name: "new_tab", description: "新建标签页。", type: "none"},
    {name: "previous_tab", description: "切换到上一个标签页。", type: "none"},
    {name: "next_tab", description: "切换到下一个标签页。", type: "none"},
    {name: "last_tab", description: "切换到上一个使用的标签页。", type: "none"},
    {name: "goto_tab", description: "按从 1 开始的序号切换标签页。", type: "unsignedInteger", min: 1},
    {name: "move_tab", description: "按相对偏移移动当前标签页。", type: "integer"},
    {name: "toggle_tab_overview", description: "打开或关闭标签页总览。", type: "none"},
    {name: "prompt_surface_title", description: "为当前聚焦的终端界面设置标题。", type: "none"},
    {name: "prompt_tab_title", description: "为当前标签页设置标题。", type: "none"},
    {name: "new_split", description: "在指定方向或自动位置新建分屏。", type: "enum", options: directionOptions, allowEmpty: true},
    {name: "goto_split", description: "按方向或前后顺序切换分屏。", type: "enum", options: gotoSplitOptions},
    {name: "goto_window", description: "切换到上一个或下一个窗口。", type: "enum", options: ["previous", "next"]},
    {name: "toggle_split_zoom", description: "放大或还原当前分屏。", type: "none"},
    {name: "toggle_readonly", description: "切换聚焦终端界面的只读模式。", type: "none"},
    {name: "resize_split", description: "按方向和像素偏移调整分屏大小。", type: "resize"},
    {name: "equalize_splits", description: "将窗口内所有分屏调整为等大。", type: "none"},
    {name: "reset_window_size", description: "将窗口恢复为默认尺寸。", type: "none"},
    {name: "inspector", description: "切换、显示或隐藏终端检查器。", type: "enum", options: inspectOptions},
    {name: "show_gtk_inspector", description: "打开 GTK 检查器。", type: "none"},
    {name: "show_on_screen_keyboard", description: "显示屏幕键盘（若可用）。", type: "none"},
    {name: "open_config", description: "用默认编辑器打开 Ghostty 配置。", type: "enum", options: ["os_open", "new_window"], allowEmpty: true},
    {name: "reload_config", description: "重新加载配置并应用可在运行时生效的改动。", type: "none"},
    {name: "close_surface", description: "关闭聚焦的终端界面（窗口、标签页、分屏等）。", type: "none"},
    {name: "close_tab", description: "关闭当前、其他或右侧的标签页。", type: "enum", options: ["this", "other", "right"], allowEmpty: true},
    {name: "close_window", description: "关闭当前窗口。", type: "none"},
    {name: "close_all_windows", description: "关闭所有窗口（已废弃，建议用 all:close_window）。", type: "none"},
    {name: "toggle_maximize", description: "切换窗口最大化状态。", type: "none"},
    {name: "toggle_fullscreen", description: "切换全屏状态。", type: "none"},
    {name: "toggle_window_decorations", description: "切换窗口装饰（标题栏与按钮）。", type: "none"},
    {name: "toggle_window_float_on_top", description: "切换窗口置顶模式。", type: "none"},
    {name: "toggle_secure_input", description: "切换安全输入模式，用于输入敏感内容。", type: "none"},
    {name: "toggle_mouse_reporting", description: "切换是否向终端程序上报鼠标事件。", type: "none"},
    {name: "toggle_command_palette", description: "打开或关闭命令面板。", type: "none"},
    {name: "toggle_quick_terminal", description: "打开或关闭快速下拉终端。", type: "none"},
    {name: "toggle_visibility", description: "显示或隐藏所有 Ghostty 窗口。", type: "none"},
    {name: "toggle_background_opacity", description: "在透明与不透明窗口背景间切换。", type: "none"},
    {name: "check_for_updates", description: "检查 Ghostty 更新。", type: "none"},
    {name: "undo", description: "撤销上一步可撤销的 Ghostty 操作。", type: "none"},
    {name: "redo", description: "重做上一步撤销的操作。", type: "none"},
    {name: "end_key_sequence", description: "结束当前按键序列并冲刷先前的按键。", type: "none"},
    {name: "activate_key_table", description: "激活具名按键表，直到被停用。", type: "free"},
    {name: "activate_key_table_once", description: "激活具名按键表，仅对一次成功的快捷键使用生效。", type: "free"},
    {name: "deactivate_key_table", description: "停用当前激活的按键表。", type: "none"},
    {name: "deactivate_all_key_tables", description: "停用所有激活的按键表。", type: "none"},
    {name: "quit", description: "退出 Ghostty。", type: "none"},
    {name: "crash", description: "强制让指定线程崩溃（用于测试）。", type: "enum", options: ["main", "io", "render"]}
];

const ACTION_LOOKUP = Object.fromEntries(ACTION_DEFINITIONS.map((action) => [action.name, action]));

export type ParsedTriggerStep = {
    key: string;
    modifiers: string[];
};

export type ParsedTrigger = {
    prefixes: string[];
    steps: ParsedTriggerStep[];
};

export type ParsedKeybind = {
    trigger?: ParsedTrigger;
    action?: string;
    args?: string;
    error?: string[];
};

const KEY_SET = new Set<string>(KEY_NAMES as readonly string[]);

function normalizeModifier(mod: string) {
    const normalized = mod.toLowerCase().trim();
    if (MODIFIER_ALIASES[normalized]) return MODIFIER_ALIASES[normalized];
    return normalized;
}

function parsePrefixes(trigger: string) {
    const prefixes: string[] = [];
    let cursor = trigger;
    let found = true;
    while (found) {
        found = false;
        for (const prefix of VALID_PREFIXES) {
            if (cursor.startsWith(`${prefix}:`)) {
                prefixes.push(prefix);
                cursor = cursor.slice(prefix.length + 1);
                found = true;
                break;
            }
        }
    }
    return {prefixes, remainder: cursor};
}

function parseStep(rawStep: string): ParsedTriggerStep | null {
    const step = rawStep.trim();
    if (!step) return null;

    let key: string;
    let modifierPart = "";

    if (step === "+") {
        key = "+";
    }
    else if (step.endsWith("++")) {
        key = "+";
        modifierPart = step.slice(0, -2);
    }
    else {
        const lastPlusIndex = step.lastIndexOf("+");
        if (lastPlusIndex === -1) {
            key = step;
        }
        else {
            key = step.slice(lastPlusIndex + 1);
            modifierPart = step.slice(0, lastPlusIndex);
            if (!key) return null;
        }
    }

    const normalizedKey = normalizeKeyName(key);
    const modifiers = modifierPart
        .split("+")
        .map((token) => token.trim())
        .filter(Boolean)
        .map(normalizeModifier)
        .filter((value) => value.length > 0);
    return {key: normalizedKey, modifiers};
}

function normalizeKeyName(key: string) {
    const compact = key.replace(/\s+/g, "");
    if (!compact) return "";
    const lowered = compact.toLowerCase();

    if (KEY_SET.has(lowered) || lowered.startsWith("physical:") || [...lowered].length === 1) {
        return lowered;
    }

    const snake = compact
        .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
        .replace(/([a-zA-Z])([0-9])/g, "$1_$2")
        .replace(/([0-9])([a-zA-Z])/g, "$1_$2")
        .toLowerCase();

    if (KEY_SET.has(snake) || snake.startsWith("physical:")) return snake;
    return lowered;
}

export function parseTrigger(triggerString: string): ParsedTrigger | null {
    if (!triggerString) return null;
    const steps: ParsedTriggerStep[] = [];
    const normalized = triggerString.replace(/\s+/g, "");
    const {prefixes, remainder} = parsePrefixes(normalized);
    const tokens = remainder
        .split(">")
        .map((segment) => segment.trim());
    if (!tokens.length) return null;
    if (tokens.some((segment) => !segment.length)) return null;
    for (const token of tokens) {
        const step = parseStep(token);
        if (!step) return null;
        steps.push(step);
    }
    return {prefixes, steps};
}

function normalizeKey(key: string) {
    return key.replace(/\s+/g, "").toLowerCase();
}

function isValidKey(key: string) {
    if (KEY_SET.has(key)) return true;
    if (key.startsWith("physical:")) return true;
    return [...key].length === 1;
}

function validateAction(action: string, args: string | undefined) {
    const definition = ACTION_LOOKUP[action];
    if (!definition) return [`unknown action '${action}'`];
    if (definition.type === "none" && args) {
        return [`'${action}' does not take arguments`];
    }
    if (definition.type === "free") {
        if (args === undefined) {
            if (definition.allowEmpty) return [];
            return [`'${action}' requires arguments`];
        }
        return [];
    }
    if (definition.type === "text") {
        if (args === undefined) return [`'${action}' requires text argument (Zig string literal)`];
        return [];
    }
    if (definition.type === "number") {
        if (args === undefined || args.trim() === "") return [`'${action}' requires a numeric argument`];
        if (!Number.isNaN(Number(args))) return [];
        return [`'${action}' expects a number, got '${args}'`];
    }
    if (definition.type === "integer") {
        if (args === undefined || args.trim() === "") return [`'${action}' requires an integer argument`];
        if (!Number.isNaN(Number(args)) && Number(args) % 1 === 0) return [];
        return [`'${action}' expects an integer, got '${args}'`];
    }
    if (definition.type === "unsignedInteger") {
        if (args === undefined || args.trim() === "") return [`'${action}' requires a non-negative integer argument`];
        const min = definition.min ?? 0;
        const value = Number(args);
        if (!Number.isNaN(value) && value % 1 === 0 && value >= min) return [];
        return [min === 0 ? `'${action}' expects a non-negative integer, got '${args}'` : `'${action}' expects an integer >= ${min}, got '${args}'`];
    }
    if (definition.type === "enum") {
        if (args === undefined) {
            if (definition.allowEmpty) return [];
            return [`'${action}' requires one of [${definition.options?.join(", ")}].`];
        }
        if (!definition.options?.includes(args)) {
            return [`'${action}' 的值无效：'${args}'`];
        }
        return [];
    }
    if (definition.type === "resize") {
        if (args === undefined) return [`'${action}' expects 'direction,offset'`];
        const parts = args.split(",").map((segment) => segment.trim());
        if (parts.length !== 2) return [`'${action}' expects 'direction,offset'`];
        const [dir, amount] = parts;
        if (!resizeDirectionOptions.includes(dir)) {
            return [`'${action}' direction must be ${resizeDirectionOptions.join(", ")}`];
        }
        const offset = Number(amount);
        if (amount.trim() === "" || Number.isNaN(offset) || offset % 1 !== 0 || offset < 0) {
            return [`'${action}' requires a non-negative integer offset`];
        }
        return [];
    }
    return [];
}

// Ghostty's parser skips an `=` that is followed by `+` or `=` when looking for the
// trigger/action separator, so triggers whose key is `=` or `+` (`super+==…`, `super++=…`)
// keep their key instead of losing it to a naive first-`=` split.
function findSeparator(value: string): number {
    let offset = 0;
    while (offset < value.length) {
        const idx = value.indexOf("=", offset);
        if (idx === -1) return -1;
        const next = value[idx + 1];
        if (idx < value.length - 1 && (next === "+" || next === "=")) {
            offset = idx + 1;
            continue;
        }
        return idx;
    }
    return -1;
}

/**
 * Split a keybind into its trigger and action halves on the real separator — not the first `=`,
 * which belongs to the trigger when the key itself is `=` (`super+==increase_font_size:1`).
 */
export function splitKeybind(value: string): [trigger: string, action: string] {
    const sep = findSeparator(value);
    if (sep === -1) return [value, ""];
    return [value.slice(0, sep), value.slice(sep + 1)];
}

export function parseKeybind(value: string): ParsedKeybind {
    const sep = findSeparator(value);
    if (sep === -1) return {error: ["触发键与操作之间缺少 '='"]};
    const trigger = value.slice(0, sep).trim();
    const actionPart = value.slice(sep + 1).trim();
    if (!trigger || !actionPart) return {error: ["缺少触发键或操作"]};
    const parsedTrigger = parseTrigger(trigger);
    if (!parsedTrigger) return {error: ["触发键格式无效"]};
    const argIndex = actionPart.indexOf(":");
    const action = argIndex === -1 ? actionPart : actionPart.slice(0, argIndex);
    const args = argIndex === -1 ? undefined : actionPart.slice(argIndex + 1);
    const errors: string[] = [];
    if (!action) errors.push("缺少操作");
    const prefixSet = new Set(parsedTrigger.prefixes);
    if (parsedTrigger.steps.length > 1 && (prefixSet.has("global") || prefixSet.has("all"))) {
        errors.push("global/all 快捷键不能是按键序列");
    }
    const actionErrors = action ? validateAction(action, args) : ["缺少操作"];
    errors.push(...actionErrors);
    for (const step of parsedTrigger.steps) {
        if (!isValidKey(step.key)) {
            errors.push(`无效按键 '${step.key}'`);
            break;
        }
        for (const mod of step.modifiers) {
            if (!VALID_MODIFIERS.includes(mod)) {
                errors.push(`无效修饰键 '${mod}'`);
                break;
            }
        }
        if (step.modifiers.length > 4) {
            errors.push("修饰键过多");
            break;
        }
    }
    return {trigger: parsedTrigger, action, args, error: errors.filter(Boolean)};
}

export function canonicalTrigger(parsed: ParsedTrigger) {
    const steps = parsed.steps.map((step) => {
        const sortedModifiers = [...step.modifiers].sort();
        const key = step.key;
        return `${sortedModifiers.join("+")}${sortedModifiers.length ? "+" : ""}${key}`;
    });
    return steps.join(">");
}

export function getDiagnostics(keybinds: string[]) {
    const entries = keybinds.map(parseKeybind);
    const counts: Record<string, number> = {};
    entries.forEach((entry) => {
        if (entry.trigger) {
            const canon = canonicalTrigger(entry.trigger);
            counts[canon] = (counts[canon] || 0) + 1;
        }
    });
    return entries.map((entry) => {
        const status = entry.error && entry.error.length ? "invalid" : "ok";
        if (entry.trigger) {
            const canon = canonicalTrigger(entry.trigger);
            const duplicate = counts[canon] > 1;
            return {status, duplicate, errors: entry.error ?? [], canonical: canon};
        }
        return {status, duplicate: false, errors: entry.error ?? [], canonical: ""};
    });
}

/**
 * The Chinese explanation of a binding's action, for display under its row. The action name
 * itself has to stay the raw config spelling (`new_tab`), so this is what tells the reader what
 * the row actually does. Unknown actions — a newer Ghostty, a `chain=` continuation — give ""
 * so the row simply has no caption instead of an empty one.
 */
export function describeAction(value: string): string {
    const actionName = splitKeybind(value)[1].split(":")[0].trim();
    return ACTION_LOOKUP[actionName]?.description ?? "";
}

export function formatTrigger(trigger: ParsedTrigger) {
    const prefixes = Array.from(new Set(trigger.prefixes));
    const prefixPart = prefixes.map((prefix) => `${prefix}:`).join("");
    const stepStrings = trigger.steps.map((step) => {
        const normalizedKey = normalizeKey(step.key);
        const sortedModifiers = [...step.modifiers].sort();
        const modifierPart = sortedModifiers.length ? `${sortedModifiers.join("+")}+` : "";
        return `${modifierPart}${normalizedKey}`;
    });
    return `${prefixPart}${stepStrings.join(">")}`;
}

export {KEY_NAMES, ACTION_DEFINITIONS, VALID_MODIFIERS, VALID_PREFIXES, directionOptions, resizeDirectionOptions};
