"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Commands = exports.McdnCmd = void 0;
var Commands;
(function (Commands) {
    Commands["DISCONNECT"] = "DISCONNECT";
    Commands["CONNECT"] = "CONNECT";
})(Commands || (Commands = {}));
exports.Commands = Commands;
class McdnCmd {
    constructor(cmd, data) {
        this.cmd = cmd;
        this.data = data;
    }
}
exports.McdnCmd = McdnCmd;
