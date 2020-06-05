"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.McdnDriver = void 0;
const mcdn_cmd_1 = require("./mcdn-cmd");
const events_1 = require("events");
const path = require('path');
const child_process = require('child_process');
// TEMP just to test listing functionality
const SerialPort = require('serialport');
SerialPort.list().then((ports) => ports.forEach(console.log), (err) => console.error(err));
class McdnDriver extends events_1.EventEmitter {
    constructor() {
        super();
        this.driverProcess = null;
        this.connected = false;
    }
    connectMcdn(portName) {
        let serilOrMcdn = 'mcdn';
        this.createProcess(serilOrMcdn, portName);
    }
    connectSerial(portName) {
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
        var _a;
        (_a = this.driverProcess) === null || _a === void 0 ? void 0 : _a.send(new mcdn_cmd_1.McdnCmd(mcdn_cmd_1.Commands.FW_VER));
    }
    consumeEvents() {
        var _a, _b, _c, _d;
        (_a = this.driverProcess) === null || _a === void 0 ? void 0 : _a.on('close', () => {
            console.log('driverProcess close');
            this.connected = false;
        });
        (_b = this.driverProcess) === null || _b === void 0 ? void 0 : _b.on('disconnect', () => {
            //console.log('driverProcess disconnect')
        });
        (_c = this.driverProcess) === null || _c === void 0 ? void 0 : _c.on('error', err => {
            console.log(`driverProcess error: ${err}`);
        });
        (_d = this.driverProcess) === null || _d === void 0 ? void 0 : _d.on('message', msg => {
            console.log(`driverProcess error: ${msg}`);
        });
    }
}
exports.McdnDriver = McdnDriver;
