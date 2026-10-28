import type {Command} from "../types";
import {ok, s} from "../utils";


const command: Command = {
    desc: "显示当前日期和时间",
    fn() {return ok([[s.plain(new Date().toString())]]);},
};

export default command;