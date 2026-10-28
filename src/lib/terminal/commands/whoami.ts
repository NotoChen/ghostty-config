import type {Command} from "../types";
import {ok, s} from "../utils";


const command: Command = {
    desc: "显示当前用户名",
    fn(_, ctx) {return ok([[s.plain(ctx.user)]]);},
};

export default command;