import { Commands } from "../index";
declare const cmdPass = ">";
declare const cmdFail = "?";
declare enum ServiceCommands {
    DISCONNECT = "DISCONNECT",
    CONNECT = "CONNECT",
    CLEAR_BUFF = "CLEAR_BUFF",
    STRING = "STR"
}
declare class McdnCmd {
    cmd: Commands | ServiceCommands;
    data: any;
    uniqueId: string | undefined;
    constructor(cmd: Commands | ServiceCommands, data: string | undefined, uniqueId?: string);
}
export { McdnCmd, ServiceCommands, cmdPass, cmdFail };
