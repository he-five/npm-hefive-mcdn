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
        this.ip = undefined;
        this.cmd = mcdn_cmd_1.ServiceCommands.CLEAR_BUFF;
        this.queue = new queue_1.Queue();
        this.cmdInProgress = false;
        this.cmdSendTime = 0;
        this.timer = undefined;
        this.connected = false;
        this.reply = '';
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
                    if ((Date.now() - this.cmdSendTime) > 3000) {
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
            }, 100);
        }
    }
    onClose() {
        console.log('disconnected');
        process.exit(0);
    }
    onData(data) {
        this.reply += data;
        if (this.reply.endsWith(mcdn_cmd_1.cmdPass) || this.reply.endsWith(mcdn_cmd_1.cmdFail)) {
            //console.log(this.reply);
            try {
                let driverReply = new driver_replay_1.DriverReply();
                driverReply.cmd = this.cmd;
                driverReply.callbackId = this.callbackId;
                this.reply = this.reply.trim();
                driverReply.passed = this.reply.endsWith(mcdn_cmd_1.cmdPass);
                this.reply = this.reply.replace(mcdn_cmd_1.cmdPass, '').replace(mcdn_cmd_1.cmdFail, '');
                this.reply = this.reply.slice(0, this.reply.length - 1);
                let position = this.reply.indexOf(lineTerminator);
                if (position !== -1) {
                    if (this.reply) {
                        driverReply.answer = this.reply.slice(0, position);
                    }
                }
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
            case commands_1.Commands.STATUS:
                if (reply.answer) {
                    //console.log(`status is ${reply.answer}`);
                    let num = parseInt(reply.answer, 16);
                    let status = new robot_cmd_1.RobotStatus();
                    status.servoOn = !Boolean(num & robot_cmd_1.RobotStatusMask.ServoOn);
                    status.indexAcq = Boolean(num & robot_cmd_1.RobotStatusMask.IndexAcq);
                    status.encError = Boolean(num & robot_cmd_1.RobotStatusMask.EncError);
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
                    status.inMotion = Boolean(num & robot_cmd_1.RobotStatusMask.InMotion);
                    status.rvsLimit = Boolean(num & robot_cmd_1.RobotStatusMask.RvsLimit);
                    status.digitalOverload = Boolean(num & robot_cmd_1.RobotStatusMask.DigitalOverload);
                    reply.answer = status;
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
                //actualCmd = '.pos'
                break;
            case commands_1.Commands.FOLLOWING_ERROR:
                //actualCmd = 'err'
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
                if (cmd.data) {
                    let data = cmd.data;
                    if (data) {
                        actualCmd = `mvr ${data.axis} ${data.distance} ${cmdTerm}`;
                    }
                }
                break;
            case commands_1.Commands.STATUS:
                actualCmd = `status`;
                break;
            case commands_1.Commands.STOP:
                //actualCmd = `stop`
                break;
            case commands_1.Commands.AXIS1:
                // actualCmd = `1`
                break;
            case commands_1.Commands.AXIS2:
                //actualCmd = `2`
                break;
            case commands_1.Commands.INPUTS:
                // actualCmd = `inp`
                break;
            case commands_1.Commands.GO:
                //actualCmd = `go`
                break;
            case mcdn_cmd_1.ServiceCommands.CLEAR_BUFF:
                actualCmd = ' ';
                break;
            case mcdn_cmd_1.ServiceCommands.STRING:
                //actualCmd = cmd.data?.toString()
                break;
            //    case ServiceCommands.TRACE:
            //        break;
            //    case ServiceCommands.GET_TRACE_DATA:
            //       break;
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
                if (cmd.data !== undefined) {
                    actualCmd = `${this.cmd} ${cmd.data}`;
                }
                else {
                    actualCmd = `${this.cmd}`;
                }
                break;
        }
        //console.log(`---- ${actualCmd}${cmdTerm} --- ${JSON.stringify(cmd)}`)
        this.netSocket.write(`${actualCmd}${cmdTerm}`, asciiEnc, (err) => {
            var _a;
            if (err) {
                (_a = process.send) === null || _a === void 0 ? void 0 : _a.call(process, new driver_replay_1.IpcReply(driver_replay_1.IpcReplyType.ERROR, err.message));
            }
        });
    }
}
exports.Tcp = Tcp;
