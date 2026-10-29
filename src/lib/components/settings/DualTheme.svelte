<script lang="ts">
    import {dualThemeCodec, type LinkedValue} from "#lib/settings/codecs";
    import Dropdown from "./Dropdown.svelte";
    import LinkedInput from "./LinkedInput.svelte";

    interface Props {
        value: string; // 'Theme Name' (one theme) or 'light:Name,dark:Name' (per light/dark)
        options: Array<string | {name: string, value: string, icon?: string}>;
    }

    // eslint-disable-next-line prefer-const
    let {value = $bindable(""), options}: Props = $props();

    // Ghostty's pair form requires BOTH halves (`light:A,dark:B`); an unlinked draft with an
    // empty side would serialize to a malformed value like `light:,dark:B` and leak into the
    // exported config. Collapse such drafts to the single form (or ""), keeping the store valid
    // at every keystroke — LinkedInput keeps the visual draft alive across our canonicalization.
    function serializeTheme(v: LinkedValue): string {
        if (!v.linked && (v.first === "" || v.second === "")) return v.first || v.second;
        return dualThemeCodec.serialize(v);
    }
</script>

<LinkedInput bind:value labels={["Light", "Dark"]} parse={(raw: string) => dualThemeCodec.parse(raw)} serialize={serializeTheme} collapseLinked>
    {#snippet control(theme: string, setTheme: (next: string) => void)}
        <Dropdown
            value={theme}
            {options}
            change={setTheme}
            placeholder="主题…"
            searchable
            allowEmpty
            emptyLabel="重置主题"
            iconSize={32}
            maxWidth={150}
        />
    {/snippet}
</LinkedInput>
