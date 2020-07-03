"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Status = exports.RelativeMove = exports.CommandReply = exports.McdnDriver = exports.CommandsData = exports.Commands = void 0;
const events_1 = require("events");
const mcdn_cmd_1 = require("./drivers/mcdn-cmd");
const driver_replay_1 = require("./drivers/driver-replay");
const path = require('path');
const SerialPort = require('serialport');
const child_process = require('child_process');
var Commands;
(function (Commands) {
    Commands["FW_VER"] = "FW_VER";
    Commands["ENCODER"] = "ENCODER";
    Commands["FOLLOWING_ERROR"] = "FOLLOWING_ERROR";
    Commands["POWER_ON"] = "POWER_ON";
    Commands["POWER_OFF"] = "POWER_OFF";
    Commands["SERVO_ON"] = "SERVO_ON";
    Commands["SERVO_OFF"] = "SERVO_OFF";
    Commands["STATUS"] = "STATUS";
})(Commands || (Commands = {}));
exports.Commands = Commands;
var CommandsData;
(function (CommandsData) {
    CommandsData["RelativeMove"] = "RelativeMove";
})(CommandsData || (CommandsData = {}));
exports.CommandsData = CommandsData;
class RelativeMove {
    constructor(distance) {
        this.distance = distance;
    }
}
exports.RelativeMove = RelativeMove;
class Status {
    constructor(servoOn, powerOn) {
        this.servoOn = servoOn;
        this.powerOn = powerOn;
    }
}
exports.Status = Status;
class CommandReply {
    constructor(cmd, passed, answer, deviceId) {
        this.cmd = cmd;
        this.passed = passed;
        this.answer = answer;
        this.deviceId = deviceId;
    }
}
exports.CommandReply = CommandReply;
class McdnDriver extends events_1.EventEmitter {
    constructor() {
        super();
        this.driverProcess = null;
        this.connected = false;
        this.callbacksMap = new Map();
        this.sequentialNum = 1;
    }
    enumSerialPorts() {
        SerialPort.list().then((ports) => {
            let portsPath = [];
            ports.forEach((port) => {
                //console.log(port['path'])
                if (port['path']) {
                    portsPath.push(port['path']);
                }
            });
            this.emit('ports', portsPath);
        }, (err) => {
            this.emit('error', err);
            //console.error(err)
        });
    }
    openMcdnPort(portName) {
        let serilOrMcdn = 'mcdn';
        this.createProcess(serilOrMcdn, portName);
    }
    openSerialPort(portName) {
        let serilOrMcdn = 'serial';
        this.createProcess(serilOrMcdn, portName);
    }
    createProcess(serilOrMcdn, portName) {
        var _a;
        this.driverProcess = child_process.fork(path.join(__dirname, '/drivers/index'), [serilOrMcdn]);
        if (this.driverProcess.connected) {
            this.connected = true;
            this.consumeEvents();
            (_a = this.driverProcess) === null || _a === void 0 ? void 0 : _a.send(new mcdn_cmd_1.McdnCmd(mcdn_cmd_1.ServiceCommands.CONNECT, portName));
        }
    }
    disconnect() {
        var _a;
        (_a = this.driverProcess) === null || _a === void 0 ? void 0 : _a.send(new mcdn_cmd_1.McdnCmd(mcdn_cmd_1.ServiceCommands.DISCONNECT, undefined));
    }
    getFwVersion() {
        this.sendCmd(Commands.FW_VER);
    }
    sendCmdData(cmd, data, callback) {
        this.sendToDriver(callback, cmd, data);
    }
    sendCmd(cmd, callback) {
        //console.log(`REQUEST: ${cmd}`)
        let data = undefined;
        // expected driver reply to call callback function too
        this.sendToDriver(callback, cmd, data);
    }
    sendToDriver(callback, cmd, data) {
        var _a, _b;
        if (callback) {
            let key = `${cmd.toString()}_${this.sequentialNum}}`;
            this.sequentialNum++;
            if (this.sequentialNum > 1000) {
                this.sequentialNum = 0;
            }
            this.callbacksMap.set(key, callback);
            //console.log(`sequentialNum: ${this.sequentialNum}`)
            (_a = this.driverProcess) === null || _a === void 0 ? void 0 : _a.send(new mcdn_cmd_1.McdnCmd(cmd, data, key));
        }
        else {
            (_b = this.driverProcess) === null || _b === void 0 ? void 0 : _b.send(new mcdn_cmd_1.McdnCmd(cmd, data));
        }
    }
    sendStr(str) {
        var _a;
        console.log(`STR REQUEST: ${str}`);
        (_a = this.driverProcess) === null || _a === void 0 ? void 0 : _a.send(new mcdn_cmd_1.McdnCmd(mcdn_cmd_1.ServiceCommands.STRING, str));
    }
    consumeEvents() {
        var _a, _b, _c, _d;
        (_a = this.driverProcess) === null || _a === void 0 ? void 0 : _a.on('close', () => {
            //console.log('close')
            this.connected = false;
            this.emit('disconnected');
        });
        (_b = this.driverProcess) === null || _b === void 0 ? void 0 : _b.on('disconnect', () => {
            //console.log('driverProcess disconnect')
        });
        (_c = this.driverProcess) === null || _c === void 0 ? void 0 : _c.on('error', err => {
            //console.log(`error: ${err}`)
            this.emit('error', err);
        });
        (_d = this.driverProcess) === null || _d === void 0 ? void 0 : _d.on('message', (msg) => {
            //console.log(`driverProcess message: ${msg}`)
            if (msg.type == driver_replay_1.IpcReplyType.DRV) {
                let reply = msg.drvReply;
                if (this.callbacksMap.has(reply.callbackId)) {
                    let callbackFunc = this.callbacksMap.get(reply.callbackId);
                    this.callbacksMap.delete(reply.callbackId);
                    try {
                        callbackFunc(new CommandReply(reply.cmd, reply.passed, reply.answer, reply.deviceId));
                    }
                    catch (err) {
                        // TODO something
                    }
                }
            }
            if (msg.type == driver_replay_1.IpcReplyType.DRV) {
                let reply = msg.drvReply;
                this.emit('data', new CommandReply(reply.cmd, reply.passed, reply.answer, reply.deviceId));
            }
            if (msg.type == driver_replay_1.IpcReplyType.ERROR) {
                this.emit('error', msg.err);
            }
            if (msg.type == driver_replay_1.IpcReplyType.CONNECTED) {
                let reply = msg.drvReply;
                this.emit('connected', reply.answer);
            }
        });
    }
}
exports.McdnDriver = McdnDriver;
