import {getNode, resolveParts} from "../filesystem";
import type {Command} from "../types";
import {err, ok} from "../utils";


const command: Command = {
    desc: "切换目录",
    usage: "[path]",
    details: ["不带参数时返回主目录（~）。", "支持 ~、.. 以及绝对路径。"],
    fn(args, ctx) {
        const target = args[0] ?? "~";
        const parts = resolveParts(ctx.cwd(), target);
        const node = getNode(ctx.root, parts);
        if (!node) return err(`cd: no such file or directory: ${target}`);
        if (node.type !== "dir") return err(`cd: not a directory: ${target}`);
        ctx.setCwd(parts);
        return ok([]);
    },
};

export default command;