import {describe, expect, it} from "vitest";
import type {SettingAnnotation} from "./configComments";
import {diffConfigs, kebabToCamel, lineDiff, mergeConfigText, summarizeDiff} from "./configDiff";

// "local" is what the on-disk file sets; "app" is the editor's config (defaults + overrides).
// These lock the three-way classification and, more importantly, that a merge write never
// deletes a customization the user didn't load into the editor.

describe("diffConfigs()", () => {
    it("marks a key only the app sets as added", () => {
        const rows = diffConfigs({fontSize: "13"}, {fontSize: "18"});
        expect(rows.find(r => r.id === "fontSize")?.status).toBe("added");
    });

    it("marks differing values as changed", () => {
        const rows = diffConfigs({fontSize: "12"}, {fontSize: "18"});
        expect(rows.find(r => r.id === "fontSize")?.status).toBe("changed");
    });

    it("marks a file override the app left at its default as reverted", () => {
        const rows = diffConfigs({fontSize: "12"}, {});
        expect(rows.find(r => r.id === "fontSize")?.status).toBe("reverted");
    });

    it("marks identical values as same", () => {
        const rows = diffConfigs({fontSize: "12"}, {fontSize: "12"});
        expect(rows.find(r => r.id === "fontSize")?.status).toBe("same");
    });

    it("keeps repeatables in order when comparing", () => {
        const rows = diffConfigs({fontFamily: ["A", "B"]}, {fontFamily: ["B", "A"]});
        expect(rows.find(r => r.id === "fontFamily")?.status).toBe("changed");
    });

    it("reports a key the registry doesn't know as local-only", () => {
        const rows = diffConfigs({link: "true"}, {});
        const row = rows.find(r => r.id === "link");
        expect(row?.status).toBe("local-only");
        expect(row?.key).toBe("link");
    });

    it("compares palette slots only where either side overrides", () => {
        const rows = diffConfigs({palette: ["0=#111111"]}, {palette: ["3=#ff0000"]});
        const palette = rows.find(r => r.id === "palette");
        expect(palette?.status).toBe("changed");
        expect(palette?.local).toEqual(["0=#111111"]);
        expect(palette?.app).toEqual(["3=#ff0000"]);
    });

    it("flags a slot both sides override differently", () => {
        const rows = diffConfigs({palette: ["5=#111111"]}, {palette: ["5=#222222"]});
        const palette = rows.find(r => r.id === "palette");
        expect(palette?.status).toBe("changed");
        expect(palette?.local).toEqual(["5=#111111"]);
        expect(palette?.app).toEqual(["5=#222222"]);
    });

    it("does not flag the app's untouched default palette", () => {
        const rows = diffConfigs({}, {palette: []});
        expect(rows.find(r => r.id === "palette")?.status).toBe("same");
    });

    it("summarizes every row exactly once", () => {
        const rows = diffConfigs({fontSize: "12", link: "true"}, {fontSize: "18"});
        const summary = summarizeDiff(rows);
        expect(summary.total).toBe(rows.length);
        expect(summary.changed + summary.added + summary.reverted + summary.localOnly + summary.same).toBe(summary.total);
    });
});

