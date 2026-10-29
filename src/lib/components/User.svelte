<script lang="ts">
    import {resolve} from "$app/paths";
    import {page} from "$app/state";
    import type {Path} from "$app/types";
    import logo from "#lib/images/avatar.webp";

    // SvelteKit 3 types `resolve` against the generated route union, so `route` is typed as `Path`
    // rather than a bare string — it is only ever one of this app's own pages.
    const {route = "", name = "Ghostty Config"}: {route?: Path; name?: string} = $props();
    const path = $derived(page.url.pathname);

    // `resolve` carries the deploy base, so compare against it rather than the bare route.
    const href = $derived(resolve(route));
    const selected = $derived(path === href);
</script>


<a {href} class="user-tab" class:selected>
    <div class="user-avatar">
        <img src={logo} alt="Ghostty Config 标志" />
    </div>
    <div class="user-label">
        <div class="user-name">{name}</div>
        <div class="user-subtext">by @NotoChen</div>
    </div>
</a>


<style>
    .user-tab {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 8px;
        padding: 6px;
        border-radius: var(--radius-level-4);
        text-decoration: none !important;
        font-weight: 600;
    }

    .user-tab.selected {
        background: var(--color-selected);
    }

    .user-avatar img {
        height: 100%;
        width: 100%;
        border-radius: 50%;
        /* border: 2px solid inset var(--border-level-1); */
    }

    .user-avatar {
        display: inline-flex;
        justify-content: center;
        align-items: center;
        height: 40px;
        width: 40px;
        /* border: 2px solid black; */
        /* box-shadow: 0 0 0 2px white; */
    }

    .user-label {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 5px;
    }

    .user-name {
        font-size: 1rem;
        color: var(--font-color);
    }

    .user-subtext {
        font-size: 0.7rem;
        color: var(--font-color-muted);
    }

    .selected .user-subtext {
        color: var(--font-color);
    }
</style>
