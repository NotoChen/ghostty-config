/* eslint-disable spaced-comment */
/// <reference types="node" />
import {spawnSync} from "node:child_process";
import {
    accessSync,
    constants,
    copyFileSync,
    existsSync,
    readFileSync,
    renameSync,
    statSync,
    unlinkSync,
    writeFileSync
} from "node:fs";
import type {IncomingMessage, ServerResponse} from "node:http";
import {homedir, tmpdir} from "node:os";
import {dirname, join} from "node:path";
import type {Plugin} from "vite";

// Local-config bridge.
//
// A browser can't read ~/Library/Application Support/com.mitchellh.ghostty/config.ghostty, so
// `vite dev` / `vite preview` expose it over a loopback-only endpoint. The plugin is registered
// only in those servers — a static build (the deployed site) has no such route, and the UI hides
// the feature when the endpoint 404s.

const ENDPOINT = "/__ghostty/local-config";
const MAX_BODY_BYTES = 2 * 1024 * 1024;

/** Config files Ghostty will actually read, in its own precedence order. */
function candidatePaths(): string[] {
    const home = homedir();
    const xdg = process.env.XDG_CONFIG_HOME?.trim();
    const override = process.env.GHOSTTY_CONFIG_FILE?.trim();
    const candidates: string[] = [];
    if (override) candidates.push(override);
    // macOS: ~/Library/Application Support/com.mitchellh.ghostty/config.ghostty (what this user has)
    candidates.push(
        join(home, "Library", "Application Support", "com.mitchellh.ghostty", "config.ghostty"),
        join(home, "Library", "Application Support", "com.mitchellh.ghostty", "config")
    );
    // Linux / XDG: $XDG_CONFIG_HOME/ghostty/config (or config.ghostty)
    const xdgRoot = xdg && xdg.length > 0 ? xdg : join(home, ".config");
    candidates.push(join(xdgRoot, "ghostty", "config"), join(xdgRoot, "ghostty", "config.ghostty"));
    return candidates;
}

function resolveConfigPath(): string | null {
    for (const path of candidatePaths()) {
        try {
            accessSync(path, constants.R_OK);
            return path;
        }
        catch {
            // not this one
        }
    }
    return null;
}

/** The ghostty binary, if this machine has one; used to validate before writing. */
function resolveGhosttyBinary(): string | null {
    const override = process.env.GHOSTTY_BIN?.trim();
    if (override && existsSync(override)) return override;
    const macBundle = "/Applications/Ghostty.app/Contents/MacOS/ghostty";
    if (existsSync(macBundle)) return macBundle;
    const which = spawnSync("which", ["ghostty"], {encoding: "utf8"});
    const found = which.stdout?.trim();
    return which.status === 0 && found ? found : null;
}

interface ValidationResult {
    ok: boolean;
    message?: string;
    /** Config keys Ghostty complained about, so an existing problem isn't blamed on this write. */
    keys: string[];
}

function validateWithGhostty(text: string): ValidationResult {
    const binary = resolveGhosttyBinary();
    if (!binary) return {ok: true, keys: []}; // No ghostty here: accept, the client already checked the shape.
    const tmpFile = join(tmpdir(), `ghostty-config-validate-${process.pid}-${Date.now()}`);
    try {
        writeFileSync(tmpFile, text, "utf8");
        const result = spawnSync(binary, ["+validate-config", `--config-file=${tmpFile}`], {
            encoding: "utf8",
            timeout: 5000
        });
        if (result.status === 0) return {ok: true, keys: []};
        const output = `${result.stderr ?? ""}${result.stdout ?? ""}`.trim();
        // Ghostty reports either `/path/to/config:LINE:key: reason` or, for errors it can't
        // attribute to a line, `key: reason`. Strip the location prefix, then take the key.
        const keys: string[] = [];
        for (const line of output.split("\n")) {
            const body = line.replace(/^.*?:\d+:/, "").trim();
            const key = /^([a-z][a-z0-9-]*):/.exec(body)?.[1];
            if (key && !keys.includes(key)) keys.push(key);
        }
        return {
            ok: false,
            message: output || `ghostty +validate-config 退出码 ${result.status ?? "未知"}`,
            keys
        };
    }
    catch (err) {
        return {ok: false, message: err instanceof Error ? err.message : String(err), keys: []};
    }
    finally {
        try {
            unlinkSync(tmpFile);
        }
        catch {
            // best effort
        }
    }
}

/** Loopback only: the bridge can overwrite a real user file, so it must not answer off-host. */
function isLoopbackRequest(req: IncomingMessage): boolean {
    const address = req.socket.remoteAddress ?? "";
    const remoteOk = address === "127.0.0.1" || address === "::1" || address === "::ffff:127.0.0.1";
    if (!remoteOk) return false;

    const origin = req.headers.origin;
    if (!origin) return true; // same-origin GET / curl
    try {
        const {hostname} = new URL(origin);
        return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]" || hostname === "::1";
    }
    catch {
        return false;
    }
}

