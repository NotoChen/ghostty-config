<script lang="ts">
    /* eslint-disable quote-props */
    import {dev} from "$app/env";
    import {error} from "@sveltejs/kit";
    import Group from "#lib/components/settings/Group.svelte";
    import Item from "#lib/components/settings/Item.svelte";
    import Separator from "#lib/components/settings/Separator.svelte";
    import Dropdown from "#lib/components/settings/Dropdown.svelte";
    import Page from "#lib/views/Page.svelte";
    import {basicOptions, richOptions} from "./dropdown";
    import Checkbox from "#lib/components/settings/Checkbox.svelte";
    import Switch from "#lib/components/settings/Switch.svelte";
    import Color from "#lib/components/settings/Color.svelte";
    import type {HexColor} from "#lib/utils/colors";
    import LinkItem from "#lib/components/settings/LinkItem.svelte";
    import CogIconUrl from "#lib/images/tabs/application.webp";
    import Number from "#lib/components/settings/Number.svelte";
    import Range from "#lib/components/settings/Range.svelte";
    import Palette from "#lib/components/settings/Palette.svelte";
    import Text from "#lib/components/settings/Text.svelte";
    import RepeatableText from "#lib/components/settings/RepeatableText.svelte";
    import PillButtons from "#lib/components/settings/PillButtons.svelte";
    import Radio from "#lib/components/settings/Radio.svelte";
    import FeatureList from "#lib/components/settings/FeatureList.svelte";
    import NumberWithUnits from "#lib/components/settings/NumberWithUnits.svelte";
    import CustomColor from "#lib/components/settings/CustomColor.svelte";
    import DualNumber from "#lib/components/settings/DualNumber.svelte";
    import Duration from "#lib/components/settings/Duration.svelte";
    import CustomNumber from "#lib/components/settings/CustomNumber.svelte";
    import CustomDuration from "#lib/components/settings/CustomDuration.svelte";
    import DualTheme from "#lib/components/settings/DualTheme.svelte";
    import {themes} from "#lib/data/themes";
    import {themeIcon} from "#lib/utils/themes";
    import ScrollMultiplier from "#lib/components/settings/ScrollMultiplier.svelte";

    if (!dev) error(404, "Not found");

    interface Values {
        dropdownBasic: string;
        dropdownRich: string;
        booleanCheckbox: boolean;
        booleanSwitch: string;
        colorBasic: HexColor;
        colorPalette: HexColor[];
        colorCustom: string;
        colorCustomAdvanced: string;
        numberBasic: string;
        numberWithUndefined: string;
        numberFractional: string;
        numberWithUnits: string;
        numberDual: string;
        numberDualLinked: string;
        numberCustom: string;
        numberCustomAdvanced: string;
        numberMultiplier: string;
        rangeBasic: string;
        rangeLabeled: string;
        textBasic: string;
        textRepeatable: string[];
        textDuration: string;
        textDurationNullable: string;
        durationCustom: string;
        dualTheme: string;
        pillButtons: string;
        featureList: string;
        radioBasic: string;
    }

    const values = $state<Values>({
        dropdownBasic: "detect",
        dropdownRich: "nord",
        booleanCheckbox: true,
        booleanSwitch: "false",
        colorBasic: "#4f5a6f",
        colorPalette: ["#4f5a6f", "#f6f7fb", "#c0d0e0", "#a0b0c0", "#708090"],
        colorCustom: "transparent",
        colorCustomAdvanced: "#68A6C5",
        numberBasic: "42",
        numberWithUndefined: "",
        numberFractional: "1.4",
        numberWithUnits: "10px",
        numberDual: "80,60",
        numberDualLinked: "50",
        numberCustom: "macos-glass-regular",
        numberCustomAdvanced: "0.5",
        numberMultiplier: "precision:1,discrete:3",
        rangeBasic: "42",
        rangeLabeled: "0.4",
        textBasic: "Hello, world!",
        textRepeatable: ["Item 1", "Item 2", "Item 3"],
        textDuration: "1h30m",
        textDurationNullable: "",
        durationCustom: "off",
        dualTheme: "light:Rose Pine Dawn,dark:Rose Pine",
        pillButtons: "default",
        featureList: "",
        radioBasic: "option1",
    });

    const themeOptions = Object.entries(themes).map(([name, scheme]) => ({name, value: name, icon: themeIcon(scheme)}));
</script>

