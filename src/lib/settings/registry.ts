import {macosIconFrameOptions, macosIconOptions, themeOptions} from "./options";
import type {SettingInfo, SettingsRegistry} from "./types";
import {dev} from "$app/environment";


/* eslint quote-props: ["error", "consistent-as-needed", {"keywords": false}] */

export const registry = {
    abnormalCommandExitRuntime: {
        default: "250",
        description: "以毫秒为单位的运行时长下限，低于该值时进程退出将被视为异常。用于在进程退出过快时显示错误消息。",
        key: "abnormal-command-exit-runtime",
        name: "异常退出运行时长",
        widget: {type: "number", min: 0, size: 5}

    },
    adjustBoxThickness: {
        default: "",
        description: "框线绘制字符的粗细像素值或百分比调整。",
        key: "adjust-box-thickness",
        name: "框线粗细",
        widget: {type: "number-units"}

    },
    adjustCellHeight: {
        default: "",
        description: "调整由字体决定的单元格高度。字体将在单元格内垂直居中。取值可为整数或百分比。",
        key: "adjust-cell-height",
        name: "单元格高度",
        widget: {type: "number-units"}

    },
    adjustCellWidth: {
        default: "",
        description: "调整由字体决定的单元格宽度。取值可为整数（1、-1）或百分比（20%、-15%）。表示在原值基础上改变的幅度，而非绝对值。",
        key: "adjust-cell-width",
        name: "单元格宽度",
        widget: {type: "number-units"}

    },
    adjustCursorHeight: {
        default: "",
        description: "光标的像素高度或百分比调整。目前适用于所有光标类型：bar、rect 和 outlined rect。",
        key: "adjust-cursor-height",
        name: "光标高度",
        widget: {type: "number-units"}

    },
    adjustCursorThickness: {
        default: "",
        description: "条形光标和空心矩形光标的粗细像素值或百分比调整。",
        key: "adjust-cursor-thickness",
        name: "光标粗细",
        widget: {type: "number-units"}

    },
    adjustFontBaseline: {
        default: "",
        description: "从单元格底部到文本基线的距离，以像素或百分比调整。增大使基线上移，减小使基线下移。",
        key: "adjust-font-baseline",
        name: "字体基线",
        widget: {type: "number-units"}

    },
    adjustIconHeight: {
        default: "",
        description: "Nerd 字体图标最大高度的像素值或百分比调整。Powerline 符号不受影响。",
        key: "adjust-icon-height",
        name: "Nerd 字体图标高度",
        since: "1.2.0",
        widget: {type: "number-units"}

    },
    adjustOverlinePosition: {
        default: "",
        description: "从单元格顶部到上划线顶部的距离，以像素或百分比调整。增大使上划线下移，减小使上划线上移。",
        key: "adjust-overline-position",
        name: "上划线位置",
        widget: {type: "number-units"}

    },
    adjustOverlineThickness: {
        default: "",
        description: "上划线的粗细像素值或百分比调整。",
        key: "adjust-overline-thickness",
        name: "上划线粗细",
        widget: {type: "number-units"}

    },
    adjustStrikethroughPosition: {
        default: "",
        description: "从单元格顶部到删除线顶部的距离，以像素或百分比调整。增大使删除线下移，减小使删除线上移。",
        key: "adjust-strikethrough-position",
        name: "删除线位置",
        widget: {type: "number-units"}

    },
    adjustStrikethroughThickness: {
        default: "",
        description: "删除线的粗细像素值或百分比调整。",
        key: "adjust-strikethrough-thickness",
        name: "删除线粗细",
        widget: {type: "number-units"}

    },
    adjustUnderlinePosition: {
        default: "",
        description: "从单元格顶部到下划线顶部的距离，以像素或百分比调整。增大使下划线下移，减小使下划线上移。",
        key: "adjust-underline-position",
        name: "下划线位置",
        widget: {type: "number-units"}

    },
    adjustUnderlineThickness: {
        default: "",
        description: "下划线的粗细像素值。",
        key: "adjust-underline-thickness",
        name: "下划线粗细",
        widget: {type: "number-units"}

    },
    alphaBlending: {
        default: "native",
        description: "执行 Alpha 混合时使用的色彩空间。默认值因平台而异：macOS 上为 `native`，其他所有平台为 `linear-corrected`。\n\n取值：\n- `native` - 在操作系统原生的色彩空间中执行 Alpha 混合（macOS 上为 Display P3，Linux 上为 sRGB）。\n- `linear` - 在线性空间中执行 Alpha 混合。\n- `linear-corrected` - 与 `linear` 相同，但对文本应用了一步校正，使其看起来与 `native` 几乎或完全一致，同时不产生任何变暗瑕疵。",
        key: "alpha-blending",
        name: "Alpha 混合色彩空间",
        since: "1.1.0",
        widget: {type: "dropdown", options: ["native", "linear", "linear-corrected"]}

    },
    appNotifications: {
        default: "",
        description: "控制 Ghostty 显示的应用内通知（GTK 上为浮层提示）。\n\n通知：\n- `clipboard-copy` - 文本复制到剪贴板时显示（默认值：开启）\n- `config-reload` - 配置重新加载时显示（默认值：开启）\n\n加上 `no-` 前缀可禁用。使用 `true`/`false` 可启用/禁用全部。仅限 GTK。",
        key: "app-notifications",
        name: "应用通知",
        note: "逗号分隔的通知列表，用于启用/禁用。可用项：clipboard-copy、config-reload。加上 <code>no-</code> 前缀可禁用。<code>true</code>/<code>false</code> 用于启用/禁用全部。",
        platform: ["gtk"],
        since: "1.1.0",
        widget: {type: "feature-list", features: [{id: "clipboard-copy", label: "复制到剪贴板", default: true}, {id: "config-reload", label: "配置重载", default: true}]}

    },
    asyncBackend: {
        default: "auto",
        description: "配置用于异步 IO、事件处理等的底层 API。\n\n- `auto` - 自动选择最佳后端（默认值）\n- `epoll` - 使用 epoll API\n- `io_uring` - 使用 io_uring API\n\n仅在 Linux 上支持。需要完全重启应用才能生效。",
        key: "async-backend",
        name: "异步后端",
        note: "如果不确定，请保持为 auto。",
        platform: ["linux"],
        since: "1.2.0",
        widget: {type: "dropdown", options: ["auto", "epoll", "io_uring"]}

    },
    autoUpdate: {
        default: "",
        description: "控制自动更新功能。仅在 macOS 上支持。\n\n- `off` - 禁用自动更新\n- `check` - 检查更新并通知，但不下载\n- `download` - 自动下载更新，但不安装\n\n若未设置，则沿用 Sparkle 的默认行为。",
        key: "auto-update",
        name: "自动更新",
        note: "不设置此项将回退到你的 Sparkle 偏好设置。",
        platform: ["macos"],
        widget: {type: "dropdown", options: ["off", "check", "download"], allowEmpty: true, emptyLabel: "跟随 Sparkle 通道", placeholder: "跟随 Sparkle 通道"}

    },
    autoUpdateChannel: {
        default: "",
        description: "用于自动更新的发布通道。默认与当前运行的 Ghostty 版本的发布通道一致。\n\n- `stable` - 稳定的标记发布版本\n- `tip` - 来自 main 分支的预发布版本\n\n需要完全重启才能生效。仅限 macOS。",
        key: "auto-update-channel",
        name: "更新通道",
        note: "默认情况下，将跟随你下载时所使用的版本通道。",
        platform: ["macos"],
        widget: {type: "dropdown", options: ["stable", "tip"], allowEmpty: true, emptyLabel: "当前 Sparkle 通道", placeholder: "当前通道"}

    },
    background: {
        default: "#282c34",
        description: "窗口的背景色。以十六进制（`#RRGGBB` 或 `RRGGBB`）或 X11 命名颜色指定。",
        key: "background",
        name: "背景色",
        widget: {type: "color"}

    },
    backgroundBlur: {
        default: "false",
        description: "当 `background-opacity` 小于 1 时是否模糊背景。\n\n取值：\n- 非负整数，指定模糊强度\n- `false`（等同于强度 0）\n- `true`（等同于默认强度 20）\n- `macos-glass-regular` - 标准玻璃效果（macOS 26.0+）\n- `macos-glass-clear` - 高透明玻璃效果（macOS 26.0+）\n\n在 macOS 和部分 Linux 桌面环境（KDE Plasma）上支持。在 KDE Plasma 上，具体的模糊强度会被忽略——任何真值都会启用模糊。",
        key: "background-blur",
        name: "背景模糊",
        note: "设为 <code>true</code> 启用模糊，<code>false</code> 禁用，数字表示具体半径（macOS），或使用 <code>macos-glass-regular</code>/<code>macos-glass-clear</code> 启用 macOS 玻璃效果。",
        widget: {type: "custom-number", presets: [{value: "false", label: "关"}, {value: "true", label: "开"}, {value: "macos-glass-regular", label: "标准玻璃"}, {value: "macos-glass-clear", label: "透明玻璃"}], min: 0, integer: true}

    },
    backgroundImage: {
        default: "",
        description: "终端的背景图片。应为 PNG 或 JPEG 文件的路径。\n\n背景图片按终端而非按窗口设置。每个终端的背景图片都会在 VRAM 中复制一份。\n\n警告：对于大尺寸图片，这可能导致显著的 VRAM 占用。",
        key: "background-image",
        name: "背景图片",
        note: "用作终端背景的图片文件路径。",
        since: "1.2.0"

    },
    backgroundImageFit: {
        default: "contain",
        description: "背景图片适应方式。\n\n- `contain` - 在保持宽高比的前提下，缩放到能完整放入终端的最大尺寸。\n- `cover` - 在保持宽高比的前提下，缩放到能完全覆盖终端的最小尺寸（可能裁剪边缘）。\n- `stretch` - 拉伸至终端完整尺寸，不保持宽高比。\n- `none` - 不缩放背景图片。",
        key: "background-image-fit",
        name: "背景图片适应方式",
        since: "1.2.0",
        widget: {type: "dropdown", options: ["contain", "cover", "stretch", "none"]}

    },
    backgroundImageOpacity: {
        default: "1",
        description: "背景图片的不透明度，相对于 `background-opacity`。取值 1.0 表示将图片置于背景色之上。大于 1.0 的取值会使图片比一般背景更不透明。",
        key: "background-image-opacity",
        name: "背景图片不透明度",
        since: "1.2.0",
        widget: {type: "range", min: 0, max: 1, step: 0.01}

    },
    backgroundImagePosition: {
        default: "center",
        description: "背景图片的位置。",
        key: "background-image-position",
        name: "背景图片位置",
        since: "1.2.0",
        widget: {type: "dropdown", options: ["center", "top-left", "top-center", "top-right", "center-left", "center-center", "center-right", "bottom-left", "bottom-center", "bottom-right"]}

    },
    backgroundImageRepeat: {
        default: "false",
        description: "当背景图片未能完全填满终端区域时，是否重复显示该背景图片。",
        key: "background-image-repeat",
        name: "重复背景图片",
        since: "1.2.0",
        widget: {type: "switch"}

    },
    backgroundOpacity: {
        default: "1",
        description: "背景的不透明度级别。取值 1 为完全不透明，0 为完全透明。在 macOS 上，进入原生全屏时背景不透明度会被禁用。在 macOS 上，更改此项需要完全重启 Ghostty。",
        key: "background-opacity",
        name: "背景不透明度",
        widget: {type: "range", min: 0, max: 1, step: 0.01}

    },
    backgroundOpacityCells: {
        default: "false",
        description: "将背景不透明度应用于设置了显式背景色的单元格。通常，`background-opacity` 仅应用于窗口背景。将此设为 true 后，无论单元格是否设置了显式背景色，都会对其应用。",
        key: "background-opacity-cells",
        name: "强制单元格背景不透明度",
        since: "1.2.0",
        widget: {type: "switch"}

    },
    bellAudioPath: {
        default: "",
        description: "如果 `audio` 是已启用的响铃功能，此项为音频文件的路径。支持 `~/` 前缀。相对路径相对于配置文件所在目录；若作为 CLI 参数使用，则相对于当前工作目录。仅限 GTK。",
        key: "bell-audio-path",
        name: "响铃音频文件",
        note: "响铃时播放的音频文件路径。需要在响铃功能中启用 <code>audio</code>。仅限 GTK。",
        platform: ["gtk"],
        since: "1.2.0"

    },
    bellAudioVolume: {
        default: "0.5",
        description: "如果 `audio` 是已启用的响铃功能，此项为播放音频文件的音量（相对于系统音量）。范围从 0.0（静音）到 1.0（最大音量）。仅限 GTK。",
        key: "bell-audio-volume",
        name: "响铃音量",
        note: "响铃音频的音量，从 0（静音）到 1（最大）。仅限 GTK。",
        platform: ["gtk"],
        since: "1.2.0",
        widget: {type: "range", min: 0, max: 1, step: 0.05, showLabels: false}

    },
    bellFeatures: {
        default: "",
        description: "要启用的响铃功能。逗号分隔的列表。加上 `no-` 前缀可禁用。\n\n功能：\n- `system` - 使用内置系统功能（在 macOS 上播放系统提示音）\n- `audio` - 播放自定义声音（仅限 GTK）\n- `attention` - 在失去焦点时请求用户注意（默认值：开启）\n- `title` - 在标题前添加铃铛表情（🔔），直到重新获得焦点（默认值：开启）\n- `border` - 在提醒的终端界面周围显示边框，直到重新获得焦点（GTK 自 1.2.0 起，macOS 自 1.2.1 起）",
        key: "bell-features",
        name: "响铃功能",
        note: "逗号分隔的功能列表。可用项：system、audio、attention、title、border。加上 <code>no-</code> 前缀可禁用。",
        since: "1.2.0",
        widget: {type: "feature-list", features: [{id: "system", label: "跟随系统", default: false}, {id: "audio", label: "音频", default: false}, {id: "attention", label: "注意", default: true}, {id: "title", label: "标题", default: true}, {id: "border", label: "边框", default: false}]}

    },
    boldColor: {
        default: "",
        description: "修改终端中粗体文本使用的颜色。\n\n- 设为具体颜色（`#RRGGBB`）- 默认粗体文本始终使用该颜色。其余粗体颜色设为 `bright`。\n- 设为 `bright` - 粗体文本使用亮色调色板（替代已弃用的 `bold-is-bright`）。\n- 未设置（默认值）- 粗体文本使用正常前景色。\n\n注意：原有的 `bold-is-bright` 配置已弃用，由 `bold-color = bright` 替代。",
        key: "bold-color",
        name: "粗体文本颜色",
        note: "设为 <code>bright</code> 可使用亮色调色板颜色显示粗体文本，或使用十六进制颜色值。留空则使用默认值。",
        since: "1.2.0",
        widget: {type: "custom-color", presets: [{value: "bright", label: "亮色"}]}

    },
    class: {
        default: "",
        description: "控制 WM_CLASS 的类字段（X11）、Wayland 应用 ID 以及 DBus 总线名称。默认为 `com.mitchellh.ghostty`。更改此项会创建独立的单实例 Ghostty 实例。",
        key: "class",
        name: "WM_CLASS 类字段",
        note: "此项默认为 <code>com.mitchellh.ghostty</code>",
        platform: ["gtk"]

    },
    clickRepeatInterval: {
        default: "0",
        description: "相邻点击之间被视为重复点击（双击、三击等）的毫秒数。取值为零时使用平台特定的默认值（macOS：系统设置，其他：500ms）。",
        key: "click-repeat-interval",
        name: "多次点击间隔",
        note: "取值为 0 表示使用操作系统的默认时序。",
        widget: {type: "number", min: 0, size: 4}

    },
    clipboardCodepointMap: {
        default: [],
        description: "在将文本复制到剪贴板时，将特定 Unicode 码点映射为替换值。\n\n这有助于将特殊的终端符号转换为更兼容的字符，以便粘贴到其他应用中。\n\n语法与 `font-codepoint-map` 类似：\n- 单码点：`U+1234=U+ABCD` 或 `U+1234=replacement_text`\n- 码点范围：`U+1234-U+5678=U+ABCD`\n\n此配置可重复多次。对于重叠的范围，后面的条目优先。\n\n注意：这仅适用于文本复制，不适用于 URL 复制。",
        key: "clipboard-codepoint-map",
        name: "剪贴板码点映射",
        note: "格式：<code>U+1234=U+ABCD</code> 或 <code>U+2500=U+002D</code>。",
        repeatable: true,
        widget: {type: "repeatable-text", placeholder: "U+2500=U+002D"}

    },
    clipboardPasteBracketedSafe: {
        default: "true",
        description: "若为 true，则括起粘贴将被视为安全。括起粘贴是指在运行中的程序启用了括起粘贴模式时进行的粘贴。",
        key: "clipboard-paste-bracketed-safe",
        name: "括起粘贴视为安全",
        widget: {type: "switch"}

    },
    clipboardPasteProtection: {
        default: "true",
        description: "粘贴看似不安全的文本前要求确认。有助于防止“复制/粘贴攻击”，即用户可能因粘贴带有换行符的文本而意外执行不安全命令。",
        key: "clipboard-paste-protection",
        name: "不安全粘贴需确认",
        widget: {type: "switch"}

    },
    clipboardRead: {
        default: "ask",
        description: "是否允许在终端中运行的程序读取系统剪贴板（OSC 52）。\n\n- `ask` - 允许前询问用户（默认值）\n- `allow` - 始终允许\n- `deny` - 始终拒绝",
        key: "clipboard-read",
        name: "允许终端读取剪贴板",
        widget: {type: "pill", options: [{value: "ask", label: "询问"}, {value: "allow", label: "允许"}, {value: "deny", label: "拒绝"}]}

    },
    clipboardTrimTrailingSpaces: {
        default: "true",
        description: "去除复制到剪贴板的数据中的行尾空白。仅适用于包含其他字符的行的行尾空白。完全空白的行始终会去除其空白。",
        key: "clipboard-trim-trailing-spaces",
        name: "复制时去除行尾空白",
        widget: {type: "switch"}

    },
    clipboardWrite: {
        default: "allow",
        description: "是否允许在终端中运行的程序写入系统剪贴板（OSC 52）。\n\n- `ask` - 允许前询问用户\n- `allow` - 始终允许（默认值）\n- `deny` - 始终拒绝",
        key: "clipboard-write",
        name: "允许终端写入剪贴板",
        widget: {type: "pill", options: [{value: "ask", label: "询问"}, {value: "allow", label: "允许"}, {value: "deny", label: "拒绝"}]}

    },
    clipboardWriteLimitBytes: {
        default: "67108864",
        description: "在终端中运行的程序通过 Kitty 剪贴板协议（OSC 5522）执行单次剪贴板写入的最大字节数。这不适用于 OSC 52。\n\n超出限制的数据会导致整次写入失败并丢弃事务，剪贴板保持不变。设为 `unlimited` 可移除限制，设为 `0` 则拒绝任何非空写入。\n\n默认值为 64 MiB，即符合规范的实现必须接受的最小值。",
        key: "clipboard-write-limit-bytes",
        name: "剪贴板写入上限（字节）",
        note: "接受字节数或 <code>unlimited</code>。仅适用于 OSC 5522 写入。",
        since: "1.4.0",
        widget: {type: "number", min: 0, size: 11}

    },
    command: {
        default: "",
        description: "要运行的命令，通常是一个 Shell。若不是绝对路径，则在 PATH 中查找。若未设置，则根据 SHELL 环境变量或 passwd 条目确定 Shell。\n\n加上 `direct:` 前缀可避免 Shell 展开。加上 `shell:` 前缀始终包裹在 Shell 中运行。支持附加参数。\n\n适用于所有新的终端界面。",
        key: "command",
        name: "启动时运行的命令"

    },
    commandPaletteEntry: {
        default: [],
        description: "命令调色板中的自定义条目。\n\n每个条目需要一个标题、对应的操作以及可选描述。每个字段以字段名、冒号（`:`）和值依次构成。操作语法与快捷键操作完全相同。\n\n如果值中包含逗号或其他特殊字符，请用双引号括起来。\n\n- `command-palette-entry=clear` 清除所有先前定义的条目。\n- 在字段名前加 `-` 可仅移除特定条目。\n\n仅限 macOS。",
        key: "command-palette-entry",
        name: "命令调色板条目",
        note: "格式：<code>title:…,description:…,action:…</code>",
        platform: ["macos"],
        repeatable: true,
        since: "1.2.0",
        widget: {type: "repeatable-text", placeholder: "title:Reset Font Style,action:csi:0m"}

    },
    configDefaultFiles: {
        default: "true",
        description: "为 true 时，将加载默认配置文件路径（例如 `$XDG_CONFIG_HOME/ghostty/config`）。将此设为 false 适合从 CLI 使用 Ghostty 以尽量减少外部影响。仅限 CLI 配置；在配置文件中设置不会生效。",
        key: "config-default-files",
        name: "加载默认配置文件",
        widget: {type: "switch"}

    },
    configFile: {
        default: [],
        description: "要读取的额外配置文件。可重复设置。路径相对于包含该指令的配置文件。加上 `?` 前缀可在文件不存在时抑制错误。不允许循环引用。配置文件会在定义它们的配置之后加载。",
        key: "config-file",
        name: "额外配置文件",
        repeatable: true,
        widget: {type: "repeatable-text", placeholder: "配置文件路径"}

    },
    confirmCloseSurface: {
        default: "true",
        description: "在关闭终端界面之前确认是否应当关闭。\n\n- `true` - 若 Shell 集成检测到正在运行的进程则确认（默认值）\n- `false` - 关闭时不确认\n- `always` - 始终确认，即使 Shell 集成表明没有进程在运行",
        key: "confirm-close-surface",
        name: "关闭终端界面前确认",
        widget: {type: "pill", options: [{value: "true", label: "开"}, {value: "false", label: "关"}, {value: "always", label: "总是"}]}

    },
    copyOnSelect: {
        default: "none",
        description: "是否自动将选中的文本复制到剪贴板。\n\n- `none` - 不自动复制选中的文本\n- `primary` - 在 Linux 上仅复制到选区剪贴板（对 macOS 无效）\n- `clipboard` - 仅复制到系统剪贴板\n- `both` - 在 Linux 上复制到两个剪贴板，在 macOS 上仅复制到系统剪贴板\n\n出于向后兼容，`true` 等同于 Linux 上的 `primary`、macOS 上的 `clipboard`，`false` 等同于 `none`。\n\n默认值：Linux 上为 `primary`，其他平台为 `none`。中键粘贴始终使用选区剪贴板。",
        key: "copy-on-select",
        name: "选中时复制",
        widget: {
            type: "pill",
            options: [
                {value: "none", label: "关"},
                {value: "primary", label: "选区"},
                {value: "clipboard", label: "系统"},
                {value: "both", label: "两者"}
            ]
        }

    },
    cursorClickToMove: {
        default: "true",
        description: "启用通过 alt+click（Linux）或 option+click（macOS）在提示符处移动光标。需要 Shell 集成（OSC 133），且仅在主屏幕模式下有效。",
        key: "cursor-click-to-move",
        name: "启用点击移动光标",
        widget: {type: "switch"}

    },
    cursorColor: {
        default: "",
        description: "光标的颜色。若未设置，将选择默认值。以十六进制或 X11 命名颜色指定。自 1.2.0 起，可设为 `cell-foreground` 或 `cell-background`。",
        key: "cursor-color",
        name: "光标颜色",
        widget: {type: "custom-color", presets: [{value: "cell-foreground", label: "单元格前景"}, {value: "cell-background", label: "单元格背景"}]}

    },
    cursorOpacity: {
        default: "1",
        description: "光标的不透明度级别。取值 1 为完全不透明，0 为完全透明。足够小的取值（如 0.3）可能导致光标实际上不可见。",
        key: "cursor-opacity",
        name: "光标不透明度",
        widget: {type: "range", min: 0, max: 1, step: 0.05}

    },
    cursorStyle: {
        default: "block",
        description: "光标的样式。设置默认样式；运行中的程序可通过转义序列（CSI q）覆盖。Shell 集成会自动在提示符处将光标设为条形（可通过 `shell-integration-features = no-cursor` 禁用）。\n\n取值：`block`、`bar`、`underline`、`block_hollow`",
        key: "cursor-style",
        name: "光标样式",
        widget: {type: "dropdown", options: ["block", "bar", "underline", {name: "hollow block", value: "block_hollow"}]}

    },
    cursorStyleBlink: {
        default: "",
        description: "设置光标的默认闪烁状态。若未设置（`undefined`/未设置），Ghostty 将遵循 DEC Mode 12（AT&T 光标闪烁），以此作为开启/关闭闪烁的替代方式。若设为任意值，DEC 模式 12 将被忽略，但 DECSCUSR 仍会被遵循。\n\n取值：`true`、`false`，或不设置（null/undefined）以遵循 DEC Mode 12。",
        key: "cursor-style-blink",
        name: "光标闪烁样式",
        note: "<code>default</code> 选项会交由 DEC 模式 12 决定闪烁状态。",
        widget: {type: "pill", options: [{value: "true", label: "开"}, {value: "false", label: "关"}, {value: "", label: "默认"}]}

    },
    cursorText: {
        default: "",
        description: "光标下文字的颜色。若未设置，将采用默认值。以十六进制或 X11 命名颜色指定。自 1.2.0 起，可设置为 `cell-foreground` 或 `cell-background`。",
        key: "cursor-text",
        name: "光标下文字颜色",
        widget: {type: "custom-color", presets: [{value: "cell-foreground", label: "单元格前景"}, {value: "cell-background", label: "单元格背景"}]}

    },
    customShader: {
        default: [],
        description: "在默认着色器之后运行的自定义着色器。GLSL 语法着色器的路径，兼容 Shadertoy API。着色器应指定 `mainImage` 函数。\n\n警告：无效的着色器会导致 Ghostty 无法使用（窗口完全变黑）。\n\n可重复设置以按顺序加载多个着色器。",
        key: "custom-shader",
        name: "自定义着色器",
        note: "与 Shadertoy 的 API 一致。",
        repeatable: true,
        widget: {type: "repeatable-text", placeholder: "着色器文件路径"}

    },
    customShaderAnimation: {
        default: "true",
        description: "若为 `true`（默认值），使用自定义着色器时，获得焦点的终端界面将运行动画循环。\n\n- `false` - 仅在终端更新时渲染着色器\n- `true` - 终端获得焦点时运行动画循环\n- `always` - 无论焦点如何始终运行动画循环（占用更多 CPU）",
        key: "custom-shader-animation",
        name: "允许着色器动画",
        widget: {type: "pill", options: [{value: "false", label: "关"}, {value: "true", label: "开"}, {value: "always", label: "总是"}]}

    },
    desktopNotifications: {
        default: "true",
        description: "若为 true（默认值），在终端中运行的应用程序可以使用 OSC 9 或 OSC 777 等转义序列显示桌面通知。",
        key: "desktop-notifications",
        name: "允许桌面通知",
        widget: {type: "switch"}

    },
    dragHandle: {
        default: "auto",
        description: "控制何时在分屏上显示拖拽手柄，从而可通过鼠标重新排列分屏。\n\n- `always` - 始终显示拖拽手柄，即使只有一个分屏。\n- `auto` - 自动显示和隐藏。在 Linux 上仅在有两个或更多分屏时显示；在 macOS 上仅当单个分屏处于全屏时隐藏，否则悬停时显示。\n- `never` - 从不显示拖拽手柄；无法用鼠标重新排列分屏。",
        key: "drag-handle",
        name: "分屏拖拽手柄",
        since: "1.4.0",
        widget: {type: "pill", options: [{value: "always", label: "总是"}, {value: "auto", label: "自动"}, {value: "never", label: "从不"}]}

    },
    enquiryResponse: {
        default: "",
        description: "收到运行中命令发送的 ENQ（0x05）时发送的字符串。默认值为空字符串。",
        key: "enquiry-response",
        name: "ENQ 响应"

    },
    env: {
        default: [],
        description: "传递给在终端界面中启动的命令的额外环境变量。格式：`KEY=VALUE`。将某个键设为空字符串会将其移除。将 `env` 设为空字符串会重置整个映射。",
        key: "env",
        name: "环境变量",
        repeatable: true,
        since: "1.2.0",
        widget: {type: "repeatable-text", placeholder: "KEY=VALUE"}

    },
    faintOpacity: {
        default: "0.5",
        description: "暗淡文字的不透明度。值为 1 表示完全不透明，0 表示完全透明。",
        key: "faint-opacity",
        name: "暗淡文字不透明度",
        since: "1.2.0",
        widget: {type: "range", min: 0, max: 1, step: 0.01}

    },
    focusFollowsMouse: {
        default: "false",
        description: "若为 true，存在多个分屏窗格时，鼠标会选中获得焦点的窗格。仅适用于当前获得焦点的窗口。",
        key: "focus-follows-mouse",
        name: "鼠标移动聚焦分屏",
        widget: {type: "switch"}

    },
    fontCodepointMap: {
        default: [],
        description: "强制将一个或一段 Unicode 码点映射到指定的具名字体。语法：`codepoint=fontname`，其中 codepoint 是单个码点（`U+ABCD`）或范围（`U+ABCD-U+DEFG`）。同一字体的多个范围可用逗号分隔。",
        key: "font-codepoint-map",
        name: "Unicode 专用字体映射",
        note: "",
        repeatable: true,
        widget: {type: "repeatable-text", placeholder: "U+E000-U+E0FF=Symbols Nerd Font"}

    },
    fontFamily: {
        default: [],
        description: "要使用的字体族。可使用 CLI 生成有效值列表：`ghostty +list-fonts`。\n\n可重复设置多次，以在主字体不含所需码点时指定首选的回退字体。这对多语言、符号字体等场景特别有用。\n\n若要覆盖之前设置的值而非追加回退字体，请将值设为 `\"\"`（空字符串）以重置列表。",
        key: "font-family",
        name: "主字体族",
        repeatable: true,
        widget: {type: "repeatable-text", placeholder: "JetBrainsMono NF"}

    },
    fontFamilyBold: {
        default: [],
        description: "用于粗体文本的字体族。若未设置或未找到，则回退到 `font-family`。",
        key: "font-family-bold",
        name: "粗体字体族",
        repeatable: true

    },
    fontFamilyBoldItalic: {
        default: [],
        description: "用于粗斜体文本的字体族。若未设置或未找到，则回退到 `font-family`。",
        key: "font-family-bold-italic",
        name: "粗斜体字体族",
        repeatable: true

    },
    fontFamilyItalic: {
        default: [],
        description: "用于斜体文本的字体族。若未设置或未找到，则回退到 `font-family`。",
        key: "font-family-italic",
        name: "斜体字体族",
        repeatable: true

    },
    fontFeature: {
        default: [],
        description: "应用字体特性。要启用多个字体特性，可重复设置此项或使用逗号分隔的列表。\n\n语法：`feat`、`+feat`、`-feat`、`feat on`、`feat off`、`feat=1`、`feat=0`。\n\n要禁用编程连字，使用 `-calt`。要普遍禁用大多数连字，使用 `-calt, -liga, -dlig`。",
        key: "font-feature",
        name: "字体连字设置",
        repeatable: true,
        widget: {type: "repeatable-text", placeholder: "例如 -calt"}

    },
    fontShapingBreak: {
        default: "",
        description: "将字体整形拆分为多次运行的位置。一次运行是一段连续整形在一起的文本。拆分运行可防止在特定位置形成连字。\n\n用逗号组合多个值以设置多个选项。在选项前加 `no-` 可禁用它。\n\n可用选项：\n- `cursor` - 在光标处拆分运行。",
        key: "font-shaping-break",
        name: "字体整形断点",
        since: "1.2.0",
        widget: {type: "feature-list", features: [{id: "cursor", label: "光标", default: true}]}

    },
    fontSize: {
        default: "13",
        description: "字体大小，单位为点（point）。该值可为非整数，将选择最接近的整数像素大小。\n\nmacOS 上默认值为 13，其他平台为 12。",
        key: "font-size",
        name: "基础字体大小",
        widget: {type: "range", min: 4, max: 60, step: 0.5}

    },
    fontStyle: {
        default: "default",
        description: "主字体的具名样式。例如对于 `Iosevka Heavy`，样式为 `Heavy`。设为 `false` 可完全禁用该样式。",
        key: "font-style",
        name: "主字体样式"

    },
    fontStyleBold: {
        default: "default",
        description: "粗体文本的具名样式。例如对于 `Iosevka Heavy`，样式为 `Heavy`。设为 `false` 可完全禁用该样式。",
        key: "font-style-bold",
        name: "粗体字体样式"

    },
    fontStyleBoldItalic: {
        default: "default",
        description: "粗斜体文本的具名样式。设为 `false` 可完全禁用该样式。",
        key: "font-style-bold-italic",
        name: "粗斜体字体样式"

    },
    fontStyleItalic: {
        default: "default",
        description: "斜体文本的具名样式。设为 `false` 可完全禁用该样式。",
        key: "font-style-italic",
        name: "斜体字体样式"

    },
    fontSyntheticStyle: {
        default: "",
        description: "控制当指定字体族中不存在所请求的样式时，Ghostty 是否应合成该样式。\n\n设为 `false` 或 `true` 可完全禁用或启用合成样式。可使用 `bold`、`italic` 和 `bold-italic`（启用）或 `no-bold`、`no-italic` 和 `no-bold-italic`（禁用）来启用或禁用特定样式。多个样式可用逗号组合。\n\n可用样式键为：`bold`、`italic`、`bold-italic`。",
        key: "font-synthetic-style",
        name: "合成样式",
        note: "更多信息请参阅文档。",
        widget: {type: "feature-list", features: [{id: "bold", label: "粗体", default: true}, {id: "italic", label: "斜体", default: true}, {id: "bold-italic", label: "粗斜体", default: true}]}

    },
    fontThicken: {
        default: "false",
        description: "如支持，以更粗的笔画绘制字体。目前仅在 macOS 上支持。",
        key: "font-thicken",
        name: "加粗字体",
        note: "此项目前仅影响 macOS。",
        platform: ["macos"],
        widget: {type: "switch"}

    },
    fontThickenStrength: {
        default: "255",
        description: "启用 `font-thicken` 时的加粗强度。有效值为 0 到 255 之间的整数。0 并不表示不加粗——它对应可用的最轻加粗。当 `font-thicken` 为 false 时无效。仅限 macOS。",
        key: "font-thicken-strength",
        name: "加粗强度",
        platform: ["macos"],
        widget: {type: "range", min: 0, max: 255, step: 1}

    },
    fontVariation: {
        default: [],
        description: "可重复的设置，用于为可变字体设置一个或多个字体变体值。格式：`id=value`，其中 `id` 是轴标识符（始终为 4 个字符，例如 `wght`）。常见轴：`wght`（字重）、`slnt`（倾斜）、`ital`（斜体）、`opsz`（光学尺寸）、`wdth`（宽度）。",
        key: "font-variation",
        name: "主字体变体",
        repeatable: true,
        widget: {type: "repeatable-text", placeholder: "例如 wght=600"}

    },
    fontVariationBold: {
        default: [],
        description: "粗体文本的可变字体变体。参见 `font-variation`。",
        key: "font-variation-bold",
        name: "粗体字体变体",
        repeatable: true

    },
    fontVariationBoldItalic: {
        default: [],
        description: "粗斜体文本的可变字体变体。参见 `font-variation`。",
        key: "font-variation-bold-italic",
        name: "粗斜体字体变体",
        repeatable: true

    },
    fontVariationItalic: {
        default: [],
        description: "斜体文本的可变字体变体。参见 `font-variation`。",
        key: "font-variation-italic",
        name: "斜体字体变体",
        repeatable: true

    },
    foreground: {
        default: "#ffffff",
        description: "窗口的前景色。以十六进制（`#RRGGBB` 或 `RRGGBB`）或 X11 命名颜色指定。",
        key: "foreground",
        name: "前景色",
        widget: {type: "color"}

    },
    freetypeLoadFlags: {
        default: "",
        description: "要启用的 FreeType 加载标志。格式：逗号分隔的标志。前缀 `no-` 可禁用。使用 `true`/`false` 开启或关闭所有标志。\n\n可用标志：\n- `hinting` - 启用 hinting（默认：开）\n- `force-autohint` - 始终使用 freetype 自动 hinting 引擎（默认：关）\n- `monochrome` - 使用 1 位单色渲染，禁用抗锯齿（默认：关）\n- `autohint` - 启用 freetype 自动 hinting 引擎（默认：开）\n- `light` - 使用轻量 hinting 样式，更好地保留字形（默认：开）\n\n仅适用于使用 FreeType 的 Ghostty 构建（通常是 Linux 构建）。",
        key: "freetype-load-flags",
        name: "FreeType 加载标志",
        platform: ["linux"],
        widget: {type: "feature-list", features: [{id: "hinting", label: "字体微调", default: true}, {id: "force-autohint", label: "强制自动微调", default: false}, {id: "monochrome", label: "单色", default: false}, {id: "autohint", label: "自动微调", default: true}, {id: "light", label: "轻度微调", default: true}]}

    },
    fullscreen: {
        default: "false",
        description: "以全屏方式启动新窗口。\n\n- `false` - 不以全屏启动（默认值）\n- `true` - 以原生全屏启动\n- `non-native` - （仅 macOS）无动画的非原生全屏，隐藏菜单栏\n- `non-native-visible-menu` - （仅 macOS）非原生全屏，保持菜单栏可见\n- `non-native-padded-notch` - （仅 macOS）非原生全屏，隐藏菜单栏但为刘海留出填充\n\n重要：标签页在非原生全屏模式下不可用。",
        key: "fullscreen",
        name: "全屏模式启动",
        widget: {type: "switch"}

    },
    graphemeWidthMethod: {
        default: "unicode",
        description: "用于计算字素簇单元格宽度的方法。\n\n- `unicode` - 使用 Unicode 标准（默认值，正确，但可能与旧式程序产生光标不同步）。\n- `legacy` - 使用旧式方法，如 wcswidth（最大限度兼容旧式程序）。\n\n若运行中的程序显式启用终端模式 2027，则无论此配置如何，都会强制使用 `unicode` 宽度。",
        key: "grapheme-width-method",
        name: "字素宽度计算",
        widget: {type: "pill", options: [{value: "unicode", label: "Unicode"}, {value: "legacy", label: "传统"}]}

    },
    gtkCustomCss: {
        default: [],
        description: "要加载的自定义 CSS 文件。可重复设置以加载多个文件。若文件不存在，可在路径前加 `?` 以抑制错误。每个样式表的文件大小限制：5MiB。",
        key: "gtk-custom-css",
        name: "自定义 CSS 文件",
        platform: ["gtk"],
        repeatable: true,
        since: "1.1.0",
        widget: {type: "repeatable-text", placeholder: "CSS 文件路径"}

    },
    gtkHorizontalTabScroll: {
        default: "true",
        description: "若为 true（默认值），在触控板上双指水平滚动可在标签页之间切换。向左滚动切换到下一个标签页，向右滚动切换到上一个标签页。",
        key: "gtk-horizontal-tab-scroll",
        name: "触控板切换标签页",
        platform: ["gtk"],
        since: "1.4.0",
        widget: {type: "switch"}

    },
    gtkOpenglDebug: {
        default: "false",
        description: "启用或禁用 GTK 的 OpenGL 调试日志。调试构建中默认值为 true，其他所有构建中为 false。",
        key: "gtk-opengl-debug",
        name: "OpenGL 调试",
        platform: ["gtk"],
        since: "1.1.0",
        widget: {type: "switch"}

    },
    gtkQuickTerminalLayer: {
        default: "top",
        description: "快速终端窗口的层。\n\n- `overlay` - 位于所有窗口之前\n- `top` - 位于普通窗口之前但在全屏叠加层之后（默认值）\n- `bottom` - 位于普通窗口之后但在壁纸之前\n- `background` - 位于所有窗口之后\n\n仅限 GTK Wayland。",
        key: "gtk-quick-terminal-layer",
        name: "快速终端层",
        note: "控制快速终端显示在哪一层。仅限 GTK Wayland。",
        platform: ["gtk-wayland"],
        since: "1.2.0",
        widget: {type: "dropdown", options: ["overlay", "top", "bottom", "background"]}

    },
    gtkQuickTerminalNamespace: {
        default: "ghostty-quick-terminal",
        description: "快速终端窗口的命名空间（标识符），供 Wayland 合成器和/或脚本用来确定层终端界面的类型。\n\n仅限 GTK Wayland。",
        key: "gtk-quick-terminal-namespace",
        name: "快速终端命名空间",
        note: "快速终端层终端界面的标识符。仅限 GTK Wayland。",
        platform: ["gtk-wayland"],
        since: "1.2.0",
        widget: {type: "text", size: 18}

    },
    gtkSingleInstance: {
        default: "detect",
        description: "控制 Ghostty GTK 应用程序是否以单实例模式运行。\n\n- `true` - 单实例模式：新进程会在现有实例中创建窗口\n- `false` - 每个新进程都会启动单独的应用程序\n- `detect` - 除非设置了 TERM_PROGRAM 或存在 CLI 参数，否则假定为单实例（默认值）\n\n注意：调试构建使用单独的单实例 ID，以避免与发布构建冲突。",
        key: "gtk-single-instance",
        name: "单实例模式",
        platform: ["gtk"],
        widget: {type: "pill", options: [{value: "detect", label: "自动检测"}, {value: "true", label: "开"}, {value: "false", label: "关"}]}

    },
    gtkTabsLocation: {
        default: "top",
        description: "决定 GTK 标签栏会贴靠屏幕的哪一侧。为 `hidden` 时，标题栏中会显示一个展示标签页数量的标签按钮。",
        key: "gtk-tabs-location",
        name: "标签页位置",
        platform: ["gtk"],
        widget: {type: "pill", options: [{value: "top", label: "顶部"}, {value: "bottom", label: "底部"}]}

    },
    gtkTabsInverted: {
        default: "false",
        description: "若为 true，每个标签页的关闭按钮显示在标签页起始处（从左到右的语言中为左侧），图标显示在末尾。同时适用于标签栏和标签页概览。",
        key: "gtk-tabs-inverted",
        name: "反转标签页布局",
        platform: ["gtk"],
        since: "1.4.0",
        widget: {type: "switch"}

    },
    gtkTitlebar: {
        default: "true",
        description: "启用后，将显示完整的 GTK 标题栏，而非窗口管理器的简洁标题栏。当 `window-decoration` 为 none 或运行于 macOS 下时无效。",
        key: "gtk-titlebar",
        name: "显示标题栏",
        platform: ["gtk"],
        widget: {type: "switch"}

    },
    gtkTitlebarHideWhenMaximized: {
        default: "false",
        description: "若为 true，窗口最大化时将隐藏标题栏，取消最大化时显示。仅限 GTK。",
        key: "gtk-titlebar-hide-when-maximized",
        name: "最大化时隐藏标题栏",
        platform: ["gtk"],
        since: "1.1.0",
        widget: {type: "switch"}

    },
    gtkTitlebarStyle: {
        default: "native",
        description: "GTK 标题栏的样式。\n\n- `native` - 传统标题栏，包含标题、按钮和窗口控件。打开多个标签页时，标签栏显示在其下方。\n- `tabs` - 合并标签栏和标题栏以节省垂直空间。无法通过标签页标题拖动窗口。",
        key: "gtk-titlebar-style",
        name: "标题栏样式",
        note: "<code>tabs</code> 合并标签栏和标题栏以节省垂直空间。",
        platform: ["gtk"],
        widget: {type: "pill", options: [{value: "native", label: "原生"}, {value: "tabs", label: "标签页"}]}

    },
    gtkToolbarStyle: {
        default: "raised",
        description: "决定 GTK 终端中顶部和底部栏的外观。\n\n- `flat` - 顶部和底部栏与终端窗口齐平\n- `raised` - 顶部和底部栏在终端区域投下阴影\n- `raised-border` - 类似 `raised`，但阴影替换为细微边框",
        key: "gtk-toolbar-style",
        name: "工具栏样式",
        platform: ["gtk"],
        widget: {type: "dropdown", options: ["raised", "flat", "raised-border"]}

    },
    gtkWideTabs: {
        default: "true",
        description: "若为 true（默认值），GTK 标签页将为“宽”模式（占满可用空间，GNOME 风格）。若为 false，标签页仅占用所需空间。",
        key: "gtk-wide-tabs",
        name: "使用宽标签页",
        note: "将此设为 <code>false</code> 将使标签页仅占用最少所需空间。",
        platform: ["gtk"],
        widget: {type: "switch"}

    },
    imageStorageLimit: {
        default: "320000000",
        description: "每个终端屏幕可用于图像数据（例如 Kitty 图像协议）的总字节数。最大值为 4,294,967,295（4GiB）。默认值为 320MB。若设为零，则禁用所有图像协议。主屏幕和备用屏幕分别计算。",
        key: "image-storage-limit",
        name: "图像缓冲区上限（字节）",
        widget: {type: "number", min: 0, max: 4294967295, size: 12}

    },
    initialCommand: {
        default: "",
        description: "与 `command` 相同，但仅适用于 Ghostty 启动时创建的第一个终端界面。也可通过 `-e` CLI 标志设置（例如 `ghostty -e fish --with --custom --args`）。",
        key: "initial-command",
        name: "首次启动时运行的命令",
        note: "与上一个设置不同，此设置仅在应用生命周期内运行一次。"

    },
    initialWindow: {
        default: "true",
        description: "控制运行 Ghostty 时是否创建初始窗口。仅在 Linux 和 macOS 上实现。",
        key: "initial-window",
        name: "启动时显示窗口",
        widget: {type: "switch"}

    },
    input: {
        default: [],
        description: "启动时作为输入发送给命令的数据。格式：\n- `raw:<string>` - 发送原始文本（Zig 字符串字面量语法）\n- `path:<path>` - 读取文件并发送其内容（最大 10MB）\n- 裸值将被视为 `raw:`\n\n可重复设置；数据会直接拼接。",
        key: "input",
        name: "初始输入",
        note: "tty 启动时的输入。可为原始文本、Zig 字符串字面量或 path:/to/file。",
        repeatable: true,
        since: "1.2.0",
        widget: {type: "repeatable-text", placeholder: "raw:文本 或 path:/文件路径"}

    },
    keybind: {
        // Ghostty builds its default binding set in Zig against the host platform, so this list is
        // the macOS set as reported by `ghostty +show-config --default` (1.4.0). It is the baseline
        // `diff()` compares against; a binding the user changes is all that gets written out.
        default: [
            "super+shift+,=reload_config",
            "super+,=open_config:os_open",
            "copy=copy_to_clipboard:mixed",
            "paste=paste_from_clipboard",
            "super+c=copy_to_clipboard:mixed",
            "super+v=paste_from_clipboard",
            "super+==increase_font_size:1",
            "super++=increase_font_size:1",
            "super+-=decrease_font_size:1",
            "super+0=reset_font_size",
            "super+ctrl+shift+j=write_screen_file:copy,plain",
            "super+shift+j=write_screen_file:paste,plain",
            "super+alt+shift+j=write_screen_file:open,plain",
            "shift+arrow_left=adjust_selection:left",
            "shift+arrow_right=adjust_selection:right",
            "shift+arrow_up=adjust_selection:up",
            "shift+arrow_down=adjust_selection:down",
            "shift+page_up=adjust_selection:page_up",
            "shift+page_down=adjust_selection:page_down",
            "shift+home=adjust_selection:home",
            "shift+end=adjust_selection:end",
            "ctrl+shift+tab=previous_tab",
            "ctrl+tab=next_tab",
            "super+digit_1=goto_tab:1",
            "super+1=goto_tab:1",
            "super+digit_2=goto_tab:2",
            "super+2=goto_tab:2",
            "super+digit_3=goto_tab:3",
            "super+3=goto_tab:3",
            "super+digit_4=goto_tab:4",
            "super+4=goto_tab:4",
            "super+digit_5=goto_tab:5",
            "super+5=goto_tab:5",
            "super+digit_6=goto_tab:6",
            "super+6=goto_tab:6",
            "super+digit_7=goto_tab:7",
            "super+7=goto_tab:7",
            "super+digit_8=goto_tab:8",
            "super+8=goto_tab:8",
            "super+9=last_tab",
            "super+enter=toggle_fullscreen",
            "super+shift+enter=toggle_split_zoom",
            "super+shift+p=toggle_command_palette",
            "super+q=quit",
            "super+k=clear_screen",
            "super+a=select_all",
            "super+shift+t=undo",
            "super+z=undo",
            "super+shift+z=redo",
            "super+home=scroll_to_top",
            "super+end=scroll_to_bottom",
            "super+page_up=scroll_page_up",
            "super+page_down=scroll_page_down",
            "super+j=scroll_to_selection",
            "super+shift+arrow_up=jump_to_prompt:-1",
            "super+shift+arrow_down=jump_to_prompt:1",
            "super+n=new_window",
            "super+w=close_surface",
            "super+alt+w=close_tab:this",
            "super+shift+w=close_window",
            "super+alt+shift+w=close_all_windows",
            "super+t=new_tab",
            "super+shift+[=previous_tab",
            "super+shift+]=next_tab",
            "super+d=new_split:right",
            "super+shift+d=new_split:down",
            "super+[=goto_split:previous",
            "super+]=goto_split:next",
            "super+alt+arrow_up=goto_split:up",
            "super+alt+arrow_down=goto_split:down",
            "super+alt+arrow_left=goto_split:left",
            "super+alt+arrow_right=goto_split:right",
            "super+ctrl+arrow_up=resize_split:up,10",
            "super+ctrl+arrow_down=resize_split:down,10",
            "super+ctrl+arrow_left=resize_split:left,10",
            "super+ctrl+arrow_right=resize_split:right,10",
            "super+ctrl+==equalize_splits",
            "super+arrow_up=jump_to_prompt:-1",
            "super+arrow_down=jump_to_prompt:1",
            "super+f=start_search",
            "super+e=search_selection",
            "super+shift+f=end_search",
            "escape=end_search",
            "super+g=navigate_search:next",
            "super+shift+g=navigate_search:previous",
            "super+alt+i=inspector:toggle",
            "super+ctrl+f=toggle_fullscreen",
            "super+shift+v=paste_from_selection",
            "super+arrow_right=text:\\x05",
            "super+arrow_left=text:\\x01",
            "super+backspace=text:\\x15",
            "alt+arrow_left=esc:b",
            "alt+arrow_right=esc:f"
        ],
        description: "快捷键。格式：`trigger=action`。重复的触发器会覆盖之前的值。\n\n触发器：用 `+` 分隔的按键与修饰键列表（例如 `ctrl+a`、`ctrl+shift+b`）。\n\n可使用 W3C 键码指定物理按键（例如 `KeyA`、`key_a`）。\n\n特殊触发器前缀值：\n- `all:` - 应用于所有终端界面\n- `global:` - 使快捷键为全局（系统范围）\n- `unconsumed:` - 不消耗输入\n- `performable:` - 仅在操作可执行时消耗\n\n特殊值：\n- `keybind=clear` - 清除所有快捷键\n\n链式操作（自 1.3.0 起）：使用 `chain=action` 作为后续的快捷键条目。\n\n键表（自 1.3.0 起）：使用 `<table>/<binding>` 语法。",
        key: "keybind",
        name: "快捷键",
        repeatable: true

    },
    keyRemap: {
        default: [],
        description: "在 Ghostty 内重映射修饰键，而不影响系统范围的设置。\n\n格式为 `from=to`，两者均为修饰键名称：`ctrl`、`alt`、`shift`、`super`（macOS 上为 `cmd`/`command`），或区分左右侧的名称如 `left_ctrl`、`right_alt`。多个重映射需要多个条目。\n\n- 重映射是单向的：重映射 `ctrl=super` 会让物理 Ctrl 键表现为 Super，但 Super 仍为 Super。\n- 重映射不具传递性：在 `ctrl=super` 和 `alt=ctrl` 下，Alt 产生 Ctrl，而非 Super。\n- 这同时影响快捷键匹配和终端输入编码，但不影响键盘布局。",
        key: "key-remap",
        name: "重映射修饰键",
        note: "格式：<code>from=to</code>，例如 <code>ctrl=super</code>。",
        repeatable: true,
        widget: {type: "repeatable-text", placeholder: "ctrl=super"}

    },
    language: {
        default: "",
        description: "将 Ghostty 的图形用户界面语言设置为系统默认语言之外的语言。语言必须完整指定，包括编码。例如：`language = de_DE.UTF-8` 会强制 Ghostty 图形用户界面中的字符串使用德语而非系统默认语言。\n\n这不会影响在 Ghostty 内运行的程序所使用的语言。它们将继续使用系统默认语言。\n\n警告：此设置无法在运行时重新加载。要更改语言，必须完全重启 Ghostty。",
        key: "language",
        name: "界面语言",
        note: "设置 Ghostty 的 GTK GUI 语言（例如 <code>de</code>、<code>fr</code>）。需要完全重启。仅限 GTK。",
        platform: ["gtk"],
        since: "1.3.0"

    },
    linkOsc8: {
        default: "true",
        description: "启用通过 OSC 8 转义序列创建的超链接。禁用后，OSC 8 超链接不会被高亮、预览、复制或打开。\n\n这不会影响由 `link-url` 控制的 URL 匹配。",
        key: "link-osc8",
        name: "OSC 8 超链接",
        note: "禁用此项不会影响普通 URL 匹配（`link-url`）。",
        since: "1.4.0",
        widget: {type: "switch"}

    },
    linkPreviews: {
        default: "true",
        description: "为匹配到的 URL 显示链接预览。\n\n- `true` - 为所有匹配到的 URL 显示预览\n- `false` - 从不显示链接预览\n- `osc8` - 仅显示 OSC 8 超链接的预览（此类链接的文字可与目标地址不同）",
        key: "link-previews",
        name: "显示链接预览",
        note: "设置为 <code>osc8</code> 时，仅对使用 OSC 8 序列创建的超链接显示预览。",
        since: "1.2.0",
        widget: {type: "pill", options: [{value: "true", label: "开"}, {value: "false", label: "关"}, {value: "osc8", label: "OSC 8"}]}

    },
    linkUrl: {
        default: "true",
        description: "启用 URL 匹配。按住 control（Linux）或 command（macOS）键并将鼠标悬停时匹配 URL，并使用系统默认应用打开。URL 匹配器的优先级始终低于任何已配置的链接。",
        key: "link-url",
        name: "自动链接 URL",
        note: "按住 control（Linux）或 command（macOS）键时进行匹配。",
        widget: {type: "switch"}

    },
    linuxCgroup: {
        default: "never",
        description: "将每个终端界面（标签页、分屏、窗口）放入临时的 systemd scope，以便按终端界面进行资源管理。\n\n- `never` - 从不使用 cgroups（默认值）\n- `always` - 始终使用 cgroups\n- `single-instance` - 仅对以单实例应用方式启动的 Ghostty 实例启用 cgroups\n\n需要 systemd。会导致启动略慢。更改不会反映到已有终端界面。",
        key: "linux-cgroup",
        name: "使用专用 cgroup",
        platform: ["linux"],
        widget: {type: "dropdown", options: ["never", "always", "single-instance"]}

    },
    linuxCgroupHardFail: {
        default: "false",
        description: "若为 false，创建临时 systemd scope 失败将被静默允许。若为 true，任何临时 systemd scope 创建失败都会导致终端界面创建失败。",
        key: "linux-cgroup-hard-fail",
        name: "启动时硬失败",
        platform: ["linux"],
        widget: {type: "switch"}

    },
    linuxCgroupMemoryLimit: {
        default: "",
        description: "单个终端进程（标签页、分屏、窗口）的内存限制，单位为字节。若未设置，则不施加限制。会设置临时 systemd scope 的 `MemoryHigh` 选项（软限制）。更改不会反映到已有终端界面。",
        key: "linux-cgroup-memory-limit",
        name: "内存限制（字节）",
        platform: ["linux"],
        widget: {type: "number", min: 0, max: 4294967295, size: 12}

    },
    linuxCgroupProcessesLimit: {
        default: "",
        description: "单个终端进程（标签页、分屏、窗口）的进程数限制。若未设置，则不施加限制。会设置 `TasksMax` 选项（硬限制）。更改不会反映到已有终端界面。",
        key: "linux-cgroup-processes-limit",
        name: "最大进程数",
        platform: ["linux"],
        widget: {type: "number", min: 0, size: 5}

    },
    macosApplescript: {
        default: "true",
        description: "若为 true（默认值），Ghostty 在 macOS 上公开并处理内置的 AppleScript 字典。若为 false，所有 AppleScript 交互均被禁用，包括 AppleScript 命令以及对窗口、标签页和终端的对象查找。",
        key: "macos-applescript",
        name: "启用 AppleScript 支持",
        note: "若禁用，则与 Ghostty 的所有 AppleScript 交互都会被关闭。",
        platform: ["macos"],
        widget: {type: "switch"}

    },
    macosAutoSecureInput: {
        default: "true",
        description: "若为 true，macOS 上的 Ghostty 在检测到密码提示时会自动启用 Secure Input。Secure Input 可阻止应用读取键盘事件。请注意，自动检测基于启发式方法，在 SSH 环境下可能无法生效。",
        key: "macos-auto-secure-input",
        name: "自动安全输入",
        platform: ["macos"],
        widget: {type: "switch"}

    },
    macosCustomIcon: {
        default: "",
        description: "自定义图标文件的绝对路径。支持的格式：PNG、JPEG、ICNS。默认为 `~/.config/ghostty/Ghostty.icns`。在 `macos-icon = custom` 时使用。",
        key: "macos-custom-icon",
        name: "图标文件",
        note: "仅在上方选择了 <code>custom</code> 时使用。",
        platform: ["macos"]

    },
    macosDockDropBehavior: {
        default: "new-tab",
        description: "控制将文件或文件夹拖放到 macOS Dock 中的 Ghostty 图标时的窗口行为。\n\n- `new-tab` - 在当前窗口中创建新标签页（默认值）\n- `new-window` - 无条件创建新窗口",
        key: "macos-dock-drop-behavior",
        name: "Dock 拖放行为",
        note: "将文件拖放到 Ghostty 的 Dock 图标上时的行为。",
        platform: ["macos"],
        widget: {type: "pill", options: [{value: "new-tab", label: "新建标签页"}, {value: "new-window", label: "新建窗口"}]}

    },
    macosHidden: {
        default: "never",
        description: "控制是否将 macOS 应用从 Dock 和应用切换器中排除。主要面向以快速终端模式为主要使用方式的用户。\n\n- `never` - 从不隐藏应用（默认值）\n- `always` - 始终隐藏应用\n\n注意：隐藏时，键盘布局变更不会自动生效。",
        key: "macos-hidden",
        name: "从 Dock 和切换器中隐藏",
        platform: ["macos"],
        since: "1.2.0",
        widget: {type: "pill", options: [{value: "never", label: "从不"}, {value: "always", label: "总是"}]}

    },
    macosIcon: {
        default: "official",
        description: "自定义 macOS 应用图标（影响 Dock、应用切换器等）。\n\n- `official` - 官方 Ghostty 图标\n- `blueprint`、`chalkboard`、`microchip`、`glass`、`holographic`、`paper`、`retro`、`xray` - 官方图标变体\n- `custom` - 完全自定义的图标（使用 `macos-custom-icon` 设置路径）\n- `custom-style` - 带自定义样式的官方图标（需要 `macos-icon-ghost-color` 和 `macos-icon-screen-color`）",
        key: "macos-icon",
        name: "图标",
        note: "自定义样式必须同时指定 Ghost 颜色和屏幕颜色。",
        platform: ["macos"],
        widget: {type: "dropdown", options: macosIconOptions}

    },
    macosIconFrame: {
        default: "aluminum",
        description: "用于 macOS 应用图标边框的材质。在 `macos-icon = custom-style` 时必填。\n\n- `aluminum` - 拉丝铝边框（默认值）\n- `beige` - 经典的 90 年代电脑米色边框\n- `plastic` - 光泽深色塑料边框\n- `chrome` - 闪亮的镀铬边框",
        key: "macos-icon-frame",
        name: "图标边框",
        platform: ["macos"],
        widget: {type: "dropdown", options: macosIconFrameOptions}

    },
    macosIconGhostColor: {
        default: "",
        description: "macOS 应用图标中 Ghost 的颜色。在 `macos-icon = custom-style` 时必填。使用十六进制值或 X11 命名颜色指定。",
        key: "macos-icon-ghost-color",
        name: "Ghost 颜色",
        platform: ["macos"],
        widget: {type: "color"}

    },
    // This supports up to 64 comma-separated gradient colors, which wants a dedicated `repeatable-color`
    // widget. Intentionally kept as a single `color` widget for now... it's niche (macOS icon gradient only),
    // and the string value is still fully editable. TODO: to build later, add a `repeatable-color` WidgetDef member,
    // add its type to the `RepeatableWidgetDef` Extract in types.ts, then make this `repeatable: true` + `default: []`.
    macosIconScreenColor: {
        default: "",
        description: "macOS 应用图标中屏幕的颜色。屏幕为线性渐变；最多可指定 64 个以逗号分隔的颜色。第一个颜色是渐变的底部，最后一个是顶部。在 `macos-icon = custom-style` 时必填。",
        key: "macos-icon-screen-color",
        name: "屏幕颜色",
        platform: ["macos"],
        widget: {type: "color"}

    },
    macosNonNativeFullscreen: {
        default: "false",
        description: "若不为 false，macOS 上的全屏将不使用原生全屏，而是在新的空间中让窗口以无动画方式全屏。\n\n重要：此模式下标签页无法使用。\n\n- `false` - 使用 macOS 原生全屏（默认值）\n- `true` - 非原生全屏，隐藏菜单栏\n- `visible-menu` - 非原生全屏，保持菜单栏可见\n- `padded-notch` - 非原生全屏，隐藏菜单栏，为刘海留出边距",
        key: "macos-non-native-fullscreen",
        name: "使用非原生全屏",
        note: "标签页目前无法用于非原生全屏窗口",
        platform: ["macos"],
        widget: {type: "dropdown", options: ["visible-menu", "true", "false", "padded-notch"]}

    },
    macosOptionAsAlt: {
        default: "",
        description: "改变 macOS Option 键的行为，使其充当 Alt 键。\n\n默认值（未设置）取决于键盘布局：对美式标准/国际布局为 `true`，其他情况为 `false`。\n\n- `true` - Option 视为 Alt（会破坏 Unicode 输入序列）\n- `false` - 恢复 macOS Alt 键的 unicode 序列（会破坏终端 Alt 序列）\n- `left` - 仅对左 Option 键启用\n- `right` - 仅对右 Option 键启用",
        key: "macos-option-as-alt",
        name: "将 Option 键用作 Alt 键",
        platform: ["macos"],
        widget: {type: "dropdown", options: ["true", "false", "left", "right"], allowEmpty: true, emptyLabel: "恢复默认值"}

    },
    macosSecureInputIndication: {
        default: "true",
        description: "若为 true，当安全输入启用时，Ghostty 会显示图形指示。",
        key: "macos-secure-input-indication",
        name: "指示安全输入",
        platform: ["macos"],
        widget: {type: "switch"}

    },
    macosShortcuts: {
        default: "ask",
        description: "是否允许 macOS 快捷指令控制 Ghostty。Ghostty 公开了一些操作，允许快捷指令创建终端、发送文本、运行命令等。\n\n- `ask` - 询问用户是否授权（会被记住，与其他 macOS 权限类似）（默认值）\n- `allow` - 允许，不再询问\n- `deny` - 拒绝快捷指令控制 Ghostty",
        key: "macos-shortcuts",
        name: "macOS 快捷指令",
        note: "控制是否可以捕获 macOS 系统快捷键（例如 Cmd+Space）。",
        platform: ["macos"],
        since: "1.2.0",
        widget: {type: "pill", options: [{value: "allow", label: "允许"}, {value: "deny", label: "拒绝"}, {value: "ask", label: "询问"}]}

    },
    macosTitlebarProxyIcon: {
        default: "visible",
        description: "macOS 标题栏中的代理图标是否可见。代理图标代表当前工作目录所在的文件夹。仅在原生 macOS 标题栏样式下可见。",
        key: "macos-titlebar-proxy-icon",
        name: "标题栏代理图标",
        platform: ["macos"],
        widget: {type: "pill", options: [{value: "visible", label: "可见"}, {value: "hidden", label: "隐藏"}]}

    },
    macosTitlebarStyle: {
        default: "transparent",
        description: "macOS 标题栏的样式。\n\n- `native` - 标准的 macOS 原生标题栏\n- `transparent` - 原生但透明，显示窗口背景色\n- `tabs` - 集成标签栏的自定义标题栏（在 macOS 13 及更低版本上有限制）\n- `hidden` - 隐藏标题栏（与 `window-decoration = none` 不同，仍保留窗口边框和圆角）",
        key: "macos-titlebar-style",
        name: "标题栏样式",
        platform: ["macos"],
        widget: {type: "dropdown", options: ["transparent", "native", "tabs", "hidden"]}

    },
    macosWindowButtons: {
        default: "visible",
        description: "macOS 标题栏中的窗口按钮（交通灯）是否可见。\n\n- `visible` - 显示窗口按钮（默认值）\n- `hidden` - 隐藏窗口按钮\n\n在 `window-decoration = none` 或 `macos-titlebar-style = hidden` 时无效。",
        key: "macos-window-buttons",
        name: "窗口按钮（交通灯）",
        platform: ["macos"],
        since: "1.2.0",
        widget: {type: "pill", options: [{value: "visible", label: "可见"}, {value: "hidden", label: "隐藏"}]}

    },
    macosWindowShadow: {
        default: "true",
        description: "是否启用 macOS 窗口阴影。在某些窗口管理器和窗口透明度设置下，设为 false 可能观感更好。",
        key: "macos-window-shadow",
        name: "显示窗口阴影",
        platform: ["macos"],
        widget: {type: "switch"}

    },
    maximize: {
        default: "false",
        description: "是否以最大化状态启动窗口。仅适用于新窗口，不适用于标签页或分屏。",
        key: "maximize",
        name: "以最大化窗口启动",
        since: "1.1.0",
        widget: {type: "switch"}

    },
    middleClickAction: {
        default: "primary-paste",
        description: "用户在终端界面上中键单击时要执行的操作。\n\n- `primary-paste` - 在 Linux 上从选区剪贴板粘贴（macOS 上无操作，默认值）\n- `clipboard-paste` - 从系统剪贴板粘贴\n- `ignore` - 不执行任何操作，忽略中键单击",
        key: "middle-click-action",
        name: "中键单击操作",
        widget: {type: "dropdown", options: ["primary-paste", "clipboard-paste", "ignore"]}

    },
    minimumContrast: {
        default: "1",
        description: "前景色与背景色之间的最小对比度。取值介于 1 到 21 之间。值为 1 表示允许无对比度（例如黑底黑字）。基于 WCAG 2.0 规范。不适用于 Emoji 或图像。",
        key: "minimum-contrast",
        name: "最小对比度",
        widget: {type: "range", min: 1, max: 21, step: 0.1}

    },
    mouseHideWhileTyping: {
        default: "false",
        description: "输入时立即隐藏鼠标。再次使用鼠标（按键、移动等）时，鼠标会重新显示。",
        key: "mouse-hide-while-typing",
        name: "输入时隐藏鼠标",
        widget: {type: "switch"}

    },
    mouseReporting: {
        default: "true",
        description: "启用或禁用鼠标上报。为 false 时，即使终端应用请求，鼠标事件也不会被上报。可在运行时使用 `toggle_mouse_reporting` 快捷键操作切换。",
        key: "mouse-reporting",
        name: "允许鼠标上报",
        note: "允许终端应用接收鼠标事件。",
        widget: {type: "switch"}

    },
    mouseScrollMultiplier: {
        default: "precision:1,discrete:3",
        description: "鼠标滚轮滚动距离的倍率。可添加 `precision:` 或 `discrete:` 前缀，以逗号分隔，仅针对特定设备类型设置倍率。若未使用前缀，则倍率适用于所有设备。\n\n离散设备的默认值为 3，精确设备的默认值为 1。取值会被限制在 [0.01, 10000] 范围内。",
        key: "mouse-scroll-multiplier",
        name: "鼠标滚动倍率",
        widget: {type: "scroll-multiplier"}

    },
    mouseShiftCapture: {
        default: "false",
        description: "决定正在运行的程序能否检测到鼠标单击时按下的 Shift 键。通常，Shift 用于扩展鼠标选区。\n\n- `false` - 不随鼠标协议发送 Shift，将扩展选区。程序可通过 XTSHIFTESCAPE 覆盖。\n- `true` - 随鼠标协议发送 Shift。程序可通过 XTSHIFTESCAPE 覆盖。\n- `never` - 与 false 相同，但程序无法通过 XTSHIFTESCAPE 覆盖。\n- `always` - 与 true 相同，但程序无法通过 XTSHIFTESCAPE 覆盖。",
        key: "mouse-shift-capture",
        name: "允许鼠标点击携带 Shift",
        widget: {type: "dropdown", options: ["true", "false", "always", "never"]}

    },
    notifyOnCommandFinish: {
        default: "never",
        description: "控制何时发送命令完成通知。需要 Shell 集成或 OSC 133 转义序列。\n\n- `never` - 从不发送通知（默认值）\n- `unfocused` - 仅在终端界面未获得焦点时\n- `always` - 始终发送通知",
        key: "notify-on-command-finish",
        name: "命令完成时通知",
        note: "需要 Shell 集成或 OSC 133 转义序列。",
        since: "1.3.0",
        widget: {type: "pill", options: [{value: "never", label: "从不"}, {value: "unfocused", label: "非聚焦"}, {value: "always", label: "总是"}]}

    },
    notifyOnCommandFinishAction: {
        default: "",
        description: "启用命令完成通知时，以何种方式通知用户。逗号分隔的列表。添加 `no-` 前缀可禁用。\n\n选项：\n- `bell` - 默认启用\n- `notify` - 默认禁用",
        key: "notify-on-command-finish-action",
        name: "通知操作",
        since: "1.3.0",
        widget: {type: "feature-list", features: [{id: "bell", label: "响铃", default: true}, {id: "notify", label: "系统通知", default: false}]}

    },
    notifyOnCommandFinishAfter: {
        default: "5s",
        description: "命令需运行多久才会发送通知。默认值为 5 秒。时长格式：数字后跟时间单位（y、d、h、m、s、ms、us、ns）。",
        key: "notify-on-command-finish-after",
        name: "通知前最短运行时间",
        note: "命令需运行多久才会发送通知。格式如 <code>5s</code>、<code>500ms</code>。",
        since: "1.3.0",
        widget: {type: "duration", allowEmpty: false}

    },
    oscColorReportFormat: {
        default: "16-bit",
        description: "请求颜色信息的 OSC 序列（OSC 4、10、11）的报告格式。\n\n- `none` - OSC 查询不会收到任何回复\n- `8-bit` - 返回未缩放的色彩分量（例如 `rr/gg/bb`）\n- `16-bit` - 返回缩放后的色彩分量（例如 `rrrr/gggg/bbbb`）（默认值）",
        key: "osc-color-report-format",
        name: "OSC 颜色报告格式",
        widget: {type: "pill", options: [{value: "none", label: "无"}, {value: "8-bit", label: "8 位"}, {value: "16-bit", label: "16 位"}]}

    },
    palette: {
        default: ["#1d1f21", "#cc6666", "#b5bd68", "#f0c674", "#81a2be", "#b294bb", "#8abeb7", "#c5c8c6", "#666666", "#d54e53", "#b9ca4a", "#e7c547", "#7aa6da", "#c397d8", "#70c0b1", "#eaeaea", "#000000", "#00005f", "#000087", "#0000af", "#0000d7", "#0000ff", "#005f00", "#005f5f", "#005f87", "#005faf", "#005fd7", "#005fff", "#008700", "#00875f", "#008787", "#0087af", "#0087d7", "#0087ff", "#00af00", "#00af5f", "#00af87", "#00afaf", "#00afd7", "#00afff", "#00d700", "#00d75f", "#00d787", "#00d7af", "#00d7d7", "#00d7ff", "#00ff00", "#00ff5f", "#00ff87", "#00ffaf", "#00ffd7", "#00ffff", "#5f0000", "#5f005f", "#5f0087", "#5f00af", "#5f00d7", "#5f00ff", "#5f5f00", "#5f5f5f", "#5f5f87", "#5f5faf", "#5f5fd7", "#5f5fff", "#5f8700", "#5f875f", "#5f8787", "#5f87af", "#5f87d7", "#5f87ff", "#5faf00", "#5faf5f", "#5faf87", "#5fafaf", "#5fafd7", "#5fafff", "#5fd700", "#5fd75f", "#5fd787", "#5fd7af", "#5fd7d7", "#5fd7ff", "#5fff00", "#5fff5f", "#5fff87", "#5fffaf", "#5fffd7", "#5fffff", "#870000", "#87005f", "#870087", "#8700af", "#8700d7", "#8700ff", "#875f00", "#875f5f", "#875f87", "#875faf", "#875fd7", "#875fff", "#878700", "#87875f", "#878787", "#8787af", "#8787d7", "#8787ff", "#87af00", "#87af5f", "#87af87", "#87afaf", "#87afd7", "#87afff", "#87d700", "#87d75f", "#87d787", "#87d7af", "#87d7d7", "#87d7ff", "#87ff00", "#87ff5f", "#87ff87", "#87ffaf", "#87ffd7", "#87ffff", "#af0000", "#af005f", "#af0087", "#af00af", "#af00d7", "#af00ff", "#af5f00", "#af5f5f", "#af5f87", "#af5faf", "#af5fd7", "#af5fff", "#af8700", "#af875f", "#af8787", "#af87af", "#af87d7", "#af87ff", "#afaf00", "#afaf5f", "#afaf87", "#afafaf", "#afafd7", "#afafff", "#afd700", "#afd75f", "#afd787", "#afd7af", "#afd7d7", "#afd7ff", "#afff00", "#afff5f", "#afff87", "#afffaf", "#afffd7", "#afffff", "#d70000", "#d7005f", "#d70087", "#d700af", "#d700d7", "#d700ff", "#d75f00", "#d75f5f", "#d75f87", "#d75faf", "#d75fd7", "#d75fff", "#d78700", "#d7875f", "#d78787", "#d787af", "#d787d7", "#d787ff", "#d7af00", "#d7af5f", "#d7af87", "#d7afaf", "#d7afd7", "#d7afff", "#d7d700", "#d7d75f", "#d7d787", "#d7d7af", "#d7d7d7", "#d7d7ff", "#d7ff00", "#d7ff5f", "#d7ff87", "#d7ffaf", "#d7ffd7", "#d7ffff", "#ff0000", "#ff005f", "#ff0087", "#ff00af", "#ff00d7", "#ff00ff", "#ff5f00", "#ff5f5f", "#ff5f87", "#ff5faf", "#ff5fd7", "#ff5fff", "#ff8700", "#ff875f", "#ff8787", "#ff87af", "#ff87d7", "#ff87ff", "#ffaf00", "#ffaf5f", "#ffaf87", "#ffafaf", "#ffafd7", "#ffafff", "#ffd700", "#ffd75f", "#ffd787", "#ffd7af", "#ffd7d7", "#ffd7ff", "#ffff00", "#ffff5f", "#ffff87", "#ffffaf", "#ffffd7", "#ffffff", "#080808", "#121212", "#1c1c1c", "#262626", "#303030", "#3a3a3a", "#444444", "#4e4e4e", "#585858", "#626262", "#6c6c6c", "#767676", "#808080", "#8a8a8a", "#949494", "#9e9e9e", "#a8a8a8", "#b2b2b2", "#bcbcbc", "#c6c6c6", "#d0d0d0", "#dadada", "#e4e4e4", "#eeeeee"],
        description: "256 色形式的调色板。语法：`N=COLOR`，其中 N 为 0-255，COLOR 为 RGB 颜色代码（`#AABBCC`）或 X11 命名颜色。调色板索引可使用十进制、二进制（0b）、八进制（0o）或十六进制（0x）。",
        key: "palette",
        name: "调色板",
        repeatable: true,
        widget: {type: "palette"}

    },
    paletteGenerate: {
        default: "false",
        description: "是否根据 16 种基础 ANSI 颜色自动生成扩展的 256 色调色板（索引 16-255）。通过 `palette` 显式设置的颜色永远不会被覆盖。\n\n默认关闭：许多使用 256 色的旧程序会硬编码假设这些颜色就是 xterm 的取值。它仍然是主题作者和希望自定义调色板又不想逐一指定 256 种颜色的用户的有力工具。",
        key: "palette-generate",
        name: "自动生成缺失的调色板颜色",
        note: "启用后，Ghostty 将基于前 16 种颜色生成缺失的颜色（索引 16-231）。",
        since: "1.3.0",
        widget: {type: "switch"}

    },
    paletteHarmonious: {
        default: "false",
        description: "反转启用 `palette-generate` 时生成的调色板颜色，使颜色以相反顺序排列。这样基于调色板的应用在浅色和深色模式下都能良好工作。若 `palette-generate` 已禁用，则无效。",
        key: "palette-harmonious",
        name: "和谐调色板生成",
        note: "反转生成的调色板颜色。若自动生成已禁用，则无效。",
        since: "1.3.0",
        widget: {type: "switch"}

    },
    progressStyle: {
        default: "true",
        description: "若为 true（默认值），终端中运行的应用可使用 ConEmu OSC 9;4 转义序列显示图形进度条。若为 false，进度条序列会被静默忽略。",
        key: "progress-style",
        name: "显示进度条（OSC 9;4）",
        note: "允许应用通过 ConEmu OSC 9;4 转义序列显示图形进度条。",
        widget: {type: "switch"}

    },
    quickTerminalAnimationDuration: {
        default: "0.2",
        description: "快速终端进入和退出动画的时长（秒）。设为 0 可完全禁用动画。可在运行时更改。仅在 macOS 上实现。",
        key: "quick-terminal-animation-duration",
        name: "动画时长",
        note: "快速终端动画的时长，单位为秒，取值范围 0 到 10。",
        platform: ["macos"],
        widget: {type: "range", min: 0, max: 10, step: 0.1, showLabels: false}

    },
    quickTerminalAutohide: {
        default: "true",
        description: "当焦点转移到其他窗口时，自动隐藏快速终端。macOS 上默认为 true，Linux/BSD 上默认为 false。\n\n在 Linux 上，全局快捷键需要系统配置且不易使用，因此更适合让终端保持打开。",
        key: "quick-terminal-autohide",
        name: "自动隐藏",
        note: "当焦点移开时，此选项会自动隐藏快速终端。",
        widget: {type: "switch"}

    },
    quickTerminalKeyboardInteractivity: {
        default: "on-demand",
        description: "决定快速终端何时接收键盘输入。\n\n- `none` - 不接收任何键盘输入\n- `on-demand` - 仅在获得焦点时接收键盘输入（默认值）\n- `exclusive` - 始终接收键盘输入，即使其他窗口获得焦点\n\n仅对 Linux Wayland 有效。在 macOS 上，行为始终等同于 `on-demand`。",
        key: "quick-terminal-keyboard-interactivity",
        name: "键盘输入",
        note: "控制快速终端何时接收键盘输入。仅限 GTK Wayland。",
        platform: ["gtk-wayland"],
        since: "1.2.0",
        widget: {type: "pill", options: [{value: "none", label: "无"}, {value: "on-demand", label: "按需"}, {value: "exclusive", label: "独占"}]}

    },
    quickTerminalPosition: {
        default: "top",
        description: "快速终端窗口的位置。\n\n- `top` - 终端显示在屏幕顶部\n- `bottom` - 终端显示在底部\n- `left` - 终端显示在左侧\n- `right` - 终端显示在右侧\n- `center` - 终端显示在中央\n\n在 macOS 上，更改此项需要重启 Ghostty。",
        key: "quick-terminal-position",
        name: "终端位置",
        widget: {type: "dropdown", options: ["top", "right", "bottom", "left", "center"]}

    },
    quickTerminalScreen: {
        default: "main",
        description: "快速终端应显示在哪个屏幕。\n\n- `main` - 操作系统推荐的主屏幕（默认值）\n- `mouse` - 鼠标当前所在的屏幕\n- `macos-menu-bar` - 包含 macOS 菜单栏的屏幕\n\n仅在 macOS 上实现。",
        key: "quick-terminal-screen",
        name: "屏幕位置",
        platform: ["macos"],
        widget: {type: "dropdown", options: ["main", "mouse", "macos-menu-bar"]}

    },
    quickTerminalSize: {
        default: "",
        description: "快速终端的大小。\n\n可指定为屏幕尺寸的百分比（例如 `20%`）或绝对像素值（例如 `300px`），裸数值会被视为配置错误。\n\n只写一个值时，它作用于快速终端的*主轴*：位于顶部或底部时是高度，位于左侧或右侧时是宽度；居中的快速终端则取决于显示器方向（横屏为高度，竖屏为宽度）。\n\n*次轴*对于非居中的快速终端会被最大化，除非再用逗号分隔指定第二个值。百分比与像素可以混用：例如位于顶部的快速终端使用 `50%,500px` 表示半个屏幕高、500 像素宽。",
        key: "quick-terminal-size",
        name: "终端大小",
        note: "格式：<code>50%</code> 或 <code>300px</code>，可用逗号分隔同时指定两个轴。",
        since: "1.2.0",
        widget: {type: "text", placeholder: "例如 50% 或 50%,500px"}

    },
    quickTerminalSpaceBehavior: {
        default: "move",
        description: "在 macOS 空间之间切换时快速终端的行为。\n\n- `move` - 快速终端移动到当前空间（默认值）\n- `remain` - 快速终端停留在原空间\n\n仅在 macOS 上实现。在 Linux 上，行为始终等同于 `move`。",
        key: "quick-terminal-space-behavior",
        name: "macOS 空间行为",
        since: "1.1.0",
        widget: {type: "pill", options: [{value: "move", label: "随空间移动"}, {value: "remain", label: "留在原空间"}]}

    },
    quitAfterLastWindowClosed: {
        default: "false",
        description: "是否在最后一个终端界面关闭后退出。macOS 上默认为 false（macOS 的标准行为），Linux 上默认为 true。在 Linux 上设为 true 时，Ghostty 可通过 `quit-after-last-window-closed-delay` 延迟退出。",
        key: "quit-after-last-window-closed",
        name: "关闭最后一个窗口后退出",
        widget: {type: "switch"}

    },
    quitAfterLastWindowClosedDelay: {
        default: "",
        description: "控制最后一个终端界面关闭后 Ghostty 继续运行多久。仅在 `quit-after-last-window-closed` 为 true 时有效。最小值为 1s。时长格式：数字后跟时间单位（y、d、h、m、s、ms、us、ns）。\n\n仅在 Linux 上实现。",
        key: "quit-after-last-window-closed-delay",
        name: "自动退出前的延迟",
        note: "最后一个窗口关闭后 Ghostty 继续运行多久。留空则立即退出。格式如 <code>5s</code>、<code>500ms</code>。",
        platform: ["linux"],
        widget: {type: "duration", allowEmpty: true}

    },
    resizeOverlay: {
        default: "after-first",
        description: "控制何时显示调整大小浮层。调整大小浮层是在调整窗口大小时短暂显示终端尺寸的弹出层。\n\n- `always` - 始终显示调整大小浮层。\n- `never` - 从不显示调整大小浮层。\n- `after-first` - 首次创建时不显示，但在后续调整大小时显示。",
        key: "resize-overlay",
        name: "显示调整大小浮层",
        widget: {type: "pill", options: [{value: "always", label: "总是"}, {value: "never", label: "从不"}, {value: "after-first", label: "首次之后"}]}

    },
    resizeOverlayDuration: {
        default: "750ms",
        description: "若启用了调整大小浮层，控制浮层在隐藏前可见的时长。默认值为 750ms。时长格式：数字后跟时间单位（y、d、h、m、s、ms、us、ns）。",
        key: "resize-overlay-duration",
        name: "调整大小浮层显示时长",
        note: "调整大小浮层保持可见的时长。格式如 <code>750ms</code>、<code>1s</code>。",
        widget: {type: "duration", allowEmpty: false}

    },
    resizeOverlayPosition: {
        default: "center",
        description: "若启用了调整大小浮层，控制浮层的位置。",
        key: "resize-overlay-position",
        name: "调整大小浮层位置",
        widget: {type: "dropdown", options: ["center", "top-left", "top-center", "top-right", "bottom-left", "bottom-center", "bottom-right"]}

    },
    rightClickAction: {
        default: "context-menu",
        description: "用户在终端界面上右键单击时要执行的操作。\n\n- `context-menu` - 显示上下文菜单（默认值）\n- `paste` - 从剪贴板粘贴\n- `copy` - 复制选中的文本\n- `copy-or-paste` - 若有选区则复制，否则粘贴\n- `ignore` - 不执行任何操作",
        key: "right-click-action",
        name: "右键单击操作",
        widget: {type: "dropdown", options: ["context-menu", "copy-or-paste", "copy", "paste", "ignore"]}

    },
    scrollToBottom: {
        default: "",
        description: "何时将终端界面滚动到底部。逗号分隔的选项列表。添加 `no-` 前缀可禁用。\n\n选项：\n- `keystroke` - 按下向 PTY 发送数据的按键时滚动到底部（默认：开）\n- `output` - 显示新数据时滚动到底部（默认：关）",
        key: "scroll-to-bottom",
        name: "滚动到底部的时机",
        note: "逗号分隔的列表。可用值：keystroke、output。",
        widget: {type: "feature-list", features: [{id: "keystroke", label: "按键时", default: true}, {id: "output", label: "有输出时", default: false}]}

    },
    scrollbackCompression: {
        default: "true",
        description: "是否在终端空闲时压缩回滚缓冲页。\n\nGhostty 仅在空闲时压缩并在需要时解压，因此压缩不会降低 IO 吞吐量。文本较多的历史记录通常可压缩到其未压缩页内存的 10%–30%，使已压缩页的物理内存减少 70%–90%。\n\n无论此设置如何，回滚缓冲上限始终是未压缩的逻辑上限，因此禁用压缩可能增加物理内存占用，但不会改变保留的历史记录量。\n\n在运行时更改此项仅影响后续的压缩工作。",
        key: "scrollback-compression",
        name: "空闲时压缩回滚缓冲",
        note: "在保持相同回滚缓冲历史记录的同时减少物理内存占用。",
        since: "1.4.0",
        widget: {type: "switch"}

    },
    scrollbackLimitBytes: {
        default: "50000000",
        description: "回滚缓冲的大小，单位为字节。这还包括活动屏幕。达到上限时，最旧的行会被移除。回滚缓冲完全存在于内存中，并按需分配。按终端界面计算，而非整个应用。\n\n此上限始终衡量未压缩的逻辑大小。可通过 `scrollback-limit-lines` 设置单独的最大值；若两者都设置，则先达到的那个会裁剪回滚缓冲。",
        key: "scrollback-limit-bytes",
        name: "回滚缓冲大小（字节）",
        note: "此缓冲完全存在于内存中，但按需分配。取代旧的 <code>scrollback-limit</code> 键。",
        since: "1.4.0",
        widget: {type: "number", min: 0, size: 11}

    },
    scrollbackLimitLines: {
        default: "unlimited",
        description: "要保留的回滚缓冲最大行数。此值不包含活动屏幕。软换行计为多行。\n\n此上限是估算值：Ghostty 只会按内部页面分配单位裁剪行，因此实际可能保留略多于上限的行。\n\n默认值为 `unlimited`。可通过 `scrollback-limit-bytes` 单独设置一个最大值；若两者都设置，则以先达到者为准裁剪回滚缓冲。此值可在运行时更改，但仅影响新的终端界面。",
        key: "scrollback-limit-lines",
        name: "回滚缓冲行数上限",
        note: "接受行数或 <code>unlimited</code>。",
        since: "1.4.0",
        widget: {type: "text", placeholder: "unlimited"}

    },
    scrollbar: {
        default: "system",
        description: "控制滚动条的显示时机。\n\n- `system` - 遵循系统设置决定何时显示滚动条。\n- `never` - 从不显示滚动条。\n\n目前仅在 macOS 上受支持。GTK 尚不支持滚动条。",
        key: "scrollbar",
        name: "滚动条可见性",
        note: "目前仅在 macOS 上受支持。",
        platform: ["macos"],
        widget: {type: "pill", options: [{value: "system", label: "跟随系统"}, {value: "never", label: "从不"}]}

    },
    searchBackground: {
        default: "#ffe082",
        description: "非聚焦（候选）搜索匹配项的背景色。有效值：十六进制颜色、具名 X11 颜色、`cell-foreground` 或 `cell-background`。默认值为金黄色。",
        key: "search-background",
        name: "搜索匹配项背景",
        note: "非聚焦（候选）搜索匹配项的背景色。默认为金黄色（#ffe082）。也接受 `cell-foreground` 或 `cell-background`。",
        widget: {type: "color"}

    },
    searchForeground: {
        default: "#000000",
        description: "非聚焦（候选）搜索匹配项的前景色。有效值：十六进制颜色、具名 X11 颜色、`cell-foreground` 或 `cell-background`。默认值为黑色。",
        key: "search-foreground",
        name: "搜索匹配项前景",
        note: "非聚焦（候选）搜索匹配项的前景色。也接受 `cell-foreground` 或 `cell-background`。",
        widget: {type: "color"}

    },
    searchSelectedBackground: {
        default: "#f2a57e",
        description: "当前选中（聚焦）的搜索匹配项的背景色。默认为柔和的桃色（`#f2a57e`）。",
        key: "search-selected-background",
        name: "选中匹配项背景",
        note: "当前活动/聚焦的搜索匹配项的背景色。默认为柔和的桃色（#f2a57e）。",
        widget: {type: "color"}

    },
    searchSelectedForeground: {
        default: "#000000",
        description: "当前选中（聚焦）的搜索匹配项的前景色。默认值为黑色。",
        key: "search-selected-foreground",
        name: "选中匹配项前景",
        note: "当前活动/聚焦的搜索匹配项的前景色。",
        widget: {type: "color"}

    },
    selectionBackground: {
        default: "",
        description: "选区的背景色。若未设置，选区颜色为窗口背景/前景色的反转。以十六进制或具名 X11 颜色指定。自 1.2.0 起，可设置为 `cell-foreground` 或 `cell-background`。",
        key: "selection-background",
        name: "选区背景",
        widget: {type: "custom-color", presets: [{value: "cell-foreground", label: "单元格前景"}, {value: "cell-background", label: "单元格背景"}]}

    },
    selectionClearOnCopy: {
        default: "false",
        description: "是否在复制后清除选中的文本。为 true 时，任意 `copy_to_clipboard` 快捷键操作后选区将自动清除。不适用于 `copy-on-select` 触发的复制。",
        key: "selection-clear-on-copy",
        name: "复制后清除选区",
        widget: {type: "switch"}

    },
    selectionClearOnTyping: {
        default: "true",
        description: "是否在输入时清除选中的文本。为 false 时，输入时不会清除选中的文本。仍可通过单击一次或按 `escape` 手动清除选区。",
        key: "selection-clear-on-typing",
        name: "输入时清除选区",
        since: "1.2.0",
        widget: {type: "switch"}

    },
    selectionForeground: {
        default: "",
        description: "选区的前景色。若未设置，选区颜色为窗口背景/前景色的反转。以十六进制或具名 X11 颜色指定。自 1.2.0 起，可设置为 `cell-foreground` 或 `cell-background`。",
        key: "selection-foreground",
        name: "选区前景",
        widget: {type: "custom-color", presets: [{value: "cell-foreground", label: "单元格前景"}, {value: "cell-background", label: "单元格背景"}]}

    },
    selectionWordChars: {
        default: " \t'\"│`|:;,()[]{}<>$",
        description: "在文本选择（例如双击）时用于标记单词边界的字符。选择单词时，选区会在遇到其中任一字符时停止。\n\n每个字符都会成为一个单词边界。空字符（U+0000）始终被视为边界。",
        key: "selection-word-chars",
        name: "选词边界字符",
        note: "每个字符都是选区停止的独立边界，而非模式或正则表达式。",
        since: "1.3.0"

    },
    shellIntegration: {
        default: "detect",
        description: "是否启用 Shell 集成自动注入。\n\n- `none` - 禁用 Shell 集成\n- `detect` - 自动检测 Shell 并在受支持时注入（默认值）\n- `bash`、`elvish`、`fish`、`nushell`、`zsh` - 使用特定的 Shell 集成方案",
        key: "shell-integration",
        name: "Shell 集成方式",
        widget: {type: "dropdown", options: ["none", "detect", "bash", "elvish", "fish", "nushell", "zsh"]}

    },
    shellIntegrationFeatures: {
        default: "",
        description: "要启用的 Shell 集成功能。逗号分隔列表。加上 `no-` 前缀可禁用。使用 `true`/`false` 可开启或关闭所有功能。\n\n功能：\n- `cursor` - 在提示符处将光标设为竖线（默认值：开启）\n- `sudo` - 设置 sudo 包装器以保留 terminfo（默认值：关闭）\n- `title` - 通过 Shell 集成设置窗口标题（默认值：开启）\n- `ssh-env` - SSH 环境变量兼容：将 TERM 转换为 xterm-256color 并传播 COLORTERM（默认值：关闭，自 1.2.0 起）\n- `ssh-terminfo` - 在远程主机上自动安装 terminfo（默认值：关闭，自 1.2.0 起）\n- `path` - 将 Ghostty 的二进制目录添加到 PATH（默认值：开启）",
        key: "shell-integration-features",
        name: "Shell 集成功能",
        note: "可用功能：cursor、sudo、title、ssh-env、ssh-terminfo、path。包含某项即强制启用，加上 <code>no-</code> 前缀即强制禁用，省略则回退到默认值。",
        widget: {type: "feature-list", features: [{id: "cursor", label: "光标", default: true}, {id: "sudo", label: "Sudo", default: false}, {id: "title", label: "标题", default: true}, {id: "ssh-env", label: "SSH 环境变量", default: false}, {id: "ssh-terminfo", label: "SSH terminfo", default: false}, {id: "path", label: "路径", default: true}]}

    },
    splitDividerColor: {
        default: "",
        description: "分屏分隔线的颜色。若未设置，将自动选择默认值。以十六进制或具名 X11 颜色指定。",
        key: "split-divider-color",
        name: "分屏分隔线颜色",
        since: "1.1.0",
        widget: {type: "color"}

    },
    splitInheritWorkingDirectory: {
        default: "true",
        description: "如果为 true，新的分屏窗格将继承此前聚焦的分屏的工作目录。若此前没有聚焦的分屏，则使用 `working-directory` 选项。",
        key: "split-inherit-working-directory",
        name: "分屏继承工作目录",
        widget: {type: "switch"}

    },
    splitPreserveZoom: {
        default: "false",
        description: "控制 Ghostty 何时保持分屏的缩放状态。通常，任何改变分屏树焦点或布局的操作都会取消任意分屏的缩放。\n\n设置为 `navigation` 时，在导航到其他分屏（例如通过 `goto_split`）时保持缩放的分屏状态。加 `no-` 前缀可禁用。\n\n示例：`split-preserve-zoom = navigation`",
        key: "split-preserve-zoom",
        name: "导航时保持分屏缩放",
        note: "在分屏间导航时保持缩放状态。",
        since: "1.3.0",
        widget: {type: "switch"}

    },
    tabInheritWorkingDirectory: {
        default: "true",
        description: "如果为 true，新的标签页将继承此前聚焦的标签页的工作目录。若此前没有聚焦的标签页，则使用 `working-directory` 选项。",
        key: "tab-inherit-working-directory",
        name: "标签页继承工作目录",
        widget: {type: "switch"}

    },
    term: {
        default: "xterm-ghostty",
        description: "TERM 环境变量要设置的值。",
        key: "term",
        name: "TERM 环境变量"

    },
    theme: {
        default: "",
        description: "要使用的主题。可以是内置主题名、自定义主题名，或自定义主题文件的绝对路径。\n\n为浅色/深色模式分别指定不同主题：`light:theme-name,dark:theme-name`。\n\n要查看可用主题，运行 `ghostty +list-themes`。",
        key: "theme",
        name: "配色主题",
        note: "设置此项后所选的任何颜色都会覆盖该主题的颜色。",
        widget: {type: "theme", options: themeOptions}

    },
    title: {
        default: "",
        description: "Ghostty 用于窗口的标题。始终强制使用该标题；Ghostty 将忽略程序发送的设置标题转义序列。要使用空白标题，请将其设置为一个或多个空格（需加引号）。",
        key: "title",
        name: "所有窗口的固定标题"

    },
    titleReport: {
        default: "false",
        description: "启用或禁用标题上报（CSI 21 t）。允许运行中的程序查询终端标题。\n\n警告：这最多会泄露敏感信息，最坏情况下可导致任意代码执行。",
        key: "title-report",
        name: "CSI 21 标题上报",
        note: "这允许运行中的程序读取终端标题。",
        since: "1.0.1",
        widget: {type: "switch"}

    },
    undoTimeout: {
        default: "5s",
        description: "撤销操作可用的持续时间。默认值为 5 秒。时长格式：数字后跟时间单位（y、d、h、m、s、ms、us、ns）。\n\n超时为零实际上会禁用撤销。仅在 macOS 上受支持。",
        key: "undo-timeout",
        name: "撤销超时",
        note: "撤销操作的超时时间。格式如 <code>1h30m</code>、<code>5s</code>、<code>500ms</code>。",
        platform: ["macos"],
        since: "1.2.0",
        widget: {type: "duration", allowEmpty: false}

    },
    unfocusedSplitFill: {
        default: "",
        description: "用于使非聚焦分屏变暗的颜色。非聚焦分屏通过在分屏上渲染半透明矩形来变暗。默认值为背景色。以十六进制或具名 X11 颜色指定。",
        key: "unfocused-split-fill",
        name: "非聚焦分屏填充色",
        widget: {type: "color"}

    },
    unfocusedSplitOpacity: {
        default: "0.7",
        description: "非聚焦分屏的不透明度。非聚焦分屏会略微淡化，以便更容易看出哪个分屏处于聚焦状态。要禁用此功能，请设置为 1。取值范围限制为 [0.15, 1]。",
        key: "unfocused-split-opacity",
        name: "非聚焦分屏不透明度",
        widget: {type: "range", min: 0.15, max: 1, step: 0.01}

    },
    vtKamAllowed: {
        default: "false",
        description: "如果为 true，允许在终端内使用 'KAM' 模式（ANSI mode 2）。KAM 会在应用程序请求时禁用键盘输入。不常见，也不推荐。",
        key: "vt-kam-allowed",
        name: "允许 VT kam 模式",
        note: "如果不知道这是什么，请不要修改！",
        widget: {type: "switch"}

    },
    vtWindowResizeAllowed: {
        default: "false",
        description: "如果为 true，允许运行中的程序使用 xterm 的 `CSI 8 ; rows ; columns t` 转义序列调整窗口大小。小于 40 列 × 10 行的尺寸会被提升到该尺寸。\n\n若终端位于分屏中、位于含多个标签页的窗口中、属于快速终端，或窗口大小由窗口管理器控制，则该请求会被忽略。\n\n默认禁用，因为它允许任何程序（包括在远程机器上运行的程序）更改窗口大小。",
        key: "vt-window-resize-allowed",
        name: "允许程序调整窗口大小",
        note: "允许程序（包括远程程序）调整窗口大小。",
        since: "1.4.0",
        widget: {type: "switch"}

    },
    vtXtChecksumExtension: {
        default: "negate,attributes,trim,no-undrawn,no-full",
        description: "DECRQCRA 上报的校验和的计算方式。这是重置后使用的计算方式，类似于 xterm 的 `checksumExtension` 资源。程序可通过 XTCHECKSUM（`CSI Ps # y`）更改，直到下一次重置。默认值与真实的 DEC 终端一致。\n\n- `negate` - 上报取反后的和，与 DEC 终端一致。\n- `attributes` - 为每个单元格加上粗体、下划线、闪烁、反显、隐藏和保护属性。\n- `trim` - 除区域第一个单元格外，省略普通空格。\n- `undrawn` - 将从未写入的单元格按空格计数，而非跳过。\n- `full` - 使用每个单元格的完整码点，而非 DEC 8 位值。\n\n在值前加 `no-` 可禁用该项。",
        key: "vt-xt-checksum-extension",
        name: "DECRQCRA 校验和计算",
        note: "逗号分隔列表；在值前加 <code>no-</code> 可禁用该项。",
        since: "1.4.0",
        widget: {type: "feature-list", features: [{id: "negate", label: "取负", default: true, description: "Report the negated sum, like DEC terminals."}, {id: "attributes", label: "属性", default: true, description: "Include bold, underline, blink, inverse, invisible and protected attributes."}, {id: "trim", label: "去除空格", default: true, description: "Omit plain spaces except the first cell of the area."}, {id: "undrawn", label: "未写入", default: false, description: "Count never-written cells as spaces."}, {id: "full", label: "完整", default: false, description: "Use the full codepoint instead of the DEC 8-bit value."}]}

    },
    vtXtChecksumReport: {
        default: "false",
        description: "启用校验和上报（DECRQCRA，`CSI Pi ; Pg ; Pt ; Pl ; Pb ; Pr * y`）。这允许运行中的程序请求屏幕上某区域的校验和；终端测试套件用它来检查屏幕内容。\n\n默认禁用，原因是程序可以一次读取一个单元格，从而读回屏幕上的所有内容，包括其他程序的输出。禁用期间，XTCHECKSUM 也会被忽略。",
        key: "vt-xt-checksum-report",
        name: "允许 DECRQCRA 校验和上报",
        note: "允许程序逐单元格读回屏幕内容。",
        since: "1.4.0",
        widget: {type: "switch"}

    },
    waitAfterCommand: {
        default: "false",
        description: "如果为 true，命令退出后保持终端打开，直到接收到任意按键。主要适用于脚本或调试。",
        key: "wait-after-command",
        name: "命令结束后等待输入",
        widget: {type: "switch"}

    },
    windowColorspace: {
        default: "srgb",
        description: "解释终端颜色时使用的色彩空间。\n\n- `srgb` - 在 sRGB 色彩空间中解释颜色（默认值）。\n- `display-p3` - 在 Display P3 色彩空间中解释颜色。\n\n目前仅在 macOS 上受支持。",
        key: "window-colorspace",
        name: "窗口色彩空间",
        platform: ["macos"],
        widget: {type: "pill", options: [{value: "srgb", label: "sRGB"}, {value: "display-p3", label: "Display P3"}]}

    },
    windowDecoration: {
        default: "auto",
        description: "配置窗口装饰的偏好。\n\n- `none` - 禁用所有窗口装饰（标题栏、边框）。在 macOS 上还会禁用标签页。\n- `auto` - 根据操作系统/桌面环境自动使用客户端或服务端装饰。\n- `client` - 优先使用客户端装饰。（自 1.1.0 起）\n- `server` - 优先使用服务端装饰（仅限 Linux GTK）。（自 1.1.0 起）\n\n也接受布尔值 `true`（= auto）和 `false`（= none）。",
        key: "window-decoration",
        name: "窗口装饰",
        widget: {type: "dropdown", options: ["auto", "none", "client", "server"]}

    },
    windowHeight: {
        default: "",
        description: "初始窗口高度，以终端网格单元格为单位。必须同时设置 `window-height` 和 `window-width` 才会生效。不允许小于 4 的值。设置为 0 时使用应用运行时默认值。",
        key: "window-height",
        name: "初始窗口高度",
        note: "此尺寸不是以像素为单位，而是终端网格单元格的数量",
        widget: {type: "number", min: 4, step: 1, size: 4, placeholder: "例如 24"}

    },
    windowInheritFontSize: {
        default: "true",
        description: "如果为 true，新窗口和标签页将继承此前聚焦的窗口的字体大小。如果为 false，则使用 `font-size` 中的默认字体大小。",
        key: "window-inherit-font-size",
        name: "继承字体大小",
        widget: {type: "switch"}

    },
    windowInheritWorkingDirectory: {
        default: "true",
        description: "如果为 true，新窗口将继承此前聚焦的窗口的工作目录。若此前没有聚焦的窗口，则使用 `working-directory` 选项。",
        key: "window-inherit-working-directory",
        name: "继承工作目录",
        widget: {type: "switch"}

    },
    windowNewTabPosition: {
        default: "current",
        description: "创建新标签页的位置。\n\n- `current` - 插入到当前聚焦的标签页之后；若无聚焦的标签页，则插入到末尾。\n- `end` - 插入到标签页列表末尾。",
        key: "window-new-tab-position",
        name: "新标签页位置",
        widget: {type: "pill", options: [{value: "current", label: "当前"}, {value: "end", label: "末尾"}]}

    },
    windowPaddingBalance: {
        default: "false",
        description: "如果为 true，视口中无法被单元格尺寸整除的多余内边距会自动在四条边之间平衡。其他 `window-padding` 选项会先应用。",
        key: "window-padding-balance",
        name: "自动平衡窗口内边距",
        note: "仅将剩余空间均匀分配到四条边。在水平/垂直内边距之后应用，而非替代它们。",
        widget: {type: "switch"}

    },
    windowPaddingColor: {
        default: "background",
        description: "窗口内边距区域的颜色。\n\n- `background` - 使用 `background` 中指定的背景色\n- `extend` - 延伸最近网格单元格的背景色（附启发式规则）\n- `extend-always` - 与 `extend` 相同，但始终延伸，不应用启发式规则",
        key: "window-padding-color",
        name: "窗口内边距颜色",
        widget: {type: "dropdown", options: ["background", "extend", "extend-always"]}

    },
    windowPaddingX: {
        default: "2",
        description: "终端单元格与窗口左右边框之间的水平内边距。单位为点（按 DPI 缩放）。可用逗号分隔的两个值分别指定左/右内边距：`window-padding-x = 2,4`。",
        key: "window-padding-x",
        name: "水平窗口内边距",
        widget: {type: "dual-number", labels: ["Left", "Right"], min: 0}

    },
    windowPaddingY: {
        default: "2",
        description: "终端单元格与窗口上下边框之间的垂直内边距。单位为点（按 DPI 缩放）。可用逗号分隔的两个值分别指定上/下内边距：`window-padding-y = 2,4`。",
        key: "window-padding-y",
        name: "垂直窗口内边距",
        widget: {type: "dual-number", labels: ["Top", "Bottom"], min: 0}

    },
    windowPositionX: {
        default: "",
        description: "窗口起始 X 位置，以像素为单位，相对于主显示器左上角。必须同时设置 x 和 y 才会生效。注意：仅在 macOS 上受支持；GTK 不支持设置窗口位置。",
        key: "window-position-x",
        name: "初始窗口 X 坐标",
        note: "相对于屏幕左上角的像素位置",
        platform: ["macos"],
        widget: {type: "number", step: 1, size: 4, placeholder: "例如 0"}

    },
    windowPositionY: {
        default: "",
        description: "窗口起始 Y 位置，以像素为单位，相对于主显示器左上角。在 macOS 上，相对于可见屏幕区域的左上角。必须同时设置 x 和 y 才会生效。",
        key: "window-position-y",
        name: "初始窗口 Y 坐标",
        note: "相对于屏幕左上角的像素位置",
        platform: ["macos"],
        widget: {type: "number", step: 1, size: 4, placeholder: "例如 0"}

    },
    windowSaveState: {
        default: "default",
        description: "是否启用窗口状态的保存与恢复（位置、大小、标签页、分屏等）。\n\n- `default` - 使用系统默认行为（macOS：仅在强制终止或系统范围内已配置时才保存）。\n- `never` - 从不保存窗口状态。\n- `always` - 退出时始终保存窗口状态。\n\n目前仅在 macOS 上受支持。",
        key: "window-save-state",
        name: "保存窗口状态",
        platform: ["macos"],
        widget: {type: "pill", options: [{value: "default", label: "默认"}, {value: "never", label: "从不"}, {value: "always", label: "总是"}]}

    },
    windowShowTabBar: {
        default: "auto",
        description: "是否显示标签栏。\n\n- `always` - 始终显示标签栏，即使只有一个标签页。（自 1.2.0 起）\n- `auto` - 仅在有两个或更多标签页时显示标签栏。\n- `never` - 从不显示标签栏。可通过标签页概览或快捷键访问标签页。\n\n目前仅在 Linux（GTK）上受支持。",
        key: "window-show-tab-bar",
        name: "显示标签栏",
        platform: ["gtk"],
        widget: {type: "pill", options: [{value: "always", label: "总是"}, {value: "auto", label: "自动"}, {value: "never", label: "从不"}]}

    },
    windowStepResize: {
        default: "false",
        description: "以当前聚焦终端界面的单元格尺寸为增量调整窗口大小。若禁用，则终端界面按像素增量调整大小。目前仅在 macOS 上受支持。",
        key: "window-step-resize",
        name: "按网格单元格调整大小",
        platform: ["macos"],
        widget: {type: "switch"}

    },
    windowSubtitle: {
        default: "false",
        description: "显示在窗口副标题中的文本。\n\n- `false` - 禁用副标题\n- `working-directory` - 将副标题设置为工作目录\n\n仅在 GTK 上受支持。",
        key: "window-subtitle",
        name: "窗口副标题",
        platform: ["gtk"],
        since: "1.1.0",
        widget: {type: "dropdown", options: ["false", "working-directory"]}

    },
    windowTheme: {
        default: "auto",
        description: "用于窗口的主题。\n\n- `auto` - 根据终端背景色决定。若主题有独立的浅色/深色主题，则行为与 `system` 相同。\n- `system` - 使用系统主题。\n- `light` - 无论系统主题如何都使用浅色主题。\n- `dark` - 无论系统主题如何都使用深色主题。\n- `ghostty` - 使用 Ghostty 配置中的背景/前景色（仅 Linux 构建）。\n\n目前仅在 macOS 和 Linux 上受支持。",
        key: "window-theme",
        name: "窗口主题",
        widget: {type: "dropdown", options: ["auto", "system", "light", "dark", "ghostty"]}

    },
    windowTitleFontFamily: {
        default: "",
        description: "用于应用程序窗口和标签页标题的字体。若未设置，则使用系统默认字体。不必是等宽字体。",
        key: "window-title-font-family",
        name: "窗口标题字体",
        since: "1.0.0"

    },
    windowTitlebarBackground: {
        default: "",
        description: "窗口标题栏的背景色。仅当 `window-theme` 设置为 `ghostty` 时生效。目前仅在 GTK 应用运行时中受支持。以十六进制或具名 X11 颜色指定。",
        key: "window-titlebar-background",
        name: "标题栏背景",
        platform: ["gtk"],
        widget: {type: "color"}

    },
    windowTitlebarForeground: {
        default: "",
        description: "窗口标题栏的前景色。仅当 `window-theme` 设置为 `ghostty` 时生效。目前仅在 GTK 应用运行时中受支持。以十六进制或具名 X11 颜色指定。",
        key: "window-titlebar-foreground",
        name: "标题栏前景",
        platform: ["gtk"],
        widget: {type: "color"}

    },
    windowVsync: {
        default: "true",
        description: "将渲染与屏幕刷新率同步。如果为 true，可最大限度减少撕裂并使重绘与屏幕对齐，但可能导致输入延迟。默认为 true，因为在 macOS 上不同步渲染可能导致内核崩溃（macOS 14.4+）。目前仅在 macOS 上受支持。",
        key: "window-vsync",
        name: "启用垂直同步",
        platform: ["macos"],
        widget: {type: "switch"}

    },
    windowWidth: {
        default: "",
        description: "初始窗口宽度，以终端网格单元格为单位。必须同时设置 `window-height` 和 `window-width` 才会生效。不允许小于 10 的值。设置为 0 时使用应用运行时默认值。",
        key: "window-width",
        name: "初始窗口宽度",
        note: "此尺寸不是以像素为单位，而是终端网格单元格的数量",
        widget: {type: "number", min: 10, step: 1, size: 4, placeholder: "例如 80"}

    },
    workingDirectory: {
        default: "",
        description: "启动命令后要切换到的目录。其优先级低于 `window-inherit-working-directory`。特殊值：\n- `home` - 用户主目录\n- `inherit` - 启动进程的工作目录\n\n在 macOS 上，若从 launchd/open 启动，默认为 `home`。在 GTK 上，若从桌面启动器启动，默认为 `home`。",
        key: "working-directory",
        name: "启动后使用的目录",
        note: "此处也允许使用特殊值 <code>home</code> 和 <code>inherit</code>。"

    },
    x11InstanceName: {
        default: "",
        description: "在 X11 下运行时，控制 WM_CLASS X11 属性的实例名字段。默认值为 `ghostty`。",
        key: "x11-instance-name",
        name: "WM_CLASS 实例名",
        note: "此值默认为 <code>ghostty</code>",
        platform: ["gtk-x11"]

    },
} satisfies SettingsRegistry;

