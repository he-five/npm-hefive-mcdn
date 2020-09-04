"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RobotAxes = exports.RobotData = exports.RobotStatus = exports.RobotStatusMask = void 0;
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
    RobotStatusMask[RobotStatusMask["EncError"] = 256] = "EncError";
    RobotStatusMask[RobotStatusMask["MaxPos"] = 512] = "MaxPos";
    RobotStatusMask[RobotStatusMask["InMotion"] = 1024] = "InMotion";
    RobotStatusMask[RobotStatusMask["Inhibit"] = 2048] = "Inhibit";
    RobotStatusMask[RobotStatusMask["Overrun"] = 4096] = "Overrun";
    RobotStatusMask[RobotStatusMask["CurrentOverload"] = 8192] = "CurrentOverload";
    RobotStatusMask[RobotStatusMask["DigitalOverload"] = 16384] = "DigitalOverload";
    RobotStatusMask[RobotStatusMask["PowerFail"] = 32768] = "PowerFail";
})(RobotStatusMask || (RobotStatusMask = {}));
exports.RobotStatusMask = RobotStatusMask;
var RobotAxes;
(function (RobotAxes) {
    RobotAxes[RobotAxes["T"] = 0] = "T";
    RobotAxes[RobotAxes["R"] = 1] = "R";
    RobotAxes[RobotAxes["R2"] = 2] = "R2";
    RobotAxes[RobotAxes["Z"] = 3] = "Z";
    RobotAxes[RobotAxes["X"] = 4] = "X";
})(RobotAxes || (RobotAxes = {}));
exports.RobotAxes = RobotAxes;
class RobotStatus {
    constructor() {
        this.fwrdLimit = false;
        this.wraparound = false;
        this.accPhase = false;
        this.encError = false;
        this.servoOn = false;
        this.index = false;
        this.inhibit = false;
        this.overrun = false;
        this.currentOverload = false;
        this.digitalOverload = false;
        this.powerFail = false;
        this.indexAcq = false;
        this.encError = false;
        this.maxPos = false;
        this.inMotion = false;
        this.rvsLimit = false;
        this.pathPoint = false;
    }
}
exports.RobotStatus = RobotStatus;
class RobotData {
    constructor(axis, distance) {
        this.axis = axis;
        this.distance = distance;
    }
}
exports.RobotData = RobotData;
