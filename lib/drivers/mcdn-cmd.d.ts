import { Commands } from "../index";
declare const cmdPass = ">";
declare const cmdFail = "?";
declare enum StatusMask {
    AtTarget = 1,
    ServoOn = 2,
    PowerOn = 2,
    IdxCaptured = 16,
    Homed = 32,
    Aligning = 64,
    Aligned = 128,
    Busy = 256,
    OverCurrent = 512,
    Inhibit = 1024,
    PvtEmpty = 2048,
    AmpWarning = 4096,
    AmpFault = 512,
    PosError = 16384,
    Wraparound = 32768
}
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
    constructor(cmd: Commands | ServiceCommands, data: string | any, uniqueId?: string);
}
export { McdnCmd, ServiceCommands, cmdPass, cmdFail, StatusMask };
