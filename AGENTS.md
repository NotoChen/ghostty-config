# AGENTS.md: Ghostty Config

Operating guide for automated agents working in this repository. Read this before making any changes.

## Quick orientation

- **Runtime**: Bun ≥ 1.3 required. All commands run from the repo root.
- **Module system**: `"type": "module"` ES imports only, no `require`.
- **Framework**: Svelte 5 with runes on SvelteKit 3. This is **not** Svelte 3/4. Do not use `writable`, `derived`, `readable`, or any legacy store primitives. See the Svelte 5 section below.
- **Imports**: `#lib/…` (a `package.json` `imports` subpath), not the `$lib` alias — SvelteKit 3 removed it. CSS `url()` cannot follow it; use a relative path there.

## Required checks: run before marking anything ready

```bash
bun run check   # svelte-kit sync + svelte-check (type errors)
bun run lint    # ESLint strict flat config
bun run test    # unit tests via Vitest (bun is just the script runner)
```

All three must pass cleanly. Do not open or mark a PR ready if any fail.

## Architecture: read before touching settings

These files form the core of the settings system with strict relationships between them. The triad that most changes must stay in sync is `types.ts` (shapes) → `registry.ts` (per-setting data: config key + widget) → `navigation.ts` (placement tree).

### `src/lib/settings/types.ts`

Defines `SettingInfo` — the registry entry shape — as a union `ScalarSettingInfo | RepeatableSettingInfo` discriminated on the `repeatable?: true` value-shape flag. An entry carries config-key metadata (`key`, `name`, `description`, `note`, `platform`, `since`, `default`) **plus** an optional `widget?: WidgetDef`, the data-only discriminated union for widget selection + widget metadata. The union's job is compile-time safety: `satisfies SettingsRegistry` rejects any entry whose `default` shape (`string` vs `string[]`) or widget kind (`ScalarWidgetDef` vs `RepeatableWidgetDef`) disagrees with `repeatable` — do not collapse it back to one interface. There is **no `SettingDef` union and no `TypeToValue`** — the store is flat strings (see the store-flatten note below). Widget-metadata types (`DropdownOption`, `FeatureDef`, `PillOption`, `SpecialValue`) live here too, consumed by `WidgetDef` and the renderer.

### `src/lib/settings/registry.ts`

The flat camelCase-keyed record of every setting. The export pattern is:

```ts
export const registry = { ... } satisfies SettingsRegistry;
```

