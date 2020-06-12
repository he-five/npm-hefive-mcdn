"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IpcReplyType = exports.IpcReply = exports.DriverReply = void 0;
const mcdn_cmd_1 = require("../mcdn-cmd");
class DriverReply {
    constructor() {
        this.cmd = mcdn_cmd_1.Commands.EMPTY;
        this.passed = false;
        this.answer = null;
        this.deviceId = 1;
    }
}
exports.DriverReply = DriverReply;
var IpcReplyType;
(function (IpcReplyType) {
    IpcReplyType[IpcReplyType["INVALID"] = 0] = "INVALID";
    IpcReplyType["DRV"] = "DRV";
    IpcReplyType["ERROR"] = "ERR";
})(IpcReplyType || (IpcReplyType = {}));
exports.IpcReplyType = IpcReplyType;
class IpcReply {
    constructor(type, data) {
        this.type = type;
        this.drvReply = undefined;
        this.err = '';
        switch (type) {
            case IpcReplyType.DRV:
                this.drvReply = data;
                break;
            case IpcReplyType.ERROR:
                this.err = data;
                break;
            default:
            // ERROR
        }
    }
}
exports.IpcReply = IpcReply;
