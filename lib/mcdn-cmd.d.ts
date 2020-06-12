declare const cmdPass = ">";
declare const cmdFail = "?";
declare enum Commands {
    DISCONNECT = "DISCONNECT",
    CONNECT = "CONNECT",
    FW_VER = "FW_VER",
    ENCODER = "ENCODER",
    FOLLOWING_ERROR = "FOLLOWING_ERROR",
    EMPTY = "EMPTY"
}
declare class McdnCmd {
    cmd: Commands;
    data: any;
    constructor(cmd: Commands, data?: any);
}
export { McdnCmd, Commands, cmdPass, cmdFail };
