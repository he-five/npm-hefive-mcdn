"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Serial = void 0;
const mcdn_cmd_1 = require("./mcdn-cmd");
const driver_replay_1 = require("./driver-replay");
const commands_1 = require("../commands");
const SerialPort = require('serialport');
const HeFiveParser = require('./he-five-parser');
const lineTerminator = '\r\n';
const cmdTerm = '\r';
const asciiEnc = 'ascii';
class Queue {
    constructor(queue) {
        this._queue = queue || [];
    }
    enqueue(item) {
        this._queue.push(item);
    }
    dequeue() {
        return this._queue.shift();
    }
    clear() {
        this._queue = [];
    }
    get count() {
        return this._queue.length;
    }
}
class Serial {
    constructor() {
        this.connected = false;
        this.serialPort = null;
        this.cmd = mcdn_cmd_1.ServiceCommands.CLEAR_BUFF;
        this.queue = new Queue();
        this.cmdInProgress = false;
    }
    connect(portName) {
        if (!this.connected) {
            // Not connected
            this.serialPort = new SerialPort(portName, { baudRate: 115200 }, (err) => {
                var _a;
                if (err) {
                    this.connected = false;
                    (_a = process.send) === null || _a === void 0 ? void 0 : _a.call(process, new driver_replay_1.IpcReply(driver_replay_1.IpcReplyType.ERROR, err.message));
                }
            });
            this.parser = this.serialPort.pipe(new HeFiveParser({ terminators: [mcdn_cmd_1.cmdPass, mcdn_cmd_1.cmdFail] }));
            this.connected = true;
            this.startLisening();
            // Send empty command before starting real-communication
            this.sendCmd(mcdn_cmd_1.ServiceCommands.CLEAR_BUFF);
        }
    }
    sendStr(cmd) {
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
    }
    sendCmd(cmd) {
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
    }
    sendThruPort(cmd, data) {
        this.cmd = cmd;
        let actualCmd = '';
        switch (this.cmd) {
            case commands_1.Commands.FW_VER:
                actualCmd = 'ver';
                break;
            case commands_1.Commands.ENCODER:
                actualCmd = 'pos';
                break;
            case commands_1.Commands.FOLLOWING_ERROR:
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
        this.serialPort.write(`${actualCmd}${cmdTerm}`, asciiEnc, (err) => {
            var _a;
            if (err) {
                (_a = process.send) === null || _a === void 0 ? void 0 : _a.call(process, new driver_replay_1.IpcReply(driver_replay_1.IpcReplyType.ERROR, err.message));
            }
        });
    }
    startLisening() {
        if (!this.connected) {
            return;
        }
        this.parser.on('data', (data) => {
            let strData = data.toString(asciiEnc);
            //console.log('answer:', strData)
            if (strData.length > 0) {
                //new
                let reply = new driver_replay_1.DriverReply();
                reply.cmd = this.cmd;
                strData = strData.trim();
                reply.passed = strData.endsWith(mcdn_cmd_1.cmdPass);
                strData = strData.slice(0, strData.length - 1);
                let position = strData.indexOf(lineTerminator);
                if (position !== -1) {
                    let devStr = strData.slice(position + lineTerminator.length, strData.length);
                    //console.log('deviceId:', devStr)
                    reply.deviceId = parseInt(devStr);
                    if (strData) {
                        reply.answer = strData.slice(0, position);
                    }
                    //console.log('reply.answer:'+ reply.answer)
                }
                this.postProcessAnswer(reply);
            }
        });
        // Open errors will be emitted as an error event
        this.serialPort.on('error', (err) => {
            var _a;
            //this.cmdInProgress = false
            console.log('Error: ', err.message);
            (_a = process.send) === null || _a === void 0 ? void 0 : _a.call(process, new driver_replay_1.IpcReply(driver_replay_1.IpcReplyType.ERROR, err));
        });
    }
    postProcessAnswer(reply) {
        var _a, _b;
        this.cmdInProgress = false;
        switch (reply.cmd) {
            case mcdn_cmd_1.ServiceCommands.CLEAR_BUFF:
                // replay verify
                (_a = process.send) === null || _a === void 0 ? void 0 : _a.call(process, new driver_replay_1.IpcReply(driver_replay_1.IpcReplyType.CONNECTED, true));
                this.checkForPendingCmd();
                return;
            case commands_1.Commands.FW_VER:
                if (reply.answer) {
                    reply.answer = reply.answer.slice(0, reply.answer.indexOf(','));
                }
                break;
        }
        (_b = process.send) === null || _b === void 0 ? void 0 : _b.call(process, new driver_replay_1.IpcReply(driver_replay_1.IpcReplyType.DRV, reply));
        this.checkForPendingCmd();
    }
    checkForPendingCmd() {
        if (this.queue.count > 0) {
            let nextCmd = this.queue.dequeue();
            if (nextCmd) {
                this.sendCmd(nextCmd);
            }
        }
    }
    disconnect() {
        if (!this.connected) {
            return;
        }
        this.connected = false;
        this.serialPort.close();
    }
}
exports.Serial = Serial;