export default registry;

export type SettingKeys = keyof typeof registry;

export type SettingDefaults = {
    [K in SettingKeys]: typeof registry[K]["default"]
};

// The one value-shape distinction that survives: `repeatable` entries hold string[], the
// rest hold a plain string. `repeatable?: true` is a literal on SettingInfo so `satisfies`
// preserves it here (no more TypeToValue mapping off a `type` discriminant).
export type SettingValues = {
    [K in SettingKeys]: typeof registry[K] extends {repeatable: true;} ? string[] : string
};

// Dev-time invariants the type system can't express because `default` stays widened to
// `string` (initializers may reassign it at runtime):
// - option-backed widgets must include their own (non-empty) default among their options,
//   so an upstream enum rename/typo fails loudly at startup instead of rendering a
//   dropdown/pill that silently can't represent the default state;
// - durations follow the AGENTS.md convention: unset default ("") ⟺ `allowEmpty`.
export function validateRegistry() {
    for (const [id, setting] of Object.entries(registry) as Array<[string, SettingInfo]>) {
        const widget = setting.widget;
        if (!widget) continue;
        if (widget.type === "dropdown" || widget.type === "pill" || widget.type === "theme") {
            const def = setting.default;
            if (typeof def === "string" && def !== "") {
                const values = widget.options.map(o => typeof o === "string" ? o : o.value);
                if (!values.includes(def)) {
                    throw new Error(`Setting "${id}": default "${def}" is not among its ${widget.type} options`);
                }
            }
        }
        if (widget.type === "duration" && (widget.allowEmpty ?? false) !== (setting.default === "")) {
            throw new Error(`Setting "${id}": duration \`allowEmpty\` must match whether the default is unset ("")`);
        }
    }
}

if (dev) validateRegistry();
