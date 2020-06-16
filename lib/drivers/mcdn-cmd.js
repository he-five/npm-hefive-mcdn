"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cmdFail = exports.cmdPass = exports.ServiceCommands = exports.McdnCmd = void 0;
var cmdPass = '>';
exports.cmdPass = cmdPass;
var cmdFail = '?';
exports.cmdFail = cmdFail;
var ServiceCommands;
(function (ServiceCommands) {
    ServiceCommands["DISCONNECT"] = "DISCONNECT";
    ServiceCommands["CONNECT"] = "CONNECT";
    ServiceCommands["CLEAR_BUFF"] = "CLEAR_BUFF";
    ServiceCommands["STRING"] = "STR";
})(ServiceCommands || (ServiceCommands = {}));
exports.ServiceCommands = ServiceCommands;
var McdnCmd = /** @class */ (function () {
    function McdnCmd(cmd, data) {
        this.cmd = cmd;
        this.data = data;
    }
    return McdnCmd;
}());
exports.McdnCmd = McdnCmd;
