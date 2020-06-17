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
