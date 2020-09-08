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
            // this.timer = setInterval(() => {
            //     if (this.cmdInProgress) {
            //         if ((Date.now() - this.cmdSendTime) > 3000) {
            //             switch (this.cmd) {
            //                 case ServiceCommands.CLEAR_BUFF:
            //                     let reply = new DriverReply();
            //                     reply.cmd = this.cmd;
            //                     reply.callbackId = this.callbackId;
            //                     reply.answer = false
            //                     process.send?.(new IpcReply(IpcReplyType.CONNECTED, reply))
            //                     this.disconnect()
            //                     break;
            //                 default:
            //                     process.send?.(new IpcReply(IpcReplyType.ERROR, `Command ${this.cmd} Timeout`))
            //                     let failed = new DriverReply();
            //                     failed.cmd = this.cmd;
            //                     failed.callbackId = this.callbackId;
            //                     failed.passed = false
            //                     process.send?.(new IpcReply(IpcReplyType.DRV, failed))
            //                     this.cmdInProgress  = false
            //             }
            //         }
            //
            //     }
            // }, 100)
        }
    }
    onClose() {
        console.log('disconnected');
        process.exit(0);
    }
    onData(data) {
        this.reply += data;
        if (this.reply.endsWith(mcdn_cmd_1.cmdPass) || this.reply.endsWith(mcdn_cmd_1.cmdFail)) {
            let driverReply = new driver_replay_1.DriverReply();
            driverReply.cmd = this.cmd;
            driverReply.callbackId = this.callbackId;
            driverReply.passed = this.reply.endsWith(mcdn_cmd_1.cmdPass);
            if (this.cmd === mcdn_cmd_1.ServiceCommands.STRING) {
                this.cmdInProgress = false;
                driverReply.answer = this.reply;
                setImmediate(() => { var _a; return (_a = process.send) === null || _a === void 0 ? void 0 : _a.call(process, new driver_replay_1.IpcReply(driver_replay_1.IpcReplyType.DRV, driverReply)); });
                this.checkForPendingCmd();
                return;
            }
            try {
                this.reply = this.reply.trim();
                this.reply = this.reply.replace(mcdn_cmd_1.cmdPass, '').replace(mcdn_cmd_1.cmdFail, '');
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
            case commands_1.Commands.STATUS:
                if (reply.answer) {
                    let statusArr = reply.answer.split(lineTerminator);
                    statusArr = statusArr.map((eachStatusAxis) => {
                        let equalSignPosition = eachStatusAxis.indexOf('=');
                        if (equalSignPosition !== -1) {
                            eachStatusAxis = eachStatusAxis.slice(equalSignPosition + 1);
                        }
                        if (eachStatusAxis) {
                            return parseInt(eachStatusAxis, 16);
                        }
                    });
                    statusArr = statusArr.filter((el) => el !== undefined);
                    let num = statusArr.reduce((prevValue, currentVal) => prevValue | currentVal);
                    let status = new robot_cmd_1.RobotStatus();
                    status.servoOn = !Boolean(num & robot_cmd_1.RobotStatusMask.ServoOn);
                    status.indexAcq = Boolean(num & robot_cmd_1.RobotStatusMask.IndexAcq);
                    status.busy = Boolean(num & robot_cmd_1.RobotStatusMask.Busy);
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
            case commands_data_1.CommandsData.AbsMove:
                if (cmd.data) {
                    let data = cmd.data;
                    if (data) {
                        let moveCmd = this.cmd === commands_data_1.CommandsData.RelativeMove ? '.rel' : '.abs';
                        actualCmd = `${moveCmd} ${data.axis} = ${data.distance} go ${data.axis}`;
                    }
                }
                break;
            case commands_data_1.CommandsData.Delay:
                actualCmd = `.delay ${cmd.data}`;
                break;
            case commands_1.Commands.AXESNUM:
                actualCmd = `._axes`;
                break;
            case commands_1.Commands.STATUS:
                actualCmd = '.sta';
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
                actualCmd = (_a = cmd.data) === null || _a === void 0 ? void 0 : _a.toString();
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
