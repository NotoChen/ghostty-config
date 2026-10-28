<script lang="ts">
    import {getSetting} from "$lib/contexts";
    import {boolCodec, featureListCodec, type FeatureState} from "$lib/settings/codecs";
    import type {FeatureDef} from "$lib/settings/types";
    import Button from "../Button.svelte";
    import CheckListIcon from "../icons/CheckListIcon.svelte";
    import DialogModal from "../modals/DialogModal.svelte";
    import Group from "./Group.svelte";
    import Item from "./Item.svelte";
    import Separator from "./Separator.svelte";
    import Switch from "./Switch.svelte";


    interface Props {
        value: string;
        features: FeatureDef[];
    };

    // eslint-disable-next-line prefer-const
    let {value = $bindable(), features}: Props = $props();
    const settingInfo = getSetting();

    const codec = $derived(featureListCodec(features));
    let states = $derived.by(() => codec.parse(value));

    // Modal stuff
    let isEditorOpen = $state(false);
    let draftState = $state<FeatureState>({});
    function openEditor() {
        draftState = {...states};
        isEditorOpen = true;
    }

    function closeEditor() {
        isEditorOpen = false;
        draftState = {};
    }

    function onEditorSave() {
        // Commit the draft state to the actual value since relying on derived didn't work for some reason
        states = {...draftState};
        value = codec.serialize(states);
        closeEditor();
    }

    function handleEditorKeydown(event: KeyboardEvent) {
        if (!isEditorOpen) return;
        if (event.key === "Escape") closeEditor();
    }
</script>

<Button onclick={openEditor}>
    配置…
</Button>

<svelte:document onkeydown={handleEditorKeydown} />


{#if isEditorOpen}
    <DialogModal title={settingInfo?.name ?? "配置特性"} onclose={closeEditor}>
        {#snippet icon()}
            <CheckListIcon />
        {/snippet}

        <Group>
            {#each features as feature, i (feature.id)}
                <Item name={feature.label} isNonDefault={draftState[feature.id] !== feature.default} onReset={() => draftState[feature.id] = feature.default}>
                    <Switch bind:value={() => boolCodec.serialize(draftState[feature.id]), (v: string) => draftState[feature.id] = boolCodec.parse(v)} />
                </Item>
                {#if i < features.length - 1}<Separator />{/if}
            {/each}
        </Group>

        {#snippet footer()}
            <Button onclick={closeEditor}>关闭</Button>
            <Button primary onclick={onEditorSave}>保存</Button>
        {/snippet}
    </DialogModal>
{/if}
