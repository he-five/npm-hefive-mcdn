"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IpcReplyType = exports.IpcReply = exports.DriverReply = void 0;
var mcdn_cmd_1 = require("./mcdn-cmd");
var DriverReply = /** @class */ (function () {
    function DriverReply() {
        this.cmd = mcdn_cmd_1.ServiceCommands.CLEAR_BUFF;
        this.passed = false;
        this.answer = null;
        this.deviceId = 1;
    }
    return DriverReply;
}());
exports.DriverReply = DriverReply;
var IpcReplyType;
(function (IpcReplyType) {
    IpcReplyType[IpcReplyType["INVALID"] = 0] = "INVALID";
    IpcReplyType["DRV"] = "DRV";
    IpcReplyType["ERROR"] = "ERR";
    IpcReplyType["CONNECTED"] = "CONNECTED";
    IpcReplyType["DISCONNECTED"] = "DISCONNECTED";
})(IpcReplyType || (IpcReplyType = {}));
exports.IpcReplyType = IpcReplyType;
var IpcReply = /** @class */ (function () {
    function IpcReply(type, data) {
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
    return IpcReply;
}());
exports.IpcReply = IpcReply;