describe("mergeConfigText()", () => {
    const local = [
        "# 字体",
        "font-size = 12",
        "# 主题",
        "theme = Catppuccin Mocha",
        ""
    ].join("\n");

    it("replaces a line in place and keeps comments where they are", () => {
        const out = mergeConfigText(local, {"font-size": "18"});
        expect(out).toBe([
            "# 字体",
            "font-size = 18",
            "# 主题",
            "theme = Catppuccin Mocha",
            ""
        ].join("\n"));
    });

    it("appends a key the file doesn't mention", () => {
        const out = mergeConfigText(local, {"font-size": "12", "window-padding-x": "8"});
        expect(out.endsWith("window-padding-x = 8\n")).toBe(true);
    });

    it("leaves a local-only customization alone when the app has nothing for it", () => {
        const out = mergeConfigText(local, {"font-size": "12"});
        expect(out).toContain("theme = Catppuccin Mocha");
    });

    it("comments out a revert only when asked", () => {
        const untouched = mergeConfigText(local, {});
        expect(untouched).toContain("\ntheme = Catppuccin Mocha");

        const reverted = mergeConfigText(local, {}, ["theme"]);
        expect(reverted).toContain("# theme = Catppuccin Mocha");
        expect(reverted).not.toContain("\ntheme = Catppuccin Mocha");
    });

    it("does not comment an already-commented line twice", () => {
        const once = mergeConfigText(local, {}, ["theme"]);
        const twice = mergeConfigText(once, {}, ["theme"]);
        expect(twice.match(/# theme = /g)?.length).toBe(1);
    });

    it("keeps a repeatable block interleaved with its comments", () => {
        const text = "# 方向键\nkeybind = ctrl+a=select_all\n# 分屏\nkeybind = ctrl+d=new_split:right\n";
        const out = mergeConfigText(text, {keybind: ["ctrl+a=select_all", "ctrl+d=new_split:down"]});
        expect(out).toBe("# 方向键\nkeybind = ctrl+a=select_all\n# 分屏\nkeybind = ctrl+d=new_split:down\n");
    });

    it("drops a surplus repeatable line the app no longer emits", () => {
        const out = mergeConfigText("keybind = a=b\nkeybind = c=d\n", {keybind: ["a=b"]});
        expect(out).toBe("keybind = a=b\n");
    });

    it("rewrites a retired alias in place instead of adding its replacement", () => {
        const out = mergeConfigText("# 回滚\nscrollback-limit = 1000\n", {"scrollback-limit-bytes": "2000"});
        expect(out).toBe("# 回滚\nscrollback-limit-bytes = 2000\n");
    });

    it("writes every value of a repeatable key", () => {
        const out = mergeConfigText("font-family = A\n", {"font-family": ["X", "Y"]});
        expect(out).toBe("font-family = X\nfont-family = Y\n");
    });

    it("collapses duplicate lines for a key the app owns", () => {
        const out = mergeConfigText("font-size = 1\nfont-size = 2\n", {"font-size": "3"});
        expect(out).toBe("font-size = 3\n");
    });
});

describe("mergeConfigText() with annotations", () => {
    function annotation(key: string, section: string, comment: string, order: number): [string, SettingAnnotation] {
        return [key, {key, panel: section, group: "", section, name: key, comment, order}];
    }

    const annotations = new Map<string, SettingAnnotation>([
        annotation("bell-features", "终端 · 响铃", "响铃功能：控制响铃的方式", 3),
        annotation("macos-shortcuts", "macOS · 基础", "macOS 快捷键：菜单栏快捷键的行为", 1),
        annotation("window-padding-x", "窗口 · 内边距", "水平内边距：窗口左右留白", 2)
    ]);

    it("groups appended keys by module, in navigation order, each under its comment", () => {
        const out = mergeConfigText("font-size = 12\n", {
            "macro-features": "system",
            "bell-features": "system",
            "window-padding-x": "8",
            "macos-shortcuts": "allow"
        }, [], {annotations});

        expect(out).toBe([
            "font-size = 12",
            "",
            "# ========== macOS · 基础 ==========",
            "# macOS 快捷键：菜单栏快捷键的行为",
            "macos-shortcuts = allow",
            "",
            "# ========== 窗口 · 内边距 ==========",
            "# 水平内边距：窗口左右留白",
            "window-padding-x = 8",
            "",
            "# ========== 终端 · 响铃 ==========",
            "# 响铃功能：控制响铃的方式",
            "bell-features = system",
            "",
            "macro-features = system",
            ""
        ].join("\n"));
    });

    it("keeps the file's own comment above an in-place rewrite", () => {
        const out = mergeConfigText("# 我的响铃\nbell-features = none\n", {"bell-features": "system"}, [], {annotations});
        expect(out).toBe("# 我的响铃\nbell-features = system\n");
    });

    it("leaves keys without an annotation uncommented", () => {
        const out = mergeConfigText("", {"unknown-thing": "1"}, [], {annotations});
        expect(out).toBe("unknown-thing = 1\n");
    });
});

describe("lineDiff()", () => {
    it("returns only same lines for identical text", () => {
        expect(lineDiff("a\nb", "a\nb").every(l => l.kind === "same")).toBe(true);
    });

    it("marks an inserted line as add", () => {
        const diff = lineDiff("a\nb", "a\nx\nb");
        expect(diff.filter(l => l.kind === "add").map(l => l.text)).toEqual(["x"]);
    });

    it("marks a removed line as remove", () => {
        const diff = lineDiff("a\nx\nb", "a\nb");
        expect(diff.filter(l => l.kind === "remove").map(l => l.text)).toEqual(["x"]);
    });
});

describe("kebabToCamel()", () => {
    it("matches the store's id derivation", () => {
        expect(kebabToCamel("font-size")).toBe("fontSize");
        expect(kebabToCamel("scrollback-limit-bytes")).toBe("scrollbackLimitBytes");
        expect(kebabToCamel("title")).toBe("title");
    });
});
