import type {Command} from "../types";
import {ok, s} from "../utils";


const command: Command = {
    desc: "显示系统信息",
    usage: "[-a]",
    details: ["-a  显示全部信息"],
    fn(args, ctx) {
        return ok([[s.plain(args.includes("-a")
            ? `Linux ${ctx.host} 6.1.0 #1 SMP x86_64 GNU/Linux`
            : "Linux")]]);
    },
};

export default command;