function sendJson(res: ServerResponse, status: number, body: unknown) {
    const payload = JSON.stringify(body);
    res.statusCode = status;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    res.end(payload);
}

function readBody(req: IncomingMessage): Promise<string> {
    return new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];
        let size = 0;
        req.on("data", (chunk: Buffer) => {
            size += chunk.length;
            if (size > MAX_BODY_BYTES) {
                reject(new Error("请求体过大"));
                req.destroy();
                return;
            }
            chunks.push(chunk);
        });
        req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
        req.on("error", reject);
    });
}

function backupPathFor(filePath: string): string {
    const stamp = new Date().toISOString().replace(/[-:]/g, "").replace("T", "-").slice(0, 15);
    return `${filePath}.bak-${stamp}`;
}

async function handle(req: IncomingMessage, res: ServerResponse) {
    if (!isLoopbackRequest(req)) {
        sendJson(res, 403, {error: "只接受本机请求"});
        return;
    }

    if (req.method === "GET") {
        const path = resolveConfigPath();
        if (!path) {
            sendJson(res, 404, {available: false, candidates: candidatePaths()});
            return;
        }
        try {
            // `stat` is what makes an unchanged file short-circuit on the client poll.
            const stat = statSync(path);
            const text = readFileSync(path, "utf8");
            sendJson(res, 200, {available: true, path, text, mtimeMs: stat.mtimeMs, size: stat.size});
        }
        catch (err) {
            sendJson(res, 500, {available: false, error: err instanceof Error ? err.message : String(err)});
        }
        return;
    }

    if (req.method !== "POST") {
        sendJson(res, 405, {error: "不支持的请求方法"});
        return;
    }

    // JSON content type is deliberate: it forces a CORS preflight, and this endpoint never
    // answers one, so a cross-origin page cannot reach it even before the origin check.
    const contentType = req.headers["content-type"] ?? "";
    if (!contentType.includes("application/json")) {
        sendJson(res, 415, {error: "需要 application/json"});
        return;
    }

    let body: unknown;
    try {
        body = JSON.parse(await readBody(req));
    }
    catch (err) {
        sendJson(res, 400, {error: err instanceof Error ? err.message : "无法解析请求体"});
        return;
    }

    const {text, dryRun} = body as {text?: unknown, dryRun?: unknown};
    if (typeof text !== "string") {
        sendJson(res, 400, {error: "缺少 text"});
        return;
    }
    if (text.includes("\u0000")) {
        sendJson(res, 400, {error: "配置文本不能包含空字符"});
        return;
    }

    let warning: string | undefined;
    const validation = validateWithGhostty(text);
    if (!validation.ok) {
        // A file can already contain lines this Ghostty rejects (e.g. the removed `link` key).
        // If this write doesn't add any new offender, let it through with a warning instead of
        // blocking every save behind a problem the user didn't introduce here.
        const path = resolveConfigPath();
        const existing = path && existsSync(path)
            ? validateWithGhostty(readFileSync(path, "utf8"))
            : {ok: false, keys: []};
        const introduced = validation.keys.filter(key => !existing.keys.includes(key));

        if (!existing.ok && introduced.length === 0) {
            warning = `文件本身已有 Ghostty 不接受的行（${existing.keys.join("、") || "未知"}），本次写入没有改动它们。`;
        }
        else {
            sendJson(res, 422, {
                error: "Ghostty 校验未通过",
                detail: validation.message,
                keys: introduced
            });
            return;
        }
    }
    if (dryRun === true) {
        sendJson(res, 200, {ok: true, dryRun: true, warning});
        return;
    }

    const path = resolveConfigPath();
    if (!path) {
        sendJson(res, 404, {error: "没有找到本地 Ghostty 配置文件"});
        return;
    }

    try {
        const backup = backupPathFor(path);
        if (existsSync(path)) copyFileSync(path, backup);
        // Write-then-rename so a crash mid-write can't leave a truncated config behind.
        const tmp = `${path}.tmp-${process.pid}`;
        writeFileSync(tmp, text, "utf8");
        renameSync(tmp, path);
        sendJson(res, 200, {ok: true, path, backup, directory: dirname(path), warning});
    }
    catch (err) {
        sendJson(res, 500, {error: err instanceof Error ? err.message : String(err)});
    }
}

export function localConfigPlugin(): Plugin {
    const install = (middlewares: {use: (fn: (req: IncomingMessage, res: ServerResponse, next: () => void) => void) => void}) => {
        middlewares.use((req, res, next) => {
            const url = req.url ?? "";
            if (!url.startsWith(ENDPOINT)) {
                next();
                return;
            }
            void handle(req, res);
        });
    };

    return {
        name: "ghostty-local-config",
        configureServer(server) {
            install(server.middlewares);
        },
        configurePreviewServer(server) {
            install(server.middlewares);
        }
    };
}

export default localConfigPlugin;
