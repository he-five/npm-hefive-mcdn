"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cmdFail = exports.cmdPass = exports.ServiceCommands = exports.McdnCmd = void 0;
const cmdPass = '>';
exports.cmdPass = cmdPass;
const cmdFail = '?';
exports.cmdFail = cmdFail;
var ServiceCommands;
(function (ServiceCommands) {
    ServiceCommands["DISCONNECT"] = "DISCONNECT";
    ServiceCommands["CONNECT"] = "CONNECT";
    ServiceCommands["EMPTY"] = "EMPTY";
    ServiceCommands["STRING"] = "STR";
})(ServiceCommands || (ServiceCommands = {}));
exports.ServiceCommands = ServiceCommands;
class McdnCmd {
    constructor(cmd, data) {
        this.cmd = cmd;
        this.data = data;
    }
}
exports.McdnCmd = McdnCmd;
