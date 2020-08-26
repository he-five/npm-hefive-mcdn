import { CommandsData } from "../index";
import { Commands } from "../commands";
declare const cmdPass = ">";
declare const cmdFail = "?";
declare enum StatusMask {
    AtTarget = 1,
    ServoOn = 2,
    PowerOn = 4,
    PosCaptured = 8,
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
    STRING = "STR",
    TRACE = "TRACE"
}
declare class Trace {
    channel1Type: number;
    channel2Type: number;
    channel3Type: number;
    trigger: number;
    level: number;
    rateInMicrosecond: number;
    constructor(trigger?: number, rateInMicrosecond?: number);
}
declare class McdnCmd {
    cmd: Commands | ServiceCommands | CommandsData;
    data: string | number | Trace | undefined;
    uniqueId: string | undefined;
    constructor(cmd: Commands | ServiceCommands | CommandsData, data?: string | number | Trace, uniqueId?: string);
}
export { McdnCmd, ServiceCommands, cmdPass, cmdFail, StatusMask, Trace };
