<script lang="ts">
    // Static sample output: enough shapes (prompt, ls colors, git status, 256-color strip) to
    // judge a color scheme at a glance. It reads nothing but the `--config-*` custom properties
    // its wrapper sets, so two instances can show two different configs side by side.
</script>

<div class="sample">
    <div class="line"><span class="p2">ghostty@config-app</span> <span class="p4">~</span> <span class="p6">%</span> ls --color</div>
    <div class="line"><span class="p4">Downloads</span>   <span class="p4">ghostty</span>   <span class="p4">themes</span>   <span class="p1">notes.md</span>   <span class="p6">config.ghostty</span></div>
    <div class="line"><span class="p2">ghostty@config-app</span> <span class="p4">~</span> <span class="p6">%</span> git status</div>
    <div class="line"><span class="p5">On branch main</span></div>
    <div class="line">Changes not staged for commit:</div>
    <div class="line">        <span class="p3">modified:</span>   src/config.ts</div>
    <div class="line">        <span class="p3">new file:</span>   src/theme.ts</div>
    <div class="line"><span class="p2">ghostty@config-app</span> <span class="p4">~</span> <span class="p6">%</span> <span class="cursor"></span></div>
    <div class="swatches">
        {#each Array.from({length: 16}, (_, i) => i) as i (i)}
            <span class="swatch" style:background={`var(--config-palette-${i})`}></span>
        {/each}
    </div>
</div>

<style>
.sample {
    background: var(--config-bg);
    color: var(--config-fg);
    font-family: var(--config-font-family);
    font-size: var(--config-font-size);
    padding: 10px 12px;
    border-radius: var(--radius-level-3);
    border: 1px solid rgba(0, 0, 0, 0.5);
    box-shadow: 0 0 1px rgba(255, 255, 255, 0.35) inset;
    line-height: 1.5;
    overflow: hidden;
    min-height: 130px;
}

.line {
    white-space: pre;
}

.p1 {color: var(--config-palette-1);}
.p2 {color: var(--config-palette-2);}
.p3 {color: var(--config-palette-3);}
.p4 {color: var(--config-palette-4);}
.p5 {color: var(--config-palette-5);}
.p6 {color: var(--config-palette-6);}

.cursor {
    display: inline-block;
    width: 0.6em;
    height: 1em;
    vertical-align: text-bottom;
    background: var(--config-cursor-color);
    opacity: var(--config-cursor-opacity);
}

.swatches {
    display: flex;
    gap: 3px;
    margin-top: 8px;
}

.swatch {
    flex: 1;
    height: 10px;
    border-radius: 2px;
}
</style>
