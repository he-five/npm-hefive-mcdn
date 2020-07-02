"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatusMask = exports.cmdFail = exports.cmdPass = exports.ServiceCommands = exports.McdnCmd = void 0;
const cmdPass = '>';
exports.cmdPass = cmdPass;
const cmdFail = '?';
exports.cmdFail = cmdFail;
var StatusMask;
(function (StatusMask) {
    StatusMask[StatusMask["AtTarget"] = 1] = "AtTarget";
    StatusMask[StatusMask["ServoOn"] = 2] = "ServoOn";
    StatusMask[StatusMask["PowerOn"] = 2] = "PowerOn";
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
})(ServiceCommands || (ServiceCommands = {}));
exports.ServiceCommands = ServiceCommands;
class McdnCmd {
    constructor(cmd, data, uniqueId) {
        this.cmd = cmd;
        this.data = data;
        this.uniqueId = uniqueId;
    }
}
exports.McdnCmd = McdnCmd;
