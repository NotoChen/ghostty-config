<script lang="ts">
    import Page from "$lib/views/Page.svelte";
    import logo from "$lib/images/icon.webp";
    import Admonition from "$lib/components/Admonition.svelte";
    import Group from "$lib/components/settings/Group.svelte";
    import Checkbox from "$lib/components/settings/Checkbox.svelte";
    import {GHOSTTY_VERSION} from "$lib/data/version";
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
        <Group title="最近更新">
            <ul>
                <li><Checkbox checked />界面、设置说明与提示消息全部改为中文</li>
                <li><Checkbox checked />快捷键列表改为显示真实按键，点击后直接按组合键即可录入</li>
                <li><Checkbox checked />每条快捷键下方用中文说明该操作的作用</li>
                <li><Checkbox checked />「本地配置」页支持上传文件或粘贴文本，静态部署也能对比与合并</li>
                <li><Checkbox checked />写回配置时自动备份、自动校验，并按功能模块分组加中文注释</li>
                <li><Checkbox checked />同步 Ghostty 1.4.0 新增设置：回滚压缩、按键重映射、分屏拖拽把手、命令面板条目等</li>
                <li><Checkbox checked />新增多种专用输入控件：滑块、数字、颜色与时长选择器</li>
                <li><Checkbox checked /><span>主题从上游自动同步 <a href="https://github.com/mbadolato/iTerm2-Color-Schemes/" target="_blank" rel="noopener noreferrer">iTerm2 Color Schemes</a></span></li>
            </ul>
        </Group>
        <Group title="后续计划">
            <ul>
                <li><Checkbox />命令面板构建器</li>
                <li><Checkbox />统一配色方案</li>
                <li><Checkbox />社区预设，快速完成配置</li>
                <li><Checkbox />桌面版 Ghostty Config，可直接读写配置文件</li>
                <li><Checkbox />真正的组件测试</li>
            </ul>
        </Group>
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

    ul {
        /* list-style: "↪ "; */
        /* list-style: "🠶 "; */
        list-style: none;
        padding-left: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        height: 100%;
        justify-content: space-evenly;
    }

    ul li {
        margin-bottom: 5px;
        display: flex;
        align-items: center;
        gap: 8px;
    }
</style>
