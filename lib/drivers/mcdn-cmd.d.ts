import { CommandsData } from "../index";
import { Commands } from "../commands";
import { RobotAxisData } from './robot-cmd';
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
    TRACE = "TRACE",
    CH1 = "CH1",
    CH2 = "CH2",
    CH3 = "CH3",
    TRATE = "TRATE",
    TLEVEL = "TLEVEL",
    STOP_TRACE = "STOP_TRACE",
    GET_TRACE_DATA = "GET_TRACE_DATA"
}
declare const Type: {
    Position: number;
    Velocity: number;
    Acceleration: number;
    I2tAccumulator: number;
    PosError: number;
    PidOutput: number;
    TotalCurrent: number;
};
declare const Trigger: {
    MotionBegin: number;
    MotionEnd: number;
    Manual: number;
};
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
    data: string | number | Trace | RobotAxisData | undefined;
    uniqueId: string | undefined;
    constructor(cmd: Commands | ServiceCommands | CommandsData, data?: string | number | RobotAxisData | Trace, uniqueId?: string);
}
export { McdnCmd, ServiceCommands, StatusMask, Trace, Trigger, Type };
