"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Serial = void 0;
var mcdn_cmd_1 = require("./mcdn-cmd");
var driver_replay_1 = require("./driver-replay");
var index_1 = require("../index");
var SerialPort = require('serialport');
var HeFiveParser = require('./he-five-parser');
var lineTerminator = '\r\n';
var cmdTerm = '\r';
var asciiEnc = 'ascii';
var Queue = /** @class */ (function () {
    function Queue(queue) {
        this._queue = queue || [];
    }
    Queue.prototype.enqueue = function (item) {
        this._queue.push(item);
    };
    Queue.prototype.dequeue = function () {
        return this._queue.shift();
    };
    Queue.prototype.clear = function () {
        this._queue = [];
    };
    Object.defineProperty(Queue.prototype, "count", {
        get: function () {
            return this._queue.length;
        },
        enumerable: false,
        configurable: true
    });
    return Queue;
}());
var Serial = /** @class */ (function () {
    function Serial() {
        this.connected = false;
        this.serialPort = null;
        this.cmd = mcdn_cmd_1.ServiceCommands.CLEAR_BUFF;
        this.queue = new Queue();
        this.cmdInProgress = false;
    }
    Serial.prototype.connect = function (portName) {
        var _this = this;
        if (!this.connected) {
            // Not connected
            this.serialPort = new SerialPort(portName, { baudRate: 115200 }, function (err) {
                var _a;
                if (err) {
                    _this.connected = false;
                    (_a = process.send) === null || _a === void 0 ? void 0 : _a.call(process, new driver_replay_1.IpcReply(driver_replay_1.IpcReplyType.ERROR, err.message));
                }
            });
            this.parser = this.serialPort.pipe(new HeFiveParser({ terminators: [mcdn_cmd_1.cmdPass, mcdn_cmd_1.cmdFail] }));
            this.connected = true;
            this.startLisening();
            // Send empty command before starting real-communication
            this.sendCmd(mcdn_cmd_1.ServiceCommands.CLEAR_BUFF);
        }
    };
    Serial.prototype.sendStr = function (cmd) {
        var _a;
        if (this.connected == false) {
            (_a = process.send) === null || _a === void 0 ? void 0 : _a.call(process, new driver_replay_1.IpcReply(driver_replay_1.IpcReplyType.ERROR, 'Not Connected'));
            return;
        }
        if (this.cmdInProgress == false) {
            this.cmdInProgress = true;
            this.sendThruPort(mcdn_cmd_1.ServiceCommands.STRING, cmd);
        }
        // else{
        //   this.queue.enqueue(cmd);
        // }
    };
    Serial.prototype.sendCmd = function (cmd) {
        var _a;
        if (this.connected == false) {
            (_a = process.send) === null || _a === void 0 ? void 0 : _a.call(process, new driver_replay_1.IpcReply(driver_replay_1.IpcReplyType.ERROR, 'Not Connected'));
            return;
        }
        if (this.cmdInProgress == false) {
            this.cmdInProgress = true;
            this.sendThruPort(cmd);
        }
        else {
            this.queue.enqueue(cmd);
        }
    };
    Serial.prototype.sendThruPort = function (cmd, data) {
        this.cmd = cmd;
        var actualCmd = '';
        switch (this.cmd) {
            case index_1.Commands.FW_VER:
                actualCmd = 'ver';
                break;
            case index_1.Commands.ENCODER:
                actualCmd = 'pos';
                break;
            case index_1.Commands.FOLLOWING_ERROR:
                actualCmd = 'err';
                break;
            case mcdn_cmd_1.ServiceCommands.CLEAR_BUFF:
                actualCmd = ' ';
                break;
            case mcdn_cmd_1.ServiceCommands.STRING:
                actualCmd = data;
                break;
        }
        //console.log(`${actualCmd}${cmdTerm}`)
        this.serialPort.write("" + actualCmd + cmdTerm, asciiEnc, function (err) {
            var _a;
            if (err) {
                (_a = process.send) === null || _a === void 0 ? void 0 : _a.call(process, new driver_replay_1.IpcReply(driver_replay_1.IpcReplyType.ERROR, err.message));
            }
        });
    };
    Serial.prototype.startLisening = function () {
        var _this = this;
        if (!this.connected) {
            return;
        }
        this.parser.on('data', function (data) {
            var strData = data.toString(asciiEnc);
            //console.log('answer:', strData)
            if (strData.length > 0) {
                //new
                var reply = new driver_replay_1.DriverReply();
                reply.cmd = _this.cmd;
                strData = strData.trim();
                reply.passed = strData.endsWith(mcdn_cmd_1.cmdPass);
                strData = strData.slice(0, strData.length - 1);
                var position = strData.indexOf(lineTerminator);
                if (position !== -1) {
                    var devStr = strData.slice(position + lineTerminator.length, strData.length);
                    //console.log('deviceId:', devStr)
                    reply.deviceId = parseInt(devStr);
                    if (strData) {
                        reply.answer = strData.slice(0, position);
                    }
                    //console.log('reply.answer:'+ reply.answer)
                }
                _this.postProcessAnswer(reply);
            }
        });
        // Open errors will be emitted as an error event
        this.serialPort.on('error', function (err) {
            var _a;
            //this.cmdInProgress = false
            console.log('Error: ', err.message);
            (_a = process.send) === null || _a === void 0 ? void 0 : _a.call(process, new driver_replay_1.IpcReply(driver_replay_1.IpcReplyType.ERROR, err));
        });
    };
    Serial.prototype.postProcessAnswer = function (reply) {
        var _a, _b;
        this.cmdInProgress = false;
        switch (reply.cmd) {
            case mcdn_cmd_1.ServiceCommands.CLEAR_BUFF:
                // replay verify
                (_a = process.send) === null || _a === void 0 ? void 0 : _a.call(process, new driver_replay_1.IpcReply(driver_replay_1.IpcReplyType.CONNECTED, true));
                this.checkForPendingCmd();
                return;
            case index_1.Commands.FW_VER:
                if (reply.answer) {
                    reply.answer = reply.answer.slice(0, reply.answer.indexOf(','));
                }
                break;
        }
        (_b = process.send) === null || _b === void 0 ? void 0 : _b.call(process, new driver_replay_1.IpcReply(driver_replay_1.IpcReplyType.DRV, reply));
        this.checkForPendingCmd();
    };
    Serial.prototype.checkForPendingCmd = function () {
        if (this.queue.count > 0) {
            var nextCmd = this.queue.dequeue();
            if (nextCmd) {
                this.sendCmd(nextCmd);
            }
        }
    };
    Serial.prototype.disconnect = function () {
        if (!this.connected) {
            return;
        }
        this.connected = false;
        this.serialPort.close();
    };
    return Serial;
}());
exports.Serial = Serial;
