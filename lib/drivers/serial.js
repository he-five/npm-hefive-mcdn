"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Serial = void 0;
const mcdn_cmd_1 = require("./mcdn-cmd");
const driver_replay_1 = require("./driver-replay");
const index_1 = require("../index");
const commands_1 = require("../commands");
const commands_data_1 = require("../commands-data");
const SerialPort = require('serialport');
const HeFiveParser = require('./he-five-parser');
const lineTerminator = '\r\n';
const cmdTerm = '\r';
const asciiEnc = 'ascii';
class Queue {
    constructor(queue) {
        this.cmds = queue || [];
    }
    enqueue(item) {
        this.cmds.push(item);
    }
    dequeue() {
        return this.cmds.shift();
    }
    clear() {
        this.cmds = [];
    }
    get count() {
        return this.cmds.length;
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
                var _a, _b, _c;
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
                                let failed = new driver_replay_1.DriverReply();
                                failed.cmd = this.cmd;
                                failed.callbackId = this.callbacId;
                                failed.passed = false;
                                (_c = process.send) === null || _c === void 0 ? void 0 : _c.call(process, new driver_replay_1.IpcReply(driver_replay_1.IpcReplyType.DRV, failed));
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
            case commands_1.Commands.FW_VER:
                actualCmd = 'ver';
                break;
            case commands_1.Commands.ENCODER:
                actualCmd = 'pos';
                break;
            case commands_1.Commands.FOLLOWING_ERROR:
                actualCmd = 'err';
                break;
            case commands_1.Commands.POWER_ON:
                actualCmd = 'enable';
                break;
            case commands_1.Commands.POWER_OFF:
                actualCmd = 'disable';
                break;
            case commands_1.Commands.SERVO_ON:
                actualCmd = 'on';
                break;
            case commands_1.Commands.SERVO_OFF:
                actualCmd = 'off';
                break;
            case commands_data_1.CommandsData.RelativeMove:
                actualCmd = `rel ${cmd.data}${cmdTerm}go`;
                break;
            case commands_1.Commands.STATUS:
                actualCmd = `sta`;
                break;
            case commands_1.Commands.STOP:
                actualCmd = `stop`;
                break;
            case commands_1.Commands.AXIS1:
                actualCmd = `1`;
                break;
            case commands_1.Commands.AXIS2:
                actualCmd = `2`;
                break;
            case commands_1.Commands.INPUTS:
                actualCmd = `inp`;
                break;
            case commands_1.Commands.GO:
                actualCmd = `go`;
                break;
            case mcdn_cmd_1.ServiceCommands.CLEAR_BUFF:
                actualCmd = ' ';
                break;
            case mcdn_cmd_1.ServiceCommands.STRING:
                actualCmd = cmd.data;
                break;
            case commands_data_1.CommandsData.KD:
            case commands_data_1.CommandsData.KI:
            case commands_data_1.CommandsData.KP:
            case commands_data_1.CommandsData.IntegrationLimit:
            case commands_data_1.CommandsData.BIAS:
            case commands_data_1.CommandsData.AccelerationFeedForward:
            case commands_data_1.CommandsData.VelocityFeedForward:
            case commands_data_1.CommandsData.MotorOutputLimit:
            case commands_data_1.CommandsData.DerivativeSampleInterval:
            case commands_data_1.CommandsData.MaxError:
            case commands_data_1.CommandsData.AutoStopMode:
            case commands_data_1.CommandsData.ECPR:
            case commands_data_1.CommandsData.Velocity:
            case commands_data_1.CommandsData.Acceleration:
            case commands_data_1.CommandsData.Decceleration:
            case commands_data_1.CommandsData.AbsMove:
            case commands_data_1.CommandsData.Position:
            case commands_data_1.CommandsData.PWM:
                if (cmd.data) {
                    actualCmd = `${this.cmd} ${cmd.data}`;
                }
                else {
                    actualCmd = `${this.cmd}`;
                }
                break;
        }
        // if ((actualCmd !== 'pos') && (actualCmd !== 'sta')){
        //   console.log(`---- ${actualCmd}${cmdTerm}`)
        //}
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
            case commands_1.Commands.FW_VER:
                if (reply.answer) {
                    reply.answer = reply.answer.slice(0, reply.answer.indexOf(','));
                }
                break;
            case commands_1.Commands.STATUS:
                if (reply.answer) {
                    let num = parseInt(reply.answer, 16);
                    let status = new index_1.Status();
                    status.servoOn = (num & mcdn_cmd_1.StatusMask.ServoOn) == 0 ? false : true;
                    status.powerOn = (num & mcdn_cmd_1.StatusMask.PowerOn) == 0 ? false : true;
                    status.moving = (num & mcdn_cmd_1.StatusMask.AtTarget) == 0 ? true : false;
                    status.positionCaptured = (num & mcdn_cmd_1.StatusMask.PosCaptured) == 0 ? false : true;
                    status.indexCaptured = (num & mcdn_cmd_1.StatusMask.IdxCaptured) == 0 ? false : true;
                    status.homingCompleted = (num & mcdn_cmd_1.StatusMask.Homed) == 0 ? false : true;
                    status.phaseAligning = (num & mcdn_cmd_1.StatusMask.Aligning) == 0 ? false : true;
                    status.phaseAlignmentCompleted = (num & mcdn_cmd_1.StatusMask.Aligned) == 0 ? false : true;
                    status.busy = (num & mcdn_cmd_1.StatusMask.Busy) == 0 ? false : true;
                    status.overCurrent = (num & mcdn_cmd_1.StatusMask.OverCurrent) == 0 ? false : true;
                    status.pvtQueueFull = (num & mcdn_cmd_1.StatusMask.Inhibit) == 0 ? false : true;
                    status.pvtQueueEmpty = (num & mcdn_cmd_1.StatusMask.PvtEmpty) == 0 ? false : true;
                    status.overCurrentWarning = (num & mcdn_cmd_1.StatusMask.AmpWarning) == 0 ? false : true;
                    status.amplifierCurrentLimit = (num & mcdn_cmd_1.StatusMask.AmpFault) == 0 ? false : true;
                    status.followingErrorLimit = (num & mcdn_cmd_1.StatusMask.PosError) == 0 ? false : true;
                    status.counterWrapAround = (num & mcdn_cmd_1.StatusMask.Wraparound) == 0 ? false : true;
                    reply.answer = status;
                }
                break;
            case commands_1.Commands.INPUTS:
                //console.log('INPUTS: ', reply.answer)
                let num = parseInt(reply.answer, 16) & 0x0007;
                let input = new index_1.Inputs();
                this.decodeInputs(input, num);
                reply.answer = input;
                break;
        }
        (_b = process.send) === null || _b === void 0 ? void 0 : _b.call(process, new driver_replay_1.IpcReply(driver_replay_1.IpcReplyType.DRV, reply));
        this.checkForPendingCmd();
    }
    decodeInputs(input, num) {
        input.axis1HallAActive = (num & 0x0001) != 0;
        input.axis1HallBActive = (num & 0x0002) != 0;
        input.axis1HallCActive = (num & 0x0004) != 0;
        input.axis1OverTemp = (num & 0x0100) != 0;
        input.axis1ForwardLimit = (num & 0x0200) != 0;
        input.axis1ReverseLimit = (num & 0x0400) != 0;
        input.axis1ExtraLimit = (num & 0x0800) != 0;
        input.axis2HallAActive = (num & 0x0010) != 0;
        input.axis2HallBActive = (num & 0x0020) != 0;
        input.axis2HallCActive = (num & 0x0040) != 0;
        input.axis2OverTemp = (num & 0x1000) != 0;
        input.axis2ForwardLimit = (num & 0x2000) != 0;
        input.axis2ReverseLimit = (num & 0x4000) != 0;
        input.axis2ExtraLimit = (num & 0x8000) != 0;
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
