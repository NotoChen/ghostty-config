import {cwdAbs} from "../filesystem";
import type {Command} from "../types";
import {ok, s} from "../utils";


const command: Command = {
    desc: "显示当前工作目录",
    fn(_, ctx) {
        return ok([[s.plain(cwdAbs(ctx.user, ctx.cwd()))]]);
    },
};

export default command;