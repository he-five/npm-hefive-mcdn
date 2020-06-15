import { Commands } from "../commands";
declare const cmdPass = ">";
declare const cmdFail = "?";
declare enum ServiceCommands {
    DISCONNECT = "DISCONNECT",
    CONNECT = "CONNECT",
    EMPTY = "EMPTY",
    STRING = "STR"
}
declare class McdnCmd {
    cmd: Commands | ServiceCommands;
    data: any;
    constructor(cmd: Commands | ServiceCommands, data?: string);
}
export { McdnCmd, ServiceCommands, cmdPass, cmdFail };
