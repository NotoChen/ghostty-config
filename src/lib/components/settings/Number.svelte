<script lang="ts">
    import {countDecimalPlaces} from "$lib/utils/numbers";
    import {numberCodec} from "$lib/settings/codecs";

    type Props = {
        value: string; // flat-store string; parsed to a number internally via numberCodec
        min?: number;
        max?: number;
        step?: number;
        size?: number;
        placeholder?: string;
        integer?: boolean;
        nullable?: boolean; // empty input commits "" (= unset); otherwise it reverts on blur
        onchange?: (value: number | undefined) => void;
        disabled?: boolean;
    };

    // why is eslint like this smh
    // eslint-disable-next-line prefer-const
    let {value = $bindable(""), min, max, step = 1, size, placeholder, integer = true, nullable = false, onchange, disabled}: Props = $props();

    // The bound `value` is a string; all the numeric math below works off this parsed number
    // (undefined means "no value" / empty input).
    const num = $derived(numberCodec.parse(value));

    // Check if the current value is valid (within min/max bounds)
    // undefined and NaN are considered valid (they just mean "no value")
    const isValid = $derived(() => {
        if (num === undefined || Number.isNaN(num)) return true;
        if (min !== undefined && num < min) return false;
        if (max !== undefined && num > max) return false;
        return true;
    });

    // Display value - show empty string if undefined, NaN, or invalid
    const displayValue = $derived.by(() => {
        if (num === undefined || Number.isNaN(num)) return "";
        if (!isValid()) return "";
        return num.toString();
    });

    // Determine if the input should be treated as an integer based on props and value
    const isDetectedAsInteger = $derived.by(() => {
        if (num === undefined || Number.isNaN(num)) return false;
        if (!Number.isInteger(num)) return false;
        if (step !== undefined && !Number.isInteger(step)) return false;
        if (min !== undefined && !Number.isInteger(min)) return false;
        if (max !== undefined && !Number.isInteger(max)) return false;
        return true;
    });

    // Determine if we should enforce integer values based on props
    const isActuallyInteger = $derived.by(() => integer && isDetectedAsInteger);

    // Calculate the number of decimal places to show based on step, min, and max
    const maxDecimalPlaces = $derived(Math.max(countDecimalPlaces(min), countDecimalPlaces(max), countDecimalPlaces(step)));

    $effect(() => {
        if (!size) {
            const referenceValue = (num !== undefined && !Number.isNaN(num) && isValid()) ? num : (max ?? 100);
            size = referenceValue.toString().length + 2;
        }
    });

    function commit(next: number | undefined) {
        value = numberCodec.serialize(next);
        onchange?.(next);
    }

    function increment() {
        // If current value is undefined, NaN, or invalid, start from min (or 0)
        if (num === undefined || Number.isNaN(num) || !isValid()) {
            commit(min ?? 0);
            return;
        }

        const newValue = num + step;
        if (max === undefined || newValue <= max) {
            commit(isActuallyInteger ? newValue : parseFloat(newValue.toFixed(maxDecimalPlaces)));
        }
    }

    function decrement() {
        // If current value is undefined, NaN, or invalid, start from max (or min, or 0)
        if (num === undefined || Number.isNaN(num) || !isValid()) {
            commit(max ?? Math.max(0, min ?? 0));
            return;
        }

        const newValue = num - step;
        if (min === undefined || newValue >= min) {
            commit(isActuallyInteger ? newValue : parseFloat(newValue.toFixed(maxDecimalPlaces)));
        }
    }

    function handleInput(event: Event) {
        const target = event.target as HTMLInputElement;
        const inputText = target.value;

        // Empty input clears the value only when the setting is genuinely unsettable;
        // otherwise leave the stored value alone and let onBlur restore the display.
        if (inputText === "") {
            if (nullable) commit(undefined);
            return;
        }

        const numValue = isActuallyInteger ? parseInt(inputText, 10) : parseFloat(inputText);

        if (!isNaN(numValue)) {
            let constrainedValue = isActuallyInteger ? Math.round(numValue) : numValue;
            if (min !== undefined && constrainedValue < min) constrainedValue = min;
            if (max !== undefined && constrainedValue > max) constrainedValue = max;
            commit(constrainedValue);
        }
        else {
            // Cleanup for this will happen onBlur rather than trying to be smart while they type
        }
    }

    function handleKeyDown(event: KeyboardEvent) {
        if (event.key === "ArrowUp") {
            event.preventDefault();
            increment();
        }
        else if (event.key === "ArrowDown") {
            event.preventDefault();
            decrement();
        }
    }

    // Reset any abnormal user input after they click out
    function onBlur(e: FocusEvent) {
        const target = e.target as HTMLInputElement;
        target.value = displayValue;
    }
</script>


<div class="number-input">
    <input
        type="text"
        value={displayValue}
        {size}
        {placeholder}
        oninput={handleInput}
        onkeydown={handleKeyDown}
        onblur={onBlur}
        {disabled}
    />
    <div class="steppers">
        <button type="button" class="stepper up" onclick={increment} aria-label="增加" {disabled}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m18 15-6-6-6 6" /></svg>
        </button>
        <button type="button" class="stepper down" onclick={decrement} aria-label="减少" {disabled}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6" /></svg>
        </button>
    </div>
</div>


<style>
.number-input {
    position: relative;
    display: inline-flex;
    align-items: center;
}

.number-input input {
    background: var(--bg-level-2);
    border: 1px solid var(--border-input);
    border-radius: var(--radius-level-5);
    outline: none;
    color: inherit;
    text-align: right;
    max-width: 175px;
    padding-right: 24px;
    padding-left: 8px;
    padding-top: 4px;
    padding-bottom: 5px;
    font-size: inherit;
}

.number-input input:focus {
    background: var(--bg-input-focus);
    outline: var(--border-input-focus);
}

.steppers {
    position: absolute;
    right: 4px;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    flex-direction: column;
}

.stepper {
    background: var(--bg-stepper);
    border: none;
    padding: 0px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 11px;
    width: 14px;
}

.stepper.up {
    border-radius: 4px 4px 0 0;
}

.stepper.down {
    border-radius: 0 0 4px 4px;
}

.stepper:active {
    filter: brightness(1.2);
}

.stepper svg {
    stroke: var(--input-icon-color);
}

.stepper:hover svg {
    opacity: 1;
}
</style>