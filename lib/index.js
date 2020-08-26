"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceCommands = exports.Inputs = exports.SerialPortType = exports.SerialPortInfo = exports.Status = exports.CommandReply = exports.McdnDriver = void 0;
const events_1 = require("events");
const mcdn_cmd_1 = require("./drivers/mcdn-cmd");
Object.defineProperty(exports, "ServiceCommands", { enumerable: true, get: function () { return mcdn_cmd_1.ServiceCommands; } });
const driver_replay_1 = require("./drivers/driver-replay");
const commands_1 = require("./commands");
const path = require('path');
const SerialPort = require('serialport');
const child_process = require('child_process');
class Status {
    constructor() {
        this.servoOn = false;
        this.powerOn = false;
        this.moving = false;
        this.positionCaptured = false;
        this.indexCaptured = false;
        this.homingCompleted = false;
        this.phaseAligning = false;
        this.phaseAlignmentCompleted = false;
        this.busy = false;
        this.overCurrent = false;
        this.pvtQueueFull = false;
        this.pvtQueueEmpty = false;
        this.overCurrentWarning = false;
        this.amplifierCurrentLimit = false;
        this.followingErrorLimit = false;
        this.counterWrapAround = false;
    }
}
exports.Status = Status;
class Inputs {
    constructor() {
        this.axis1HallAActive = false;
        this.axis1HallBActive = false;
        this.axis1HallCActive = false;
        this.axis1OverTemp = false;
        this.axis1ForwardLimit = false;
        this.axis1ReverseLimit = false;
        this.axis1ExtraLimit = false;
        this.axis2HallAActive = false;
        this.axis2HallBActive = false;
        this.axis2HallCActive = false;
        this.axis2OverTemp = false;
        this.axis2ForwardLimit = false;
        this.axis2ReverseLimit = false;
        this.axis2ExtraLimit = false;
    }
}
exports.Inputs = Inputs;
var SerialPortType;
(function (SerialPortType) {
    SerialPortType["USB"] = "USB";
    SerialPortType["UNKNOWN"] = "UNKNOWN";
})(SerialPortType || (SerialPortType = {}));
exports.SerialPortType = SerialPortType;
class SerialPortInfo {
    constructor(comName, manufacturer, type = SerialPortType.UNKNOWN) {
        this.comName = comName;
        this.manufacturer = manufacturer;
        this.type = type;
    }
}
exports.SerialPortInfo = SerialPortInfo;
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
            //let portsPath: string[] = [];
            let portsInfo = [];
            ports.forEach((port) => {
                //console.log(port);
                //console.log(port['path'])
                let portType = port['path'].toUpperCase().includes('USB');
                if (portType == false && port.hasOwnProperty('pnpId') && port['pnpId'] !== undefined) {
                    portType = port['pnpId'].toUpperCase().includes('USB');
                }
                let info = new SerialPortInfo(port['path'], port['manufacturer'], portType ? SerialPortType.USB : SerialPortType.UNKNOWN);
                portsInfo.push(info);
            });
            this.emit('portsInfo', portsInfo);
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
        this.sendCmd(commands_1.Commands.FW_VER);
    }
    sendCmdDataString(cmd, data, callback) {
        this.sendToDriver(callback, cmd, data);
    }
    sendCmdDataNumber(cmd, data, callback) {
        this.sendToDriver(callback, cmd, data);
    }
    setupTrace(traceData, callback) {
        this.sendToDriver(callback, mcdn_cmd_1.ServiceCommands.TRACE, traceData);
    }
    sendCmd(cmd, callback) {
        // if ((cmd !== Commands.STATUS) && (cmd !== Commands.ENCODER)){
        //     console.log(`---- ${cmd}`)
        // }
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
    sendStr(str, callback) {
        console.log(`STR REQUEST: ${str}`);
        this.sendToDriver(callback, mcdn_cmd_1.ServiceCommands.STRING, str);
        //this.driverProcess?.send(new McdnCmd(ServiceCommands.STRING, str));
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
var commands_2 = require("./commands");
Object.defineProperty(exports, "Commands", { enumerable: true, get: function () { return commands_2.Commands; } });
var commands_data_1 = require("./commands-data");
Object.defineProperty(exports, "CommandsData", { enumerable: true, get: function () { return commands_data_1.CommandsData; } });