**`satisfies` without `as const` is intentional and must be preserved.** It keeps `repeatable: true` as a literal so the `SettingValues` mapped type at the bottom of the file can resolve each key to `string[]` (repeatable) or `string` (everything else) — this is what replaced the old `type`/`TypeToValue` machinery. The store holds only strings; a registry `default` is a literal string (`"13"`, `"false"`, `""` for unset) or a `string[]` for repeatable settings. Initializers may still mutate `.default` (it's a plain `string`), so don't add `as const`.

Each entry also carries its `widget?: WidgetDef` (omit it for a plain `Text`/`RepeatableText` input — that's the renderer's default). Everything about a setting except its placement lives on the entry, so an upstream Ghostty sync (defaults, descriptions, enum option lists) is a single-file edit. `validateRegistry()` runs at import time in dev (and in `registry.test.ts`) to check the data invariants types can't: option-backed widgets (`dropdown`/`pill`/`theme`) must include their own non-empty `default` among their `options` — the tripwire for upstream enum drift — and `duration` widgets must satisfy `allowEmpty` ⟺ unset (`""`) default.

### `src/lib/settings/navigation.ts`

A typed tree of panels → groups → setting keys that drives the sidebar UI. **Placement only** — entries are bare camelCase registry identifiers; widget selection and widget metadata live on the registry entry, not here. (Group-level `preview` keys stay here: which preview renders above a group genuinely is placement.) `validateNavigation()` runs at import time in dev and throws if:

- any key in the nav tree doesn't exist in the registry (typo protection)
- any registry key isn't referenced anywhere in the nav tree (exhaustiveness)

**Adding a setting to `registry.ts` without placing it in `navigation.ts` will throw at dev startup.** Do not add a bypass or suppress this validation.

### `src/lib/settings/options.ts`

Option lists derived purely from build-time data (the generated `themes`/`macicons` modules): computed once at module scope and referenced directly by widget defs in `registry.ts`. No runtime population step — the registry is complete at import time. Add new static option lists here (shared or large lists belong here; a short inline enum can stay on the widget def).

### `src/lib/settings/initializers.ts`

Populates registry fields that require **genuinely runtime** data: OS detection for platform-dependent defaults, and (future) async sources like a native font list. Sync initializers run first via `runSyncInitializers()`; async ones after. Add new runtime-populated fields here, do not mutate the registry from a component — and if the data is static, use `options.ts` instead.

### `src/lib/settings/codecs.ts`

The config store is **flat strings** (`string | string[]`), mirroring Ghostty's own string-at-rest model. Every widget binds the raw store string and converts through a codec here — including the `Switch`/`Number`/`Range` primitives (`boolCodec`/`numberCodec`), which parse/serialize internally rather than binding a native `boolean`/`number`. A codec is a co-located `parse` + `serialize` pair (`Codec<T>`), unit-tested as pure functions in `codecs.test.ts` (no component mount; precedent is `keybinds.ts`/`keybinds.test.ts`). Add new formats here — do **not** re-implement parse/serialize inside a component or in `config.svelte.ts`.

**Symmetric vs. parse-and-validate:** most formats are symmetric (`parse(serialize(v))` round-trips), so they're a `Codec<T>`. When a format canonicalizes — `serialize(parse(x)) !== x`, as with durations (`"90m"` → `"1h30m"`) — expose a `parse`-for-display + validate helper instead of a symmetric codec (see `parseDuration`/`humanizeDuration`).

### `src/lib/stores/config.svelte.ts`

Live config state as a Svelte 5 `$state` object. Key exports:

- `config` - the live state object
- `defaults` - static defaults snapshot used for diffing
- `diff()` - returns only keys differing from defaults; the serialization source of truth
- `diffFromDefaults(conf)` - same logic applied to an arbitrary config object (import preview)
- `load(conf)` - merges a parsed config into live state
- `resetSetting(key)` / `isNonDefault(key)` - per-setting utilities

Theme colors are **never written into this store** — selecting a theme only sets the `theme` string. That is why `diff()` needs no exclusion logic to keep exports clean; do not reintroduce any "apply theme colors to config" helper.

### `src/lib/stores/theme.svelte.ts`

The theme-layering view-model. For each color key (`background`, `foreground`, `cursorColor`, `cursorText`, `selectionBackground`, `selectionForeground`, `palette` element-wise), `effectiveColors()` resolves **explicit override > active theme > app default**; `preview.mode` (ephemeral view state, never serialized) picks which half of a `light:A,dark:B` dual theme renders; `parseTheme` in `codecs.ts` owns the string shape. Consumers of `effectiveColors()` are deliberately few:

- **`+layout.svelte` is the single color-key read funnel** — it resolves effective colors into the global `--config-*` CSS vars. Every preview/surface (chrome, `CursorPreview`, the DOM terminal) reads those CSS vars only, inheriting layered colors for free. Do not add new direct readers of `config.<colorkey>` or `effectiveColors()` in components; read the vars. This is machine-enforced: a `no-restricted-syntax` rule in `eslint.config.js` rejects direct `config` color-key access outside the store, the resolver, and the settings renderer.
- **The color editors in the settings renderer** display effective colors and write *overrides* into `config` (palette edits are per-index — never write a whole themed array into `config.palette`, that would re-create the export leak).

Override detection is value-inferred (`isNonDefault`, i.e. value ≠ app default) — the same rule `diff()` uses, kept deliberately consistent.

## Generated files: never hand-edit

| File | Generator |
|------|-----------|
| `src/lib/data/themes.ts` | `scripts/generate-themes.ts` |
| `src/lib/data/macicons.ts` | `scripts/generate-macicons.ts` |

These are overwritten on the next CI sync. If the output needs to change, edit the generator script, not the generated file.

## `notes/` is local-only

The `notes/` directory (plans, scratch, handoff docs) is **gitignored and never ships**. Do not reference `notes/...` paths or note filenames from anything committed — source comments, tests, README, PR descriptions, or this file. If something in a note genuinely needs to be public, surface the content itself where it belongs (a convention section in this file, a comment at the relevant code site, or a proper committed doc) instead of linking into `notes/`.

## Svelte 5: patterns in use

| Purpose | Use | Do not use |
|---------|-----|------------|
| Reactive state | `$state(value)` | `writable(value)` |
| Derived values | `$derived(expr)` / `$derived.by(() => ...)` | `derived(store, fn)` |
| Side effects | `$effect(() => ...)` | `$: statement` |
| Component props | `let { prop } = $props()` | `export let prop` |
| Two-way bindable props | `$bindable()` in props destructure | - |
| Store-like modules | `.svelte.ts` files exporting `$state` values and mutation functions | Writable store exports |

The ESLint config does not catch all legacy store usage, be deliberate.

## Terminal preview: DOM-based, not `ghostty-web`

The interactive terminal preview (`src/lib/views/InteractiveTerminalDom.svelte`, surfaced through `TerminalPreview` + `MacDock`) is a **custom DOM renderer**, not a real terminal emulator. This is a deliberate architecture decision — do not "upgrade" it back to `ghostty-web` (Ghostty's WASM-compiled VT parser) or any other real-emulator surface.

**Why.** The whole point of this tool is *live* config preview: change a setting and watch existing on-screen output re-theme in place. The DOM renderer does this for free — every color, font, and metric is a CSS custom property (`--config-bg`, `--config-fg`, `--config-palette-N`, `--config-font-family`, …), so a config change reactively restyles output that's already rendered, including scrollback and command history.

A real emulator like `ghostty-web` keeps its state inside a surface that must be **destroyed and recreated** to apply new config. That wipes scrollback and history on every tweak — you'd have to re-run `ls -la` just to see how a theme change affects it. The workarounds (fully static preview, or record/replay of a canned session) each sacrifice the interactivity that justified having a terminal at all. The fidelity `ghostty-web` buys (glyph shaping, ligatures, GPU compositing) is marginal for a config preview, and a *web* build isn't native-accurate anyway — while the dimensions a config tool actually changes (palette, fg/bg, font, cursor, selection, padding, opacity) all render faithfully in the DOM.

**Consequences for contributors.**

- The fake shell under `src/lib/terminal/` (`filesystem`, `commands`, `completion`, `exec`, `utils`) is a **curated demo surface, not a shell emulator**. Add commands only when they meaningfully showcase config; resist turning it into a general-purpose shell.
- `ghostty-web` was removed as a dependency along with the old `LivePreview.svelte` / `InteractiveTerminal.svelte` views and the dev-only `/app/live-preview` route. Don't reintroduce them.
- A genuinely-usable in-browser terminal is a *different product* (a "playground"), not the config preview. If that's ever built, it lives as a separate surface — it does not replace the DOM preview.

### Preview fidelity: two files, one contract

`utils/previewVars.ts` is the **entire** config → CSS mapping (`previewVars()` / `previewStyle()`, plus the small parsers `unitOffset`, `paddingPair`, `fontFeatureSettings`, `blurRadius`). `settings/previewCoverage.ts` is the authoritative list of which registry keys that mapping (or the terminal/preview components) actually read — it powers the 「可预览」 eye badge on each row and the per-page 「本页 N/M 项可预览」 note.

The pair is a contract, not documentation: a key listed in `previewedSettings` but never read by the preview claims feedback that never arrives, and a preview mapping with no listing makes a working preview look inert. **Change both in the same commit.** Everything absent is deliberate — native window chrome, keybinds, GTK/Linux/macOS behaviour, VT protocol switches, and metrics CSS cannot express (`adjust-font-baseline`, strikethrough/overline thickness) are config-only, and the UI now says so instead of pretending otherwise.

Two things are listed but only partially reproducible, so the row text carries the caveat: `background-image` loads only when the value is a URL the browser can fetch (a local path draws nothing — see the `note` on that registry entry), and `copy-on-select` is observable only for the modes that reach the system clipboard (`clipboard`/`both`; `primary` is the X11 selection clipboard a page cannot write). `macosCustomIcon` is **not** listed: it always names a file on the visitor's disk, so it could never show anything.

`+layout.svelte` still owns the live config's colors; a second config's vars come from `utils/configVars.ts` for the side-by-side view.

### Placement: two windows by default

As in Ghostty itself, the config window and the terminal are **separate windows**: `floating` is the default, and `docked` (one window split into settings + preview) is the alternative a visitor can pick. This is not cosmetic — the user explicitly rejected the split-pane default, so don't quietly flip it back.

`TerminalPreview.svelte` is the **only** surface that hosts `InteractiveTerminalDom`. It renders the same component tree in both placements, so popping the preview out to a window and docking it back keeps scrollback and command history — do not split this back into two components that each mount their own terminal.

`app.previewMode` / `previewVisible` / `previewWidth` / `previewX` / `previewY` / `previewUserPlaced` in `stores/state.svelte.ts` are placement-neutral, and anything new that toggles the preview goes through these fields rather than adding another flag. Placement is a per-visitor convenience persisted in localStorage under `ghostty-config:preview:v2` (never in the config, never exported); `savePreview()` is called from an effect in `TerminalPreview`. The `:v2` suffix exists because a stored `docked` from the old default is indistinguishable from never having touched it — bump the key, don't migrate, if the default changes again.

Position has two levels of truth. `previewX`/`previewY` always hold the current spot, but only `previewUserPlaced` (set by a drag/resize, in `onUp`) makes that spot come back on the next visit. A spot the component computed itself is re-derived on every load, because "beside the config window" depends on a layout that may be gone: restoring a computed x from a 1600px visit on a 1280px screen parks the terminal flush against, or on top of, the settings. `-1` means "never placed".

The two windows must not overlap, and that takes two halves:

- **The component** publishes its own width as `--preview-float-width` on `document.documentElement` (from an effect that reads `width` *outside* `untrack`, or it publishes only the first value), and positions itself with `defaultPlacement()` — measured off `.app-window` and set just to its right with a 24px gap. `clampToViewport()` keeps a stored or resized window on screen, and `coversConfigWindow()` re-derives any spot that would land on the settings.
- **`+layout.svelte`** narrows `.app-window.preview-floating` to `calc(100vw - var(--preview-float-width) - 72px)`. Never hardcode the window width into that calc — it was guessed wrong twice; let the component say how much room it needs. Its `min-width: 1040px` is the width at which a 540px settings column and the floating window still both fit; below it the rule stays off and the terminal cascades over the config window on purpose rather than squeezing both into slivers.

Placement runs *after* the layout settles: the initial spot defers through `tick()` because at mount the config window still owns the full width, and measuring then puts the terminal on top of it. Viewport changes do the same, and a window the visitor never resized follows the viewport's default width (`defaultFloatingWidth`); once they resize it, `userSized` keeps their size even when that means the two no longer fit side by side.

The docked width has exactly one source of truth: `app.previewWidth`, set as the pane's inline `width` and changed only by the divider (`startDockResize`, plus arrow keys for keyboard users) or `clampPreviewWidth`. `dockWidthLimit(viewport)` caps it so the settings column keeps ~420px; the clamp effect reads `viewportWidth` on purpose, since `isDocked` stays true across a resize and would otherwise never re-run. Below `DOCK_MIN_VIEWPORT` the docked mode is not used at all.

`Page.svelte`'s header is absolutely positioned against `#content-view`, which is `position: relative`, so it stops at the preview pane instead of running underneath it. If you change those anchors, check that narrow views still render the header correctly.

### Saying what changed

`stores/preview.svelte.ts` turns each edit into a short-lived chip on the preview: setting name plus `from → to` (`调色板 3` with both hex values for palette slots). The pure half — flattening, diffing, value formatting, first differing palette slot — is `utils/preview.ts`, unit-tested in `preview.test.ts`.

- Call `trackConfig(config)` from an `$effect`; it snapshots (the reactive read) and then does all of its bookkeeping inside `untrack()`. Reading and writing `recentChanges` in the same effect trips Svelte's update-depth guard — keep the `untrack`.
- One chip per key: a slider drag widens the existing chip rather than stacking every intermediate value.
- Bulk changes (>4 keys at once: loading a config, resetting everything) push nothing — a wall of chips says nothing useful.
- The pane also flashes a one-shot accent ring keyed off the newest change id, and the terminal transitions color over 220ms so a restyle reads as a change instead of a snap.

`docs/screenshots/*.jpg` are the Chinese-UI screenshots the README embeds; regenerate them from the running app rather than editing text into an existing image.

## Local-config bridge: dev/preview only

`/app/local-config` compares the config on this machine with the one the editor is building, and can write the editor's config back. A browser cannot read `~/Library/Application Support/com.mitchellh.ghostty/config.ghostty`, so `scripts/vite-plugin-local-config.ts` serves it over `GET/POST /__ghostty/local-config` from the Vite **dev and preview** servers. `vite build` emits no such route, so the deployed static site has no file access at all and the page shows an unavailable notice instead.

Rules that must stay true:

- **Loopback only.** The plugin rejects non-loopback sockets and any `Origin` that isn't `localhost`/`127.0.0.1`. POST additionally requires `application/json` (which forces a CORS preflight the endpoint never answers). Do not add CORS headers or relax the origin check — this endpoint rewrites a real user file.
- **Never write without a backup.** `writeLocalConfig()` always copies to `*.bak-<timestamp>` first and writes through a `.tmp` file + rename, so a crash can't leave a truncated config.
- **Validation runs against the user's real `ghostty` binary** (`+validate-config`). A file that *already* contains an invalid line (e.g. the 1.4-removed `link`) is allowed to be written as long as the write doesn't introduce a new offender; anything newly introduced is rejected.
- **Only the app's non-default values are written.** `mergeConfigText()` rewrites matching lines in place and appends missing ones; lines the editor leaves at default are untouched unless the user explicitly opts into commenting them out. Do not make a plain write delete customizations the user never loaded.
- **A generated block must read like a hand-written one.** Keys that have to be appended are grouped by the navigation section they live in and get a one-line Chinese comment — `# ========== 面板 · 分组 ==========` then `# 设置名：描述首句` per key — via `src/lib/utils/configComments.ts` (`annotatedConfigText()` does the same for the plain export/下载 path; share URLs keep the bare `serialize()` output). Comments come from the registry `name`/`description`, so they stay in sync with the setting text instead of being a second translation to maintain.
- The client half is `src/lib/stores/localConfig.svelte.ts`; diffing and merging are pure functions in `src/lib/utils/configDiff.ts` (unit-tested). Keep write-side decision logic there, not in the page.
- **A page on a non-loopback host never probes the bridge.** `refreshLocalConfig()` returns `unavailable` without a request unless the page is served from `localhost`/`127.0.0.1`/`[::1]`, so the deployed copy shows the uploaded-file / pasted-text path and logs no 404 on every visit. Keep that gate in the store, not in the page.
- `src/lib/utils/configVars.ts` renders a *second* config's `--config-*` vars for the side-by-side preview. `+layout.svelte` remains the single funnel for the live config's colors — this module exists only so a non-live config can be shown without touching global state.

## Other conventions

**Async handlers**: use `withPendingGuard(fn)` from `#lib/utils/debounce` for anything that must not fire concurrently. Use `debounce(fn, ms)` (leading-edge by default in this codebase) for rate-limiting sync actions.

**User feedback**: use the toast system (`success()` / `error()` from `#lib/stores/toasts.svelte`) for all success/failure feedback. Do not introduce inline button label swapping or other ad-hoc feedback patterns.

**Serialization**: only values differing from defaults appear in the generated config output. `diff()` handles this, do not add serialization logic elsewhere.

**Defaults**: a registry `default` is a **string** (or `string[]`) and must equal Ghostty's actual default *state*, since `diff()` / `isNonDefault()` compare against it as strings. Where that default lives depends on the value encoding:

- **Scalar settings** (rendered by `text`/`number`/`dropdown`/`pill`/`duration`/`color`/`dual-number`/… widgets) — the default lives only in `default`, string-encoded (`"13"`, `"false"`, `"native"`). Use `""` only when Ghostty's genuine default is unset/empty.
- **Override-encoded settings** (`feature-list`; also `palette` / `keybind`) — the stored value is already *relative* to per-item sub-defaults, so the setting `default` is `""`/`[]` (no overrides) and the real per-item defaults live in the **widget metadata on the entry's `widget`** (e.g. a `feature-list` widget's `features[].default`), not in `default` itself. This is why `""` is correct there despite the items having defaults.
- **Durations** specifically: a concrete default → set the string (`"5s"`) and give the entry's `duration` widget `allowEmpty: false`; a genuinely-unset default → `""` + `allowEmpty: true`. `validateRegistry()` enforces this pairing (`allowEmpty` ⟺ `""` default).

The `""`-means-genuinely-unset rule is **load-bearing**, not just style: the settings renderer derives a `number` widget's clearability from it (`nullable={setting.default === ""}`), so a wrong `""` default makes a required setting blankable and a wrong concrete default makes an optional setting un-clearable.

**Setting keys**: Ghostty config keys are `kebab-case` (e.g. `font-size`). Registry keys are `camelCase` (e.g. `fontSize`). The `key` field on each registry entry is the Ghostty string; the JS property name is the camelCase identifier. These must remain in sync with Ghostty's actual config schema.

**Code style quick reference**:
- Double quotes for strings, semicolons everywhere
- `brace-style: stroustrup` (braces on multi-line blocks, allowed to omit for single-line)
- `import type` when only types are needed
- Grouped imports: external → `#lib` → relative, alphabetical within each group
- `class:foo={condition}` not manual class string concatenation

## AI self-disclosure

If you are an autonomous agent submitting a PR where the human operator did not personally review the output before submission, say so explicitly in the PR description. For example:

> This PR was generated by [agent/tool]. The human operator [reviewed the diff and ran the checks locally / did not review the output before submission].

This is a transparency expectation, not a penalty against AI-assisted work. It helps calibrate review effort. PRs that appear to be unreviewed agent output without this disclosure will be closed without detailed feedback.