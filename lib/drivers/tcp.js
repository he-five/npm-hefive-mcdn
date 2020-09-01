"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tcp = void 0;
const mcdn_cmd_1 = require("./mcdn-cmd");
const commands_1 = require("../commands");
const commands_data_1 = require("../commands-data");
const queue_1 = require("../helpers/queue");
const driver_replay_1 = require("./driver-replay");
const Net = require('net');
const asciiEnc = 'ascii';
const lineTerminator = '\r\n';
const cmdTerm = '\r';
const cmdPass = '>';
const cmdFail = '?';
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
            //
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
        if (this.reply.endsWith(cmdPass) || this.reply.endsWith(cmdFail)) {
            try {
                let driverReply = new driver_replay_1.DriverReply();
                driverReply.cmd = this.cmd;
                driverReply.callbackId = this.callbackId;
                if (driverReply.cmd === mcdn_cmd_1.ServiceCommands.STRING || driverReply.cmd === mcdn_cmd_1.ServiceCommands.GET_TRACE_DATA) {
                    this.cmdInProgress = false;
                    driverReply.answer = this.reply;
                    //reply.passed = strData.endsWith(cmdPass);
                    setImmediate(() => { var _a; return (_a = process.send) === null || _a === void 0 ? void 0 : _a.call(process, new driver_replay_1.IpcReply(driver_replay_1.IpcReplyType.DRV, driverReply)); });
                    this.checkForPendingCmd();
                    return;
                }
                this.reply = this.reply.trim();
                driverReply.passed = this.reply.endsWith(cmdPass);
                this.reply = this.reply.slice(0, this.reply.length - 1);
                let position = this.reply.indexOf(lineTerminator);
                if (position !== -1) {
                    let devStr = this.reply.slice(position + lineTerminator.length, this.reply.length);
                    //console.log('deviceId:', devStr)
                    driverReply.deviceId = parseInt(devStr);
                    if (this.reply) {
                        driverReply.answer = this.reply.slice(0, position);
                    }
                    //console.log('reply.answer:'+ reply.answer)
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
                // replay verify
                reply.answer = true;
                (_a = process.send) === null || _a === void 0 ? void 0 : _a.call(process, new driver_replay_1.IpcReply(driver_replay_1.IpcReplyType.CONNECTED, reply));
                return;
            // case Commands.FW_VER:
            //     if (reply.answer){
            //         reply.answer = reply.answer.slice(0,reply.answer.indexOf(','))
            //     }
            //     break;
            case commands_1.Commands.STATUS:
                // if (reply.answer){
                //     let num = parseInt(reply.answer, 16)
                //     let status = new Status()
                //     status.servoOn                  = (num & StatusMask.ServoOn) == 0       ?  false:true
                //     status.powerOn                  = (num & StatusMask.PowerOn) == 0       ?  false:true
                //     status.moving                   = (num & StatusMask.AtTarget) == 0      ?  true:false
                //     status.positionCaptured         = (num & StatusMask.PosCaptured) == 0   ?  false:true
                //
                //     status.indexCaptured            = (num & StatusMask.IdxCaptured) == 0   ?  false:true
                //     status.homingCompleted          = (num & StatusMask.Homed) == 0         ?  false:true
                //     status.phaseAligning            = (num & StatusMask.Aligning) == 0      ?  false:true
                //     status.phaseAlignmentCompleted  = (num & StatusMask.Aligned) == 0       ?  false:true
                //
                //     status.busy                     = (num & StatusMask.Busy) == 0          ?  false:true
                //     status.overCurrent              = (num & StatusMask.OverCurrent) == 0   ?  false:true
                //     status.pvtQueueFull             = (num & StatusMask.Inhibit) == 0       ?  false:true
                //     status.pvtQueueEmpty            = (num & StatusMask.PvtEmpty) == 0      ?  false:true
                //
                //     status.overCurrentWarning       = (num & StatusMask.AmpWarning) == 0    ?  false:true
                //     status.amplifierCurrentLimit    = (num & StatusMask.AmpFault) == 0      ?  false:true
                //     status.followingErrorLimit      = (num & StatusMask.PosError) == 0      ?  false:true
                //     status.counterWrapAround        = (num & StatusMask.Wraparound) == 0    ?  false:true
                //
                //     reply.answer = status
                // }
                break;
            case commands_1.Commands.INPUTS:
                //console.log('INPUTS: ', reply.answer)
                // let num = parseInt(reply.answer, 16) & 0x0007
                // let input = new Inputs();
                // this.decodeInputs(input, num);
                // reply.answer = input
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
                actualCmd = '.pos';
                break;
            case commands_1.Commands.FOLLOWING_ERROR:
                //actualCmd = 'err'
                break;
            case commands_1.Commands.POWER_ON:
                //actualCmd = 'enable'
                break;
            case commands_1.Commands.POWER_OFF:
                //actualCmd = 'disable'
                break;
            case commands_1.Commands.SERVO_ON:
                //actualCmd = 'on'
                break;
            case commands_1.Commands.SERVO_OFF:
                //actualCmd = 'off'
                break;
            case commands_data_1.CommandsData.RelativeMove:
                //actualCmd = `rel ${cmd.data}${cmdTerm}go`
                break;
            case commands_1.Commands.STATUS:
                //actualCmd = `sta`
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
            //        let trace = cmd.data as Trace
            //        actualCmd =
            //            `trace 0${cmdTerm}
            // ch1 ${trace.channel1Type}${cmdTerm}
            // ch2 ${trace.channel2Type}${cmdTerm}
            // ch3 ${trace.channel3Type}${cmdTerm}
            // trate ${trace.rateInMicrosecond/50}${cmdTerm}
            // tlevel ${trace.level}${cmdTerm}
            // trace ${trace.trigger}`
            //        console.log(`ServiceCommands.TRACE ${actualCmd}`)
            //        break;
            case mcdn_cmd_1.ServiceCommands.GET_TRACE_DATA:
                //actualCmd = `play`
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
