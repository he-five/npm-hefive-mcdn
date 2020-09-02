"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RobotStatus = exports.RobotStatusMask = void 0;
var RobotStatusMask;
(function (RobotStatusMask) {
    RobotStatusMask[RobotStatusMask["Homed"] = 1] = "Homed";
    RobotStatusMask[RobotStatusMask["InMotion"] = 2] = "InMotion";
    RobotStatusMask[RobotStatusMask["Index"] = 8] = "Index";
    RobotStatusMask[RobotStatusMask["LimitPos"] = 16] = "LimitPos";
    RobotStatusMask[RobotStatusMask["MaxError"] = 32] = "MaxError";
    RobotStatusMask[RobotStatusMask["EncoderErr"] = 64] = "EncoderErr";
    RobotStatusMask[RobotStatusMask["ServoOn"] = 128] = "ServoOn";
    RobotStatusMask[RobotStatusMask["Busy"] = 256] = "Busy";
    RobotStatusMask[RobotStatusMask["Inhibit"] = 2048] = "Inhibit";
    RobotStatusMask[RobotStatusMask["Overrun"] = 4096] = "Overrun";
    RobotStatusMask[RobotStatusMask["CurrentOverload"] = 8192] = "CurrentOverload";
    RobotStatusMask[RobotStatusMask["EmergencyStop"] = 16384] = "EmergencyStop";
    RobotStatusMask[RobotStatusMask["PowerFail"] = 32768] = "PowerFail";
})(RobotStatusMask || (RobotStatusMask = {}));
exports.RobotStatusMask = RobotStatusMask;
class RobotStatus {
    constructor() {
        this.inMotion = false;
        this.limitPos = false;
        this.maxError = false;
        this.encoderErr = false;
        this.servoOn = false;
        this.index = false;
        this.inhibit = false;
        this.overrun = false;
        this.currentOverload = false;
        this.emergencyStop = false;
        this.powerFail = false;
        this.homed = false;
        this.busy = false;
    }
}
exports.RobotStatus = RobotStatus;
