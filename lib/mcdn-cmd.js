"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cmdFail = exports.cmdPass = exports.Commands = exports.McdnCmd = void 0;
const cmdPass = '>';
exports.cmdPass = cmdPass;
const cmdFail = '?';
exports.cmdFail = cmdFail;
var Commands;
(function (Commands) {
    Commands["DISCONNECT"] = "DISCONNECT";
    Commands["CONNECT"] = "CONNECT";
    Commands["FW_VER"] = "FW_VER";
    Commands["ENCODER"] = "ENCODER";
    Commands["FOLLOWING_ERROR"] = "FOLLOWING_ERROR";
    Commands["EMPTY"] = "EMPTY";
    Commands["STRING"] = "STR";
})(Commands || (Commands = {}));
exports.Commands = Commands;
class McdnCmd {
    constructor(cmd, data) {
        this.cmd = cmd;
        this.data = data;
    }
}
exports.McdnCmd = McdnCmd;