<Page title="Component Showcase">

    <Group title="Booleans">
        <Item name="Checkbox" note="This is a checkbox.">
            <Checkbox bind:checked={values.booleanCheckbox} />
        </Item>
        <Separator />
        <Item name="Switch" note="This is a switch.">
            <Switch bind:value={values.booleanSwitch} />
        </Item>
    </Group>


    <Group title="Colors">
        <Item name="Basic Color" note="This is a color input.">
            <Color bind:value={values.colorBasic} />
        </Item>
        <Separator />
        <Item name="Color Palette" note="This is a color palette input.">
            <Palette bind:value={values.colorPalette} defaultValue={["#4f5a6f", "#f6f7fb", "#c0d0e0", "#a0b0c0", "#708090"]} />
        </Item>
        <Separator />
        <Item name="Custom Color" note="Supports both custom hex colors and predefined special values. Currently: {values.colorCustom}">
            <CustomColor
                bind:value={values.colorCustom}
                presets={[
                    {value: "transparent", label: "Transparent"},
                    {value: "currentColor", label: "Current color"},
                ]}
                default="#122A5F"
            />
        </Item>
        <Separator />
        <Item name="Custom Color Advanced" note="Supports both custom hex colors and predefined special values. Currently: {values.colorCustomAdvanced}">
            <CustomColor
                bind:value={values.colorCustomAdvanced}
                presets={[
                    {value: "cell-bg", label: "Cell Background", description: "The background color of the terminal cell"},
                    {value: "cell-fg", label: "Cell Foreground", description: "The foreground color of the terminal cell"},
                    {value: "bright", label: "Bright", description: "A bright color for emphasis"},
                ]}
                default="#68A6C5"
            />
        </Item>
    </Group>


    <Group title="Dropdowns">
        <Item name="Basic" note="Default behavior with string options.">
            <Dropdown bind:value={values.dropdownBasic} options={basicOptions} />
        </Item>
        <Separator />
        <Item name="Structured options" note="Supports labels and separators between logical sections.">
            <Dropdown bind:value={values.dropdownRich} groups={richOptions} searchable allowEmpty placeholder="Select grouped option" />
        </Item>
        <Separator />
        <Item name="Dual Theme" note="One global theme, or link off to set a separate theme per light/dark mode. Currently: {values.dualTheme}">
            <DualTheme bind:value={values.dualTheme} options={themeOptions} />
        </Item>
    </Group>
    <Group>
        <LinkItem name="Advanced Dropdown Debug" href="/app/dropdown-debug" icon={CogIconUrl} />
    </Group>


    <Group title="Numbers">
        <Item name="Basic number" note="This is a number input.">
            <Number bind:value={values.numberBasic} min={0} max={100} step={1} />
        </Item>
        <Separator />
        <Item name="Number with undefined" note="Supports undefined value for 'no value' state.">
            <Number bind:value={values.numberWithUndefined} min={0} max={100} step={1} placeholder="No value" nullable />
        </Item>
        <Separator />
        <Item name="Number with units" note="Supports numbers with units.">
            <NumberWithUnits bind:value={values.numberWithUnits} />
        </Item>
        <Separator />
        <Item name="Fractional number" note="Supports fractional values when step is non-integer.">
            <Number bind:value={values.numberFractional} min={0} max={10} step={0.1} integer={false} />
        </Item>
        <Separator />
        <Item name="Range input" note="This is a range input.">
            <Range bind:value={values.rangeBasic} min={0} max={100} step={1} showLabels={false} />
        </Item>
        <Separator />
        <Item name="Range with labels" note="Shows min/max labels when showLabels is true.">
            <Range bind:value={values.rangeLabeled} min={0} max={1} step={0.1} showLabels />
         </Item>
         <Separator />
        <Item name="Dual Number ({values.numberDual})" note="Two linked number inputs for related values, e.g. width and height.">
            <DualNumber bind:value={values.numberDual} labels={["Width", "Height"]} min={0} max={1000} step={1} />
        </Item>
        <Separator />
        <Item name="Dual Number ({values.numberDualLinked})" note="Two linked number inputs for related values, e.g. width and height.">
            <DualNumber bind:value={values.numberDualLinked} labels={["X", "Y"]} min={0} max={1000} step={1} />
        </Item>
        <Separator />
        <Item name="Scroll Multiplier" note="Adjusts the scroll multiplier. Currently: {values.numberMultiplier}">
            <ScrollMultiplier bind:value={values.numberMultiplier} />
        </Item>
        <Separator />
        <Item name="Custom Number" note="Supports both custom numbers and predefined special values. Currently: {values.numberCustom}">
            <CustomNumber
                bind:value={values.numberCustom}
                presets={[
                    {value: "false", label: "Off"},
                    {value: "true", label: "On"},
                    {value: "macos-glass-regular", label: "Regular Glass"},
                    {value: "macos-glass-clear", label: "Clear Glass"},
                ]}
            />
        </Item>
        <Separator />
        <Item name="Custom Number" note="Supports both custom numbers and predefined special values. Currently: {values.numberCustomAdvanced}">
            <CustomNumber
                bind:value={values.numberCustomAdvanced}
                min={0}
                max={1}
                step={0.01}
                presets={[
                    {value: "false", label: "Off", description: "Equivalent to default intensity of 0"},
                    {value: "true", label: "On", description: "Equivalent to default intensity of 20"},
                    {value: "macos-glass-regular", label: "Regular Glass", description: "Standard glass effect (macOS 26.0+)"},
                    {value: "macos-glass-clear", label: "Clear Glass", description: "Highly transparent glass effect (macOS 26.0+)"},
                ]}
            />
        </Item>
    </Group>

    <Group title="Text">
        <Item name="Basic text" note="This is a text input.">
            <Text bind:value={values.textBasic} placeholder="Enter text here" />
        </Item>
        <Separator />
        <Item name="Repeatable Text" note="This is a repeatable text input.">
            <RepeatableText bind:value={values.textRepeatable} />
        </Item>
        <Separator />
        <Item name="Duration Text ({values.textDuration})" note="This is a duration text input that parses human-friendly duration formats (e.g. '1h 30m', '45s', '500ms').">
            <Duration bind:value={values.textDuration} />
        </Item>
        <Separator />
        <Item name="Nullable Duration Text ({values.textDurationNullable})" note="This is a duration text input that parses human-friendly duration formats (e.g. '1h 30m', '45s', '500ms').">
            <Duration bind:value={values.textDurationNullable} nullable placeholder="No value" />
        </Item>
        <Separator />
        <Item name="Custom Duration" note="A Duration with preset special values. Currently: {values.durationCustom}">
            <CustomDuration
                bind:value={values.durationCustom}
                presets={[
                    {value: "off", label: "Off", description: "Disable the timeout entirely"},
                    {value: "instant", label: "Instant", description: "No delay"},
                ]}
                placeholder="e.g. 750ms"
            />
        </Item>
    </Group>

    <Group title="Pill Buttons">
        <Item name="Pill Buttons" note="This is a pill buttons input.">
            <PillButtons
                bind:value={values.pillButtons}
                options={[
                    {value: "default", label: "Default"},
                    {value: "true", label: "On", variant: "accent"},
                    {value: "false", label: "Off", variant: "danger"},
                ]}
            />
        </Item>
    </Group>

    <Group title="Feature List">
        <Item name="Feature List" note="This is a feature list input.">
            <FeatureList
                bind:value={values.featureList}
                features={[
                    {id: "cursor", label: "Cursor reporting", default: true},
                    {id: "sudo", label: "Sudo detection", default: false},
                    {id: "title", label: "Title reporting", default: true},
                    {id: "ssh-env", label: "SSH environment detection", default: false},
                    {id: "ssh-terminfo", label: "SSH terminfo injection", default: false},
                    {id: "path", label: "Current path reporting", default: true},
                ]}
            />
        </Item>
    </Group>

    <Group title="Radio Buttons">
        <Item name="Radio" note="This is a radio input.">
            <Radio
                bind:value={values.radioBasic}
                options={[
                    {value: "option1", label: "Option 1"},
                    {value: "option2", label: "Option 2"},
                    {value: "option3", label: "Option 3"},
                ]}
            />
        </Item>
    </Group>

    <Group title="Live Values" borderless>
        <div class="preview">
            {#each Object.entries(values) as [k, v] (k)}
                <div><span>{k}</span><code>{v ?? "<empty>"}</code></div>
                <Separator />
            {/each}
        </div>
    </Group>
</Page>

<style>
    .preview {
        display: flex;
        flex-direction: column;
        gap: 8px;
        width: 100%;
        background: color-mix(in srgb, var(--bg-level-2) 85%, black);
        border-radius: var(--radius-level-3);
        padding: 12px;
        border: 1px solid var(--border-level-2);
    }

    .preview div {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
    }

    .preview span {
        color: var(--font-color-muted);
        font-size: 0.85rem;
    }

    .preview code {
        background: var(--bg-level-3);
        border: 1px solid var(--border-level-3);
        border-radius: var(--radius-level-5);
        padding: 3px 8px;
    }
</style>
