"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RobotInfo = exports.RobotAuxErrorMask = exports.RobotAuxError = exports.RobotAxisData = exports.RobotStatus = exports.RobotStatusMask = void 0;
var RobotStatusMask;
(function (RobotStatusMask) {
    RobotStatusMask[RobotStatusMask["IndexAcq"] = 1] = "IndexAcq";
    RobotStatusMask[RobotStatusMask["FwrdLimit"] = 2] = "FwrdLimit";
    RobotStatusMask[RobotStatusMask["RvsLimit"] = 4] = "RvsLimit";
    RobotStatusMask[RobotStatusMask["Index"] = 8] = "Index";
    RobotStatusMask[RobotStatusMask["Wraparound"] = 16] = "Wraparound";
    RobotStatusMask[RobotStatusMask["AccPhase"] = 32] = "AccPhase";
    RobotStatusMask[RobotStatusMask["PathPoint"] = 64] = "PathPoint";
    RobotStatusMask[RobotStatusMask["ServoOn"] = 128] = "ServoOn";
    RobotStatusMask[RobotStatusMask["Busy"] = 256] = "Busy";
    RobotStatusMask[RobotStatusMask["MaxPos"] = 512] = "MaxPos";
    RobotStatusMask[RobotStatusMask["MotionCompleted"] = 1024] = "MotionCompleted";
    RobotStatusMask[RobotStatusMask["Inhibit"] = 2048] = "Inhibit";
    RobotStatusMask[RobotStatusMask["Overrun"] = 4096] = "Overrun";
    RobotStatusMask[RobotStatusMask["CurrentOverload"] = 8192] = "CurrentOverload";
    RobotStatusMask[RobotStatusMask["DigitalOverload"] = 16384] = "DigitalOverload";
    RobotStatusMask[RobotStatusMask["PowerFail"] = 32768] = "PowerFail";
    RobotStatusMask[RobotStatusMask["UserMacroRunning"] = 134217728] = "UserMacroRunning";
    RobotStatusMask[RobotStatusMask["SysMacroRunning"] = 4194304] = "SysMacroRunning";
})(RobotStatusMask || (RobotStatusMask = {}));
exports.RobotStatusMask = RobotStatusMask;
var RobotAuxErrorMask;
(function (RobotAuxErrorMask) {
    RobotAuxErrorMask[RobotAuxErrorMask["auxGetFail"] = 1] = "auxGetFail";
    RobotAuxErrorMask[RobotAuxErrorMask["auxPutFail"] = 2] = "auxPutFail";
    RobotAuxErrorMask[RobotAuxErrorMask["auxFlpFail"] = 4] = "auxFlpFail";
})(RobotAuxErrorMask || (RobotAuxErrorMask = {}));
exports.RobotAuxErrorMask = RobotAuxErrorMask;
class RobotAuxError {
    constructor() {
        this.getFail = false;
        this.putFail = false;
        this.flipFail = false;
    }
}
exports.RobotAuxError = RobotAuxError;
class RobotStatus {
    constructor() {
        this.fwrdLimit = false;
        this.wraparound = false;
        this.accPhase = false;
        this.busy = false;
        this.servoOn = false;
        this.index = false;
        this.inhibit = false;
        this.overrun = false;
        this.currentOverload = false;
        this.digitalOverload = false;
        this.powerFail = false;
        this.indexAcq = false;
        this.busy = false;
        this.maxPos = false;
        this.inMotion = false;
        this.rvsLimit = false;
        this.pathPoint = false;
        this.userMacroRunning = false;
        this.sysMacroRunning = false;
    }
}
exports.RobotStatus = RobotStatus;
class RobotAxisData {
    constructor(name, value) {
        this.name = name;
        this.value = value;
    }
}
exports.RobotAxisData = RobotAxisData;
class RobotInfo {
    constructor(ver, sn, type) {
        this.ver = ver;
        this.sn = sn;
        this.type = type;
    }
}
exports.RobotInfo = RobotInfo;
