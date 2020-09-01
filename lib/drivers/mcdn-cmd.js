"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Type = exports.Trigger = exports.Trace = exports.StatusMask = exports.cmdFail = exports.cmdPass = exports.ServiceCommands = exports.McdnCmd = void 0;
const cmdPass = '>';
exports.cmdPass = cmdPass;
const cmdFail = '?';
exports.cmdFail = cmdFail;
var StatusMask;
(function (StatusMask) {
    StatusMask[StatusMask["AtTarget"] = 1] = "AtTarget";
    StatusMask[StatusMask["ServoOn"] = 2] = "ServoOn";
    StatusMask[StatusMask["PowerOn"] = 4] = "PowerOn";
    StatusMask[StatusMask["PosCaptured"] = 8] = "PosCaptured";
    StatusMask[StatusMask["IdxCaptured"] = 16] = "IdxCaptured";
    StatusMask[StatusMask["Homed"] = 32] = "Homed";
    StatusMask[StatusMask["Aligning"] = 64] = "Aligning";
    StatusMask[StatusMask["Aligned"] = 128] = "Aligned";
    StatusMask[StatusMask["Busy"] = 256] = "Busy";
    StatusMask[StatusMask["OverCurrent"] = 512] = "OverCurrent";
    StatusMask[StatusMask["Inhibit"] = 1024] = "Inhibit";
    StatusMask[StatusMask["PvtEmpty"] = 2048] = "PvtEmpty";
    StatusMask[StatusMask["AmpWarning"] = 4096] = "AmpWarning";
    StatusMask[StatusMask["AmpFault"] = 512] = "AmpFault";
    StatusMask[StatusMask["PosError"] = 16384] = "PosError";
    StatusMask[StatusMask["Wraparound"] = 32768] = "Wraparound";
})(StatusMask || (StatusMask = {}));
exports.StatusMask = StatusMask;
var ServiceCommands;
(function (ServiceCommands) {
    ServiceCommands["DISCONNECT"] = "DISCONNECT";
    ServiceCommands["CONNECT"] = "CONNECT";
    ServiceCommands["CLEAR_BUFF"] = "CLEAR_BUFF";
    ServiceCommands["STRING"] = "STR";
    ServiceCommands["TRACE"] = "TRACE";
    ServiceCommands["STOP_TRACE"] = "STOP_TRACE";
    ServiceCommands["GET_TRACE_DATA"] = "GET_TRACE_DATA";
})(ServiceCommands || (ServiceCommands = {}));
exports.ServiceCommands = ServiceCommands;
const Type = {
    Position: 0,
    Velocity: 1,
    Acceleration: 2,
    I2tAccumulator: 3,
    PosError: 8,
    PidOutput: 9,
    TotalCurrent: 10
};
exports.Type = Type;
const Trigger = {
    MotionBegin: 7,
    MotionEnd: 3,
    Manual: 0,
};
exports.Trigger = Trigger;
class Trace {
    constructor(trigger = Trigger.Manual, rateInMicrosecond = 5000) {
        this.channel1Type = Type.Velocity;
        this.channel2Type = Type.PosError;
        this.channel3Type = Type.PosError;
        this.trigger = trigger;
        this.level = 0;
        this.rateInMicrosecond = rateInMicrosecond;
    }
}
exports.Trace = Trace;
class McdnCmd {
    constructor(cmd, data, uniqueId) {
        this.cmd = cmd;
        this.data = data;
        this.uniqueId = uniqueId;
    }
}
exports.McdnCmd = McdnCmd;
