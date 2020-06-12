"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Serial = void 0;
const mcdn_cmd_1 = require("../mcdn-cmd");
const driver_replay_1 = require("./driver-replay");
const SerialPort = require('serialport');
const HeFiveParser = require('./he-five-parser');
const lineTerminator = '\r\n';
const cmdTerm = '\r';
class Serial {
    constructor() {
        this.connected = false;
        this.serialPort = null;
        this.cmd = mcdn_cmd_1.Commands.NONE;
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
            // Send empty command before starting real-communication
            this.serialPort.write(cmdTerm, 'ascii', (err) => {
                var _a;
                if (err) {
                    (_a = process.send) === null || _a === void 0 ? void 0 : _a.call(process, new driver_replay_1.IpcReply(driver_replay_1.IpcReplyType.ERROR, err.message));
                }
            });
            this.parser = this.serialPort.pipe(new HeFiveParser({ terminators: [mcdn_cmd_1.cmdPass, mcdn_cmd_1.cmdFail] }));
            this.connected = true;
            this.startLisening();
        }
    }
    readFwVersion() {
        var _a;
        if (this.connected) {
            this.cmd = mcdn_cmd_1.Commands.FW_VER;
            this.serialPort.write('ver' + cmdTerm, 'ascii', (err) => {
                var _a;
                if (err) {
                    (_a = process.send) === null || _a === void 0 ? void 0 : _a.call(process, new driver_replay_1.IpcReply(driver_replay_1.IpcReplyType.ERROR, err.message));
                }
            });
        }
        else {
            (_a = process.send) === null || _a === void 0 ? void 0 : _a.call(process, new driver_replay_1.IpcReply(driver_replay_1.IpcReplyType.ERROR, 'Not Connected'));
        }
    }
    startLisening() {
        if (!this.connected) {
            return;
        }
        // Switches the port into "flowing mode"
        // this.serialPort.once('data', (data : Buffer) => {
        //    console.log('RAW:', data.toString('ascii'))
        //
        // })
        this.parser.on('data', (data) => {
            //setImmediate((data) =>{
            let strData = data.toString('ascii');
            console.log('answer:', strData);
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
                    reply.answer = strData.slice(0, position);
                    //console.log('reply.answer:'+ reply.answer)
                    this.postProcessAnswer(reply);
                }
            }
            //})
        });
        // Open errors will be emitted as an error event
        this.serialPort.on('error', (err) => {
            var _a;
            console.log('Error: ', err.message);
            (_a = process.send) === null || _a === void 0 ? void 0 : _a.call(process, new driver_replay_1.IpcReply(driver_replay_1.IpcReplyType.ERROR, err));
        });
    }
    postProcessAnswer(reply) {
        var _a;
        switch (reply.cmd) {
            case mcdn_cmd_1.Commands.FW_VER:
                if (reply.answer) {
                    reply.answer = reply.answer.slice(0, reply.answer.indexOf(','));
                }
                break;
        }
        (_a = process.send) === null || _a === void 0 ? void 0 : _a.call(process, new driver_replay_1.IpcReply(driver_replay_1.IpcReplyType.DRV, reply));
    }
    disconnect() { }
}
exports.Serial = Serial;
