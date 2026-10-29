import application from "#lib/images/tabs/application.webp";
import terminal from "#lib/images/tabs/terminal.webp"; // placeholder
import clipboard from "#lib/images/tabs/clipboard.webp";
import window from "#lib/images/tabs/window.webp";

import colors from "#lib/images/tabs/colors.webp";
import fonts from "#lib/images/tabs/fonts.webp";

import keybinds from "#lib/images/tabs/keybinds.webp";
import mouse from "#lib/images/tabs/mouse.webp";

import gtk from "#lib/images/tabs/gtk.svg";
import linux from "#lib/images/tabs/linux.webp";
import macos from "#lib/images/tabs/macos.webp";

import {registry} from "./registry";
import type {PreviewKey} from "./types";
import {dev} from "$app/env";

/* eslint quote-props: ["error", "consistent-as-needed", {"keywords": false}] */

interface NavGroup {
    id: string;
    name: string;
    note?: string;
    // Key into the renderer-side `previews` map. A string-union type (not a `Component` ref),
    // so navigation.ts stays pure data while the key stays checked against the map.
    preview?: PreviewKey;
    // Placement only, everything about a setting (widget included) lives on its registry entry.
    settings: Array<keyof typeof registry>;
}

interface NavPanel {
    id: string;
    icon: string;
    name: string;
    note?: string;
    groups?: NavGroup[];
    pages?: NavPanel[];
}

