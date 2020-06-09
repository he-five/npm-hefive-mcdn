"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DriverReply = void 0;
const mcdn_cmd_1 = require("./mcdn-cmd");
class DriverReply {
    constructor() {
        this.cmd = mcdn_cmd_1.Commands.NONE;
        this.passed = false;
        this.data = null;
        this.netId = 1;
    }
}
exports.DriverReply = DriverReply;
