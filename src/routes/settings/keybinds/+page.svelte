<script lang="ts">
    import Page from "$lib/views/Page.svelte";
    import config from "$lib/stores/config.svelte";
    import Keybinds from "$lib/components/settings/Keybinds.svelte";
</script>

<Page title="快捷键">
    <Keybinds bind:value={config.keybind} />
</Page>
