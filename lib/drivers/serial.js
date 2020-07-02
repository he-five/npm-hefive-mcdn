"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Serial = void 0;
const mcdn_cmd_1 = require("./mcdn-cmd");
const driver_replay_1 = require("./driver-replay");
const index_1 = require("../index");
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
        this.serialPort = null;
        this.cmd = mcdn_cmd_1.ServiceCommands.CLEAR_BUFF;
        this.queue = new Queue();
        this.cmdInProgress = false;
        this.cmdSendTime = 0;
        this.timer = undefined;
    }
    connect(portName) {
        var _a;
        if (!((_a = this.serialPort) === null || _a === void 0 ? void 0 : _a.connected)) {
            // Not connected
            this.serialPort = new SerialPort(portName, { baudRate: 115200 }, (err) => {
                var _a;
                if (err) {
                    (_a = process.send) === null || _a === void 0 ? void 0 : _a.call(process, new driver_replay_1.IpcReply(driver_replay_1.IpcReplyType.ERROR, err.message));
                }
            });
            this.parser = this.serialPort.pipe(new HeFiveParser({ terminators: [mcdn_cmd_1.cmdPass, mcdn_cmd_1.cmdFail] }));
            this.startListening();
            // Send empty command before starting real communication
            this.sendCmd(new mcdn_cmd_1.McdnCmd(mcdn_cmd_1.ServiceCommands.CLEAR_BUFF, undefined));
            this.timer = setInterval(() => {
                var _a, _b;
                if (this.cmdInProgress) {
                    if ((Date.now() - this.cmdSendTime) > 500) {
                        switch (this.cmd) {
                            case mcdn_cmd_1.ServiceCommands.CLEAR_BUFF:
                                let reply = new driver_replay_1.DriverReply();
                                reply.cmd = this.cmd;
                                reply.callbackId = this.callbacId;
                                reply.answer = false;
                                (_a = process.send) === null || _a === void 0 ? void 0 : _a.call(process, new driver_replay_1.IpcReply(driver_replay_1.IpcReplyType.CONNECTED, reply));
                                this.disconnect();
                                break;
                            default:
                                (_b = process.send) === null || _b === void 0 ? void 0 : _b.call(process, new driver_replay_1.IpcReply(driver_replay_1.IpcReplyType.ERROR, `Command ${this.cmd} Timeout`));
                                this.cmdInProgress = false;
                        }
                    }
                }
            }, 50);
        }
    }
    sendCmd(cmd) {
        var _a;
        if (this.serialPort.connected == false) {
            (_a = process.send) === null || _a === void 0 ? void 0 : _a.call(process, new driver_replay_1.IpcReply(driver_replay_1.IpcReplyType.ERROR, 'Not Connected'));
            return;
        }
        if (this.cmdInProgress == false) {
            this.sendThruPort(cmd);
        }
        else {
            this.queue.enqueue(cmd);
        }
    }
    sendThruPort(cmd) {
        this.cmdInProgress = true;
        this.cmd = cmd.cmd;
        this.callbacId = cmd.uniqueId;
        this.cmdSendTime = Date.now();
        let actualCmd = '';
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
            case index_1.Commands.POWER_ON:
                actualCmd = 'enable';
                break;
            case index_1.Commands.POWER_OFF:
                actualCmd = 'disable';
                break;
            case index_1.Commands.SERVO_ON:
                actualCmd = 'on';
                break;
            case index_1.Commands.SERVO_OFF:
                actualCmd = 'off';
                break;
            case index_1.Commands.RelativeMove:
                let data = cmd.data;
                actualCmd = `rel ${data.distance}${cmdTerm}go`;
                break;
            case index_1.Commands.STATUS:
                actualCmd = `sta`;
                break;
            case mcdn_cmd_1.ServiceCommands.CLEAR_BUFF:
                actualCmd = ' ';
                break;
            case mcdn_cmd_1.ServiceCommands.STRING:
                actualCmd = cmd.data;
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
    startListening() {
        this.parser.on('data', (data) => {
            let strData = data.toString(asciiEnc);
            //console.log('answer:', strData)
            if (strData.length > 0) {
                //new
                let reply = new driver_replay_1.DriverReply();
                reply.cmd = this.cmd;
                reply.callbackId = this.callbacId;
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
            this.cmdInProgress = false;
            console.log('Error: ', err.message);
            (_a = process.send) === null || _a === void 0 ? void 0 : _a.call(process, new driver_replay_1.IpcReply(driver_replay_1.IpcReplyType.ERROR, err));
        });
        // The close event is emitted when the port is closed
        this.serialPort.on('close', () => {
            process.exit(0);
        });
    }
    postProcessAnswer(reply) {
        var _a, _b;
        this.cmdInProgress = false;
        switch (reply.cmd) {
            case mcdn_cmd_1.ServiceCommands.CLEAR_BUFF:
                // replay verify
                reply.answer = true;
                (_a = process.send) === null || _a === void 0 ? void 0 : _a.call(process, new driver_replay_1.IpcReply(driver_replay_1.IpcReplyType.CONNECTED, reply));
                return;
            case index_1.Commands.FW_VER:
                if (reply.answer) {
                    reply.answer = reply.answer.slice(0, reply.answer.indexOf(','));
                }
                break;
            case index_1.Commands.STATUS:
                if (reply.answer) {
                    let num = parseInt(reply.answer, 16);
                    let servoOn = (num & mcdn_cmd_1.StatusMask.ServoOn) == 0 ? false : true;
                    let powerOn = (num & mcdn_cmd_1.StatusMask.PowerOn) == 0 ? false : true;
                    reply.answer = new index_1.Status(servoOn, powerOn);
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
        if (!this.serialPort.connected) {
            process.exit(0);
            return;
        }
        this.serialPort.close();
    }
}
exports.Serial = Serial;
