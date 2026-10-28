import type {Command} from "../types";
import {clear} from "../utils";


const command: Command = {
    desc: "清空终端屏幕",
    fn: () => clear(),
};

export default command;