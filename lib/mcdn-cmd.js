"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CmdPass = exports.CmdFail = exports.Commands = exports.McdnCmd = void 0;
const CmdPass = '>';
exports.CmdPass = CmdPass;
const CmdFail = '?';
exports.CmdFail = CmdFail;
var Commands;
(function (Commands) {
    Commands["NONE"] = "";
    Commands["DISCONNECT"] = "DISCONNECT";
    Commands["CONNECT"] = "CONNECT";
    Commands["FW_VER"] = "FW_VER";
})(Commands || (Commands = {}));
exports.Commands = Commands;
class McdnCmd {
    constructor(cmd, data) {
        this.cmd = cmd;
        this.data = data;
    }
}
exports.McdnCmd = McdnCmd;
