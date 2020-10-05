"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tcp = void 0;
const mcdn_cmd_1 = require("./mcdn-cmd");
const commands_1 = require("../commands");
const commands_data_1 = require("../commands-data");
const queue_1 = require("../helpers/queue");
const driver_replay_1 = require("./driver-replay");
const robot_cmd_1 = require("./robot-cmd");
const Net = require('net');
const asciiEnc = 'ascii';
const lineTerminator = '\r\n';
const cmdTerm = '\r';
class Tcp {
    constructor() {
        this.netSocket = null;
        this.deviceAnswerTimeout = 5000;
        this.ip = undefined;
        this.cmd = mcdn_cmd_1.ServiceCommands.CLEAR_BUFF;
        this.queue = new queue_1.Queue();
        this.cmdInProgress = false;
        this.cmdSendTime = 0;
        this.timer = undefined;
        this.connected = false;
        this.reply = '';
        this.cmdPass = '>';
        this.cmdFail = '?';
    }
    connect(ip) {
        if (!this.connected) {
            this.ip = ip;
            this.netSocket = new Net.Socket();
            let self = this;
            this.netSocket.on('data', (data) => { self.onData(data); });
            this.netSocket.on('close', () => { self.onClose(); });
            this.netSocket.on('error', (err) => { self.onError(err); });
            this.netSocket.setEncoding(asciiEnc);
            let tcpServerAddressArray = this.ip.split(':');
            this.netSocket.connect(tcpServerAddressArray[1], tcpServerAddressArray[0], () => {
                self.onConnect();
            });
            this.timer = setInterval(() => {
                var _a, _b, _c;
                if (this.cmdInProgress) {
                    if ((Date.now() - this.cmdSendTime) > this.deviceAnswerTimeout) {
                        switch (this.cmd) {
                            case mcdn_cmd_1.ServiceCommands.CLEAR_BUFF:
                                let reply = new driver_replay_1.DriverReply();
                                reply.cmd = this.cmd;
                                reply.callbackId = this.callbackId;
                                reply.answer = false;
                                (_a = process.send) === null || _a === void 0 ? void 0 : _a.call(process, new driver_replay_1.IpcReply(driver_replay_1.IpcReplyType.CONNECTED, reply));
                                this.disconnect();
                                break;
                            default:
                                (_b = process.send) === null || _b === void 0 ? void 0 : _b.call(process, new driver_replay_1.IpcReply(driver_replay_1.IpcReplyType.ERROR, `Command ${this.cmd} Timeout`));
                                let failed = new driver_replay_1.DriverReply();
                                failed.cmd = this.cmd;
                                failed.callbackId = this.callbackId;
                                failed.passed = false;
                                (_c = process.send) === null || _c === void 0 ? void 0 : _c.call(process, new driver_replay_1.IpcReply(driver_replay_1.IpcReplyType.DRV, failed));
                                this.cmdInProgress = false;
                        }
                    }
                }
            }, 200);
        }
    }
    onClose() {
        console.log('disconnected');
        process.exit(0);
    }
    onData(data) {
        this.reply += data;
        if (this.reply.endsWith(this.cmdPass) || this.reply.endsWith(this.cmdFail)) {
            let driverReply = new driver_replay_1.DriverReply();
            driverReply.cmd = this.cmd;
            driverReply.callbackId = this.callbackId;
            driverReply.passed = this.reply.endsWith(this.cmdPass);
            if (this.cmd === mcdn_cmd_1.ServiceCommands.STRING) {
                this.cmdInProgress = false;
                driverReply.answer = this.reply;
                setImmediate(() => { var _a; return (_a = process.send) === null || _a === void 0 ? void 0 : _a.call(process, new driver_replay_1.IpcReply(driver_replay_1.IpcReplyType.DRV, driverReply)); });
                this.checkForPendingCmd();
                return;
            }
            try {
                this.reply = this.reply.trim();
                this.reply = this.reply.replace(this.cmdPass, '').replace(this.cmdFail, '');
                driverReply.answer = this.reply;
                this.postProcessAnswer(driverReply);
            }
            catch (err) {
            }
        }
    }
    postProcessAnswer(reply) {
        var _a, _b;
        this.cmdInProgress = false;
        switch (reply.cmd) {
            case mcdn_cmd_1.ServiceCommands.CLEAR_BUFF:
                reply.answer = true;
                (_a = process.send) === null || _a === void 0 ? void 0 : _a.call(process, new driver_replay_1.IpcReply(driver_replay_1.IpcReplyType.CONNECTED, reply));
                return;
            case commands_1.Commands.AXES:
            case commands_data_1.CommandsData.Position:
            case commands_1.Commands.ENCODER:
                if (reply.answer) {
                    let posArray = reply.answer.split(lineTerminator);
                    posArray = posArray.filter((el) => el != undefined && el != null && el != '');
                    posArray = posArray.map((eachAxis) => {
                        let quotePosition = eachAxis.indexOf(':');
                        let equalPosition = eachAxis.indexOf('=');
                        if (quotePosition !== -1 && equalPosition !== -1) {
                            let axis = eachAxis.substring(quotePosition + 1, equalPosition).trim();
                            if (this.cmd === commands_1.Commands.AXES) {
                                return axis;
                            }
                            return new robot_cmd_1.RobotAxisData(axis, parseInt(eachAxis.slice(equalPosition + 1)));
                        }
                    });
                    posArray = posArray.filter((el) => el != undefined && el != null && el != '');
                    reply.answer = posArray;
                }
                break;
            case commands_1.Commands.STATUS:
                if (reply.answer) {
                    let answerArr = reply.answer.split(lineTerminator);
                    answerArr = answerArr.map((eachStatusAxis) => {
                        let equalSignPosition = eachStatusAxis.indexOf('=');
                        if (equalSignPosition !== -1) {
                            eachStatusAxis = eachStatusAxis.slice(equalSignPosition + 1);
                        }
                        if (eachStatusAxis) {
                            return parseInt(eachStatusAxis, 16);
                        }
                    });
                    answerArr = answerArr.filter((el) => el != undefined && el != null);
                    if (this.cmd === commands_1.Commands.STATUS) {
                        let num = answerArr.reduce((prevValue, currentVal) => prevValue | currentVal);
                        let status = new robot_cmd_1.RobotStatus();
                        status.servoOn = !Boolean(num & robot_cmd_1.RobotStatusMask.ServoOn);
                        status.indexAcq = Boolean(num & robot_cmd_1.RobotStatusMask.IndexAcq);
                        status.index = Boolean(num & robot_cmd_1.RobotStatusMask.Index);
                        status.wraparound = Boolean(num & robot_cmd_1.RobotStatusMask.Wraparound);
                        status.currentOverload = Boolean(num & robot_cmd_1.RobotStatusMask.CurrentOverload);
                        status.fwrdLimit = !Boolean(num & robot_cmd_1.RobotStatusMask.FwrdLimit);
                        status.digitalOverload = Boolean(num & robot_cmd_1.RobotStatusMask.DigitalOverload);
                        status.inhibit = Boolean(num & robot_cmd_1.RobotStatusMask.Inhibit);
                        status.pathPoint = Boolean(num & robot_cmd_1.RobotStatusMask.PathPoint);
                        status.accPhase = Boolean(num & robot_cmd_1.RobotStatusMask.AccPhase);
                        status.overrun = Boolean(num & robot_cmd_1.RobotStatusMask.Overrun);
                        status.powerFail = Boolean(num & robot_cmd_1.RobotStatusMask.PowerFail);
                        status.inMotion = !Boolean(num & robot_cmd_1.RobotStatusMask.MotionCompleted);
                        status.rvsLimit = Boolean(num & robot_cmd_1.RobotStatusMask.RvsLimit);
                        status.digitalOverload = Boolean(num & robot_cmd_1.RobotStatusMask.DigitalOverload);
                        status.busy = Boolean(num & (robot_cmd_1.RobotStatusMask.SysMacroRunning | robot_cmd_1.RobotStatusMask.UserMacroRunning));
                        reply.answer = status;
                    }
                }
                break;
            default:
                reply.answer = reply.answer.replace(/\r\n/g, '');
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
    onError(err) {
        var _a;
        console.log(err);
        (_a = process.send) === null || _a === void 0 ? void 0 : _a.call(process, new driver_replay_1.IpcReply(driver_replay_1.IpcReplyType.ERROR, err));
    }
    onConnect() {
        this.connected = true;
        this.sendCmd(new mcdn_cmd_1.McdnCmd(mcdn_cmd_1.ServiceCommands.CLEAR_BUFF, undefined));
        console.log('connected');
    }
    disconnect() {
        if (!this.connected) {
            process.exit(0);
            return;
        }
        this.netSocket.destroy();
    }
    sendCmd(cmd) {
        var _a;
        if (cmd.cmd === commands_data_1.CommandsData.CmdPassString) {
            if (cmd.data)
                this.cmdPass = cmd.data.toString();
            return;
        }
        if (cmd.cmd === commands_data_1.CommandsData.CmdFailString) {
            if (cmd.data)
                this.cmdFail = cmd.data.toString();
            return;
        }
        this.reply = '';
        if (this.connected == false) {
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
        var _a;
        this.cmdInProgress = true;
        this.cmd = cmd.cmd;
        this.callbackId = cmd.uniqueId;
        this.cmdSendTime = Date.now();
        let actualCmd = '';
        switch (this.cmd) {
            case commands_1.Commands.FW_VER:
                actualCmd = '.ver';
                break;
            case commands_1.Commands.ENCODER:
                actualCmd = '.enc';
                break;
            case commands_1.Commands.POWER_ON:
                actualCmd = '.power';
                break;
            case commands_1.Commands.POWER_OFF:
                actualCmd = '.nopower';
                break;
            case commands_1.Commands.SERVO_ON:
                actualCmd = '.servo';
                break;
            case commands_1.Commands.SERVO_OFF:
                actualCmd = '.noservo';
                break;
            case commands_data_1.CommandsData.RelativeMove:
            case commands_data_1.CommandsData.AbsMove:
                if (cmd.data) {
                    let data = cmd.data;
                    if (data) {
                        let moveCmd = this.cmd === commands_data_1.CommandsData.RelativeMove ? '.rel' : '.abs';
                        actualCmd = `${moveCmd} ${data.name} = ${data.value} go ${data.name}`;
                    }
                }
                break;
            case commands_data_1.CommandsData.Delay:
                actualCmd = `.delay ${cmd.data}`;
                break;
            case commands_1.Commands.AXES:
                actualCmd = `.pos`;
                break;
            case commands_1.Commands.STATUS:
                actualCmd = '.sta';
                break;
            case commands_1.Commands.STOP:
                actualCmd = '.stop';
                break;
            case mcdn_cmd_1.ServiceCommands.CLEAR_BUFF:
                actualCmd = ' ';
                break;
            case mcdn_cmd_1.ServiceCommands.STRING:
                actualCmd = (_a = cmd.data) === null || _a === void 0 ? void 0 : _a.toString();
                break;
            case commands_data_1.CommandsData.Position:
                actualCmd = '.pos';
                break;
        }
        this.netSocket.write(`${actualCmd}${cmdTerm}`, asciiEnc, (err) => {
            var _a;
            if (err) {
                (_a = process.send) === null || _a === void 0 ? void 0 : _a.call(process, new driver_replay_1.IpcReply(driver_replay_1.IpcReplyType.ERROR, err.message));
            }
        });
    }
}
exports.Tcp = Tcp;
