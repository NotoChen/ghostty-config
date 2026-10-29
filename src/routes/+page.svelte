<script lang="ts">
    import Page from "#lib/views/Page.svelte";
    import logo from "#lib/images/icon.webp";
    import Admonition from "#lib/components/Admonition.svelte";
    import {GHOSTTY_VERSION} from "#lib/data/version";
</script>

<Page title="Ghostty Config">
    <section>
        <div class="user">
            <div class="user-avatar">
                <img src={logo} alt="Ghostty Config 标志" />
            </div>
            <div class="user-label">
                <div class="user-name">Ghostty Config</div>
                <div class="user-subtext">作者 <a href="https://github.com/NotoChen" target="_blank" rel="noopener noreferrer">@NotoChen</a></div>
            </div>
        </div>
        <Admonition>
            这个工具<em>一定</em>还有 bug！遇到问题或有建议，欢迎
            <a href="https://github.com/NotoChen/ghostty-config/issues" target="_blank" rel="noopener noreferrer">在 GitHub 上反馈</a>。<br />
            设置项按 <strong>Ghostty {GHOSTTY_VERSION}</strong> 的配置规范逐条核对，版本号与 Ghostty 同步。
        </Admonition>
    </section>
</Page>

<style>
    section {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        flex: 0.6;
    }

    .user {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 8px;
        margin: 20px 0;
    }

    .user-avatar img {
        height: 100%;
        width: 100%;
    }

    .user-avatar {
        display: inline-flex;
        justify-content: center;
        align-items: center;
        background: linear-gradient(#03028f, #09043a);
        height: 100px;
        width: 100px;
        border-radius: 50%;
        /* border: 2px solid black; */
        /* box-shadow: 0 0 0 2px white; */
    }

    .user-label {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 5px;
    }

    .user-name {
        position: relative;
        display: flex;
        justify-content: center;
        font-size: 1.3rem;
        color: var(--font-color);
        font-weight: 600;
    }

    .user-subtext {
        display: flex;
        justify-content: center;
        font-size: 1.1rem;
        gap: 3px;
    }

</style>
