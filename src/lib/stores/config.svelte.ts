import {dev} from "$app/env";
import {registry, type SettingDefaults, type SettingValues} from "#lib/settings/registry";
import {runInitializers} from "#lib/settings/initializers";


// Run initializers before setting up defaults to ensure that any dynamic options are populated
void runInitializers();

const buildDefaults = () => Object.fromEntries(Object.entries(registry).map(([k, v]) => [k, v.default])) as SettingDefaults;
const defaults = buildDefaults();
if (dev) console.log(defaults); // eslint-disable-line no-console

const config: SettingValues = $state(buildDefaults());


// diff() is just diffFromDefaults() applied to the live store: every key in `config` exists in
// the registry, and (for palette) every slot is always a real color — so the extra guards in
// diffFromDefaults are no-ops here. One implementation, no drift.
export function diff() {
    return diffFromDefaults(config);
}

export function diffFromDefaults(conf: Partial<SettingValues>) {
    // Flat store: every emitted value is a Ghostty config string, or a string[] for the
    // repeatable/indexed cases (keybind, palette, generic lists). No `any` needed post-flatten.
    const output: Record<string, string | string[]> = {};

    for (const k in conf) {
        const settingId = k as keyof SettingValues;
        const settingKey = registry[settingId]?.key;
        if (!settingKey) continue;
        if (Array.isArray(conf[settingId]) && settingId === "keybind") {
            const toAdd = conf[settingId].filter(c => !defaults[settingId].includes(c as never));
            if (toAdd.length) output[settingKey] = toAdd;
        }
        else if (Array.isArray(conf[settingId]) && settingId === "palette") {
            const toAdd: string[] = [];
            for (let p = 0; p < defaults[settingId].length; p++) {
                if (!conf[settingId][p]) continue;
                if (conf[settingId][p] === defaults[settingId][p]) continue;
                toAdd.push(`${p}=${conf[settingId][p]}`);
            }
            if (toAdd.length) output[settingKey] = toAdd;
        }
        else if (Array.isArray(conf[settingId])) {
            const cur = conf[settingId] as string[];
            const def = defaults[settingId] as string[];
            const changed = cur.length !== def.length || cur.some((v, i) => v !== def[i]);
            if (changed) output[settingKey] = cur.filter(v => v.trim() !== "");
        }
        else if (conf[settingId] !== undefined && conf[settingId] != defaults[settingId]) {
            output[settingKey] = conf[settingId];
        }
    }

    return output;
}

export function load(conf: Partial<typeof config>) {
    for (const key in conf) {
        if (!(key in config)) continue;
        if (key !== "keybind" && key !== "palette") {
            setSetting(key as keyof typeof config, conf[key as keyof typeof config]!);
        }
        else if (key === "keybind") {
            config.keybind = [...config.keybind, ...conf.keybind!];
        }
        else if (key === "palette") {
            for (let p = 0; p < conf.palette!.length; p++) {
                if (!conf.palette![p]) continue;
                config.palette[p] = conf.palette![p];
            }
        }
    }
}

/**
 * Replace the store's values with `conf` wholesale, instead of merging into what's already
 * there. `load()` appends repeatables (right for "import another config on top"), but editing
 * *the* config from disk must not end up with every keybind twice.
 */
export function loadReplacing(conf: Partial<SettingValues>) {
    for (const key in conf) {
        if (!(key in config)) continue;
        const settingId = key as keyof SettingValues;
        const value = conf[settingId];
        if (value === undefined) continue;
        // A parsed file carries all 256 palette slots, every untouched one as "". Blank means
        // "this file doesn't set the slot", not "override it with nothing": writing the blanks
        // through makes every slot read as non-default, and effectiveColors then resolves each
        // one to nothing — which blanks the preview palette globally. Fall back to the default.
        if (settingId === "palette") {
            const source = value as string[];
            setSetting("palette", defaults.palette.map((fallback, i) => source[i] || fallback));
            continue;
        }
        setSetting(settingId, value);
    }
}

// NOTE: theme colors are never written into this store. Selecting a theme only sets the
// `theme` string; the displayed colors are derived in stores/theme.svelte.ts (effectiveColors),
// which is why diff() needs no theme-exclusion logic to keep exports clean.

/**
 * Typed single-setting write. Prefer this over assigning through a widened `config[key]`
 * lvalue in components — the generic ties the value type to the key, no cast needed.
 * */
export function setSetting<K extends keyof SettingValues>(key: K, value: SettingValues[K]) {
    config[key] = value;
}

export function resetSetting(key: keyof SettingValues) {
    const defaultValue = defaults[key];
    setSetting(key, Array.isArray(defaultValue) ? [...defaultValue] : defaultValue);
}

/** Put every setting back to its default — the starting point before loading an external config. */
export function resetAll() {
    for (const key of Object.keys(defaults) as Array<keyof SettingValues>) resetSetting(key);
}

export function isNonDefault(key: keyof SettingValues): boolean {
    const val = config[key];
    const defaultVal = defaults[key];

    // Handle array comparisons for keybinds and palette
    if (Array.isArray(val) && Array.isArray(defaultVal)) {
        if (val.length !== defaultVal.length) return true;
        for (let i = 0; i < val.length; i++) {
            if (val[i] !== defaultVal[i]) return true;
        }
        return false;
    }

    return val !== defaultVal;
}

export {defaults};
export default config;
