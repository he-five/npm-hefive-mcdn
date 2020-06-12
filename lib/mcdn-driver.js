"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.McdnDriver = void 0;
const events_1 = require("events");
const mcdn_cmd_1 = require("./mcdn-cmd");
const driver_replay_1 = require("./drivers/driver-replay");
const path = require('path');
const SerialPort = require('serialport');
const child_process = require('child_process');
class McdnDriver extends events_1.EventEmitter {
    constructor() {
        super();
        this.driverProcess = null;
        this.connected = false;
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
            (_a = this.driverProcess) === null || _a === void 0 ? void 0 : _a.send(new mcdn_cmd_1.McdnCmd(mcdn_cmd_1.Commands.CONNECT, portName));
        }
    }
    disconnect() {
        var _a;
        (_a = this.driverProcess) === null || _a === void 0 ? void 0 : _a.send(new mcdn_cmd_1.McdnCmd(mcdn_cmd_1.Commands.DISCONNECT));
    }
    getFwVersion() {
        this.sendCmd(mcdn_cmd_1.Commands.FW_VER);
    }
    sendCmd(cmd) {
        var _a;
        console.log(`REQUEST: ${cmd}`);
        (_a = this.driverProcess) === null || _a === void 0 ? void 0 : _a.send(new mcdn_cmd_1.McdnCmd(cmd));
    }
    consumeEvents() {
        var _a, _b, _c, _d;
        (_a = this.driverProcess) === null || _a === void 0 ? void 0 : _a.on('close', () => {
            console.log('close');
            this.connected = false;
        });
        (_b = this.driverProcess) === null || _b === void 0 ? void 0 : _b.on('disconnect', () => {
            //console.log('driverProcess disconnect')
        });
        (_c = this.driverProcess) === null || _c === void 0 ? void 0 : _c.on('error', err => {
            console.log(`error: ${err}`);
            this.emit('error', err);
        });
        (_d = this.driverProcess) === null || _d === void 0 ? void 0 : _d.on('message', (msg) => {
            //console.log(`driverProcess error: ${msg}`)
            if (msg.type == driver_replay_1.IpcReplyType.DRV) {
                this.emit('data', msg.drvReply);
            }
            if (msg.type == driver_replay_1.IpcReplyType.ERROR) {
                this.emit('error', msg.err);
            }
        });
    }
}
exports.McdnDriver = McdnDriver;
