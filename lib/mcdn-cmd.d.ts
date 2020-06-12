declare const cmdPass = ">";
declare const cmdFail = "?";
declare enum Commands {
    NONE = "",
    DISCONNECT = "DISCONNECT",
    CONNECT = "CONNECT",
    FW_VER = "FW_VER",
    ENCODER = "ENCODER",
    FOLLOWING_ERROR = "FOLLOWING_ERROR"
}
declare class McdnCmd {
    cmd: Commands;
    data: any;
    constructor(cmd: Commands, data?: any);
}
export { McdnCmd, Commands, cmdPass, cmdFail };
