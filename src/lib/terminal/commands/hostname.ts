import type {Command} from "../types";
import {ok, s} from "../utils";


const command: Command = {
    desc: "显示系统主机名",
    fn(_, ctx) {return ok([[s.plain(ctx.host)]]);},
};

export default command;