export const navigation = [
    {
        id: "application",
        icon: application,
        name: "应用",
        groups: [
            {
                id: "main",
                name: "",
                settings: [
                    "title",
                    "desktopNotifications",
                    "configFile",
                    "configDefaultFiles",
                    "linkUrl",
                    "linkPreviews",
                    "linkOsc8",
                    "undoTimeout"
                ]
            },
            {
                id: "bell",
                name: "响铃",
                settings: [
                    "bellFeatures",
                    "bellAudioPath",
                    "bellAudioVolume"
                ]
            },
            {
                id: "startup",
                name: "启动",
                settings: [
                    "command",
                    "initialCommand",
                    "env",
                    "input",
                    "maximize",
                    "fullscreen",
                    "initialWindow",
                    "workingDirectory"
                ]
            },
            {
                id: "shutdown",
                name: "退出",
                settings: [
                    "waitAfterCommand",
                    "abnormalCommandExitRuntime",
                    "confirmCloseSurface",
                    "quitAfterLastWindowClosed",
                    "quitAfterLastWindowClosedDelay"
                ]
            },
            {
                id: "quickTerminal",
                name: "快速终端",
                settings: [
                    "quickTerminalPosition",
                    "quickTerminalSize",
                    "quickTerminalScreen",
                    "quickTerminalAnimationDuration",
                    "quickTerminalAutohide",
                    "quickTerminalSpaceBehavior",
                    "quickTerminalKeyboardInteractivity"
                ]
            }
        ]
    },
    {
        id: "terminal",
        icon: terminal, // TODO: replace
        name: "终端",
        groups: [
            {
                id: "shell",
                name: "",
                settings: [
                    "shellIntegration",
                    "shellIntegrationFeatures",
                    "term",
                    "titleReport"
                ]
            },
            {
                id: "keyboard",
                name: "键盘",
                settings: [
                    "keyRemap"
                ]
            },
            {
                id: "notifications",
                name: "命令通知",
                settings: [
                    "notifyOnCommandFinish",
                    "notifyOnCommandFinishAction",
                    "notifyOnCommandFinishAfter"
                ]
            },
            {
                id: "display",
                name: "显示",
                settings: [
                    "scrollbackLimitBytes",
                    "scrollbackLimitLines",
                    "scrollbackCompression",
                    "scrollToBottom",
                    "imageStorageLimit",
                    "progressStyle",
                    "customShader",
                    "customShaderAnimation"
                ]
            },
            {
                id: "compatibility",
                name: "协议与兼容性",
                note: "这些设置控制底层终端协议行为，不了解用途时请勿修改。",
                settings: [
                    "oscColorReportFormat",
                    "enquiryResponse",
                    "vtKamAllowed",
                    "vtWindowResizeAllowed",
                    "vtXtChecksumReport",
                    "vtXtChecksumExtension"
                ]
            }
        ]
    },
    {
        id: "clipboard",
        icon: clipboard,
        name: "剪贴板",
        groups: [
            {
                id: "main",
                name: "",
                settings: [
                    "clipboardRead",
                    "clipboardWrite",
                    "clipboardWriteLimitBytes",
                    "copyOnSelect",
                    "clipboardTrimTrailingSpaces",
                    "clipboardCodepointMap",
                    "clipboardPasteProtection",
                    "clipboardPasteBracketedSafe"
                ]
            }
        ]
    },
    {
        id: "window",
        icon: window,
        name: "窗口",
        groups: [
            {
                id: "main",
                name: "",
                settings: [
                    "windowTitleFontFamily",
                    "windowSubtitle",
                    "windowVsync",
                    "windowInheritWorkingDirectory",
                    "tabInheritWorkingDirectory",
                    "splitInheritWorkingDirectory",
                    "windowInheritFontSize",
                    "windowColorspace",
                    "windowSaveState",
                    "windowShowTabBar",
                    "windowNewTabPosition"
                ]
            },
            {
                id: "appearance",
                name: "外观",
                settings: [
                    "windowTheme",
                    "windowDecoration",
                    "windowPaddingX",
                    "windowPaddingY",
                    "windowPaddingBalance",
                    "windowPaddingColor",
                    "windowTitlebarBackground",
                    "windowTitlebarForeground",
                    "backgroundOpacity",
                    "backgroundOpacityCells",
                    "backgroundBlur",
                    "backgroundImage",
                    "backgroundImageOpacity",
                    "backgroundImagePosition",
                    "backgroundImageFit",
                    "backgroundImageRepeat",
                    "scrollbar",
                    "unfocusedSplitOpacity",
                    "unfocusedSplitFill",
                    "splitDividerColor",
                    "splitPreserveZoom",
                    "dragHandle"
                ]
            },
            {
                id: "resize",
                name: "尺寸与缩放",
                settings: [
                    "windowHeight",
                    "windowWidth",
                    "windowPositionY",
                    "windowPositionX",
                    "windowStepResize",
                    "resizeOverlay",
                    "resizeOverlayPosition",
                    "resizeOverlayDuration"
                ]
            }
        ]
    },
    {
        id: "colors",
        icon: colors,
        name: "颜色",
        groups: [
            {
                id: "general",
                name: "",
                settings: [
                    "theme",
                    "boldColor",
                    "faintOpacity",
                    "minimumContrast",
                    "paletteGenerate",
                    "paletteHarmonious"
                ]
            },
            {
                id: "base",
                name: "基础颜色",
                note: "此处的预览会在命令输出的第二行展示选中文本的效果。",
                preview: "baseColor",
                settings: [
                    "background",
                    "foreground",
                    "selectionBackground",
                    "selectionForeground",
                    "selectionClearOnTyping",
                    "selectionClearOnCopy",
                    "selectionWordChars"
                ]
            },
            {
                id: "search",
                name: "搜索颜色",
                settings: [
                    "searchForeground",
                    "searchBackground",
                    "searchSelectedForeground",
                    "searchSelectedBackground"
                ]
            },
            {
                id: "cursor",
                name: "光标",
                note: "预览中的光标以 1 秒为间隔闪烁，仅用于强调，可能与 Ghostty 中的实际效果不一致。",
                preview: "cursor",
                settings: [
                    "cursorColor",
                    "cursorText",
                    "cursorOpacity",
                    "cursorStyle",
                    "cursorStyleBlink"
                ]
            },
            {
                id: "palette",
                name: "调色板",
                note: "前 16 种颜色是终端中最常显示的颜色。\n\n1-8 通常为黑、红、绿、黄、蓝、品红、青、白。\n9-16 通常是这些颜色的\"较亮\"变体。",
                preview: "palette",
                settings: [
                    "palette"
                ]
            }
        ]
    },
    {
        id: "fonts",
        icon: fonts,
        name: "字体",
        groups: [
            {
                id: "general",
                name: "",
                settings: [
                    "fontSize",
                    "fontThicken",
                    "fontThickenStrength",
                    "fontShapingBreak",
                    "fontFeature",
                    "fontSyntheticStyle",
                    "alphaBlending",
                    "graphemeWidthMethod",
                    "freetypeLoadFlags"
                ]
            },
            {
                id: "family",
                name: "字体族",
                note: "Ghostty 默认内置并使用 JetBrainsMono Nerd Font，无需在系统里安装或在配置中指定。",
                settings: [
                    "fontFamily",
                    "fontFamilyBold",
                    "fontFamilyItalic",
                    "fontFamilyBoldItalic",
                    "fontCodepointMap"
                ]
            },
            {
                id: "styles",
                name: "字体样式",
                note: "为上方各项指定具名字体样式。例如字体为 <code>Ioveska Heavy</code> 时，样式填 <code>Heavy</code>。也可以把样式设为 <code>false</code> 完全禁用该样式，回退到默认样式。",
                settings: [
                    "fontStyle",
                    "fontStyleBold",
                    "fontStyleItalic",
                    "fontStyleBoldItalic"
                ]
            },
            {
                id: "variations",
                name: "字体变体",
                note: "可变字体专用设置，不了解时请勿修改！",
                settings: [
                    "fontVariation",
                    "fontVariationBold",
                    "fontVariationItalic",
                    "fontVariationBoldItalic"
                ]
            },
            {
                id: "advanced",
                name: "度量微调",
                note: "以像素或百分比微调单元格与字形度量。Ghostty 对这类值几乎不做校验，改错会让终端无法使用，请谨慎调整。",
                settings: [
                    "adjustCellWidth",
                    "adjustCellHeight",
                    "adjustFontBaseline",
                    "adjustUnderlinePosition",
                    "adjustUnderlineThickness",
                    "adjustStrikethroughPosition",
                    "adjustStrikethroughThickness",
                    "adjustOverlinePosition",
                    "adjustOverlineThickness",
                    "adjustCursorThickness",
                    "adjustBoxThickness",
                    "adjustCursorHeight",
                    "adjustIconHeight"
                ]
            }
        ]
    },
    {
        id: "keybinds",
        icon: keybinds,
        name: "快捷键",
        groups: [
            {
                id: "keybinds",
                name: "",
                settings: [
                    "keybind"
                ]
            }
        ]
    },
    {
        id: "mouse",
        icon: mouse,
        name: "鼠标",
        groups: [
            {
                id: "main",
                name: "",
                settings: [
                    "cursorClickToMove",
                    "mouseHideWhileTyping",
                    "mouseReporting",
                    "mouseShiftCapture",
                    "mouseScrollMultiplier",
                    "rightClickAction",
                    "middleClickAction",
                    "focusFollowsMouse",
                    "clickRepeatInterval"
                ]
            }
        ]
    },
    {
        id: "gtk",
        icon: gtk,
        name: "GTK",
        groups: [
            {
                id: "main",
                name: "",
                settings: [
                    "language",
                    "class",
                    "x11InstanceName",
                    "gtkSingleInstance",
                    "gtkCustomCss",
                    "gtkOpenglDebug",
                    "appNotifications"
                ]
            },
            {
                id: "tabs",
                name: "标题栏与标签页",
                settings: [
                    "gtkToolbarStyle",
                    "gtkTitlebarStyle",
                    "gtkTabsLocation",
                    "gtkWideTabs",
                    "gtkTitlebar",
                    "gtkTitlebarHideWhenMaximized",
                    "gtkTabsInverted",
                    "gtkHorizontalTabScroll",
                    "gtkQuickTerminalLayer",
                    "gtkQuickTerminalNamespace"
                ]
            }
        ]
    },
    {
        id: "linux",
        icon: linux,
        name: "Linux",
        groups: [
            {
                id: "main",
                name: "",
                settings: [
                    "asyncBackend",
                    "linuxCgroup",
                    "linuxCgroupMemoryLimit",
                    "linuxCgroupProcessesLimit",
                    "linuxCgroupHardFail"
                ]
            }
        ]
    },
    {
        id: "macos",
        icon: macos,
        name: "macOS",
        groups: [
            {
                id: "main",
                name: "",
                settings: [
                    "macosNonNativeFullscreen",
                    "macosTitlebarStyle",
                    "macosTitlebarProxyIcon",
                    "macosOptionAsAlt",
                    "macosWindowShadow",
                    "macosWindowButtons",
                    "macosHidden",
                    "macosAutoSecureInput",
                    "macosSecureInputIndication",
                    "macosApplescript",
                    "macosDockDropBehavior",
                    "macosShortcuts",
                    "commandPaletteEntry",
                    "autoUpdate",
                    "autoUpdateChannel"
                ]
            },
            {
                id: "icon",
                name: "应用图标",
                note: "选择 <code>custom-style</code> 后，可用其余图标设置实时预览并定制图标。",
                preview: "appIcon",
                settings: [
                    "macosIcon",
                    "macosCustomIcon",
                    "macosIconFrame",
                    "macosIconGhostColor",
                    "macosIconScreenColor"
                ]
            }
        ]
    }
] as const satisfies NavPanel[];

export default navigation;

type TopLevelPanelIDs = typeof navigation[number]["id"];
type TabGroups = TopLevelPanelIDs[][];

export const tabGroups: TabGroups = [
    ["application", "terminal", "clipboard"],
    ["window", "colors", "fonts"],
    ["keybinds", "mouse"],
    ["gtk", "linux", "macos"]
];

// Validation: run at build time or in dev
export function validateNavigation() {
    const seen = new Set<string>();
    const walk = (panels: NavPanel[]) => {
        for (const panel of panels) {
            for (const group of panel.groups ?? []) {
                for (const id of group.settings) {
                    if (!(id in registry)) throw new Error(`Unknown setting id in nav tree: ${id}`);
                    if (seen.has(id)) throw new Error(`Duplicate setting id in nav tree: ${id}`);
                    seen.add(id);
                }
            }
            if (panel.pages) walk(panel.pages);
        }
    };
    walk(navigation);

    for (const id of Object.keys(registry)) {
        if (!seen.has(id)) throw new Error(`Setting "${id}" exists in registry but is not categorized in navigation`);
    }
}

if (dev) validateNavigation();