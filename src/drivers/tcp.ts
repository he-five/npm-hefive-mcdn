import {McdnCmd, ServiceCommands,cmdFail, cmdPass, Trace} from "./mcdn-cmd";
import {Commands} from "../commands";
import {CommandsData} from "../commands-data";
import {Queue} from "../helpers/queue";
import {DriverReply, IpcReply, IpcReplyType} from "./driver-replay";
const Net                   = require('net');
const asciiEnc        = 'ascii'
import {RobotStatus, RobotStatusMask} from "./robot-cmd"
const lineTerminator = '\r\n';
const cmdTerm = '\r';

class Tcp {
    private netSocket    : typeof Net.Socket
    private ip           : any
    private cmd           : Commands | ServiceCommands | CommandsData|  string
    private callbackId     : string | undefined
    private queue         : Queue
    private cmdInProgress : boolean
    private cmdSendTime   : number
    private timer         : any
    private connected     : boolean
    private reply         : string

    constructor () {
        this.netSocket = null
        this.ip = undefined
        this.cmd = ServiceCommands.CLEAR_BUFF
        this.queue = new Queue()
        this.cmdInProgress = false
        this.cmdSendTime = 0
        this.timer = undefined
        this.connected = false
        this.reply = ''
    }

    public connect (ip : string) {
        if (!this.connected) {
            this.ip = ip;
            this.netSocket = new Net.Socket();
            let self = this;
            this.netSocket.on('data', (data : string) =>{ self.onData(data); });
            this.netSocket.on('close', ()=> {self.onClose();});
            this.netSocket.on('error', (err : string) => {self.onError(err); });
            this.netSocket.setEncoding(asciiEnc);
            let tcpServerAddressArray = this.ip.split(':');
            this.netSocket.connect(tcpServerAddressArray[1], tcpServerAddressArray[0], () => {
                self.onConnect();
            });

            this.timer = setInterval(() => {
                if (this.cmdInProgress) {
                    if ((Date.now() - this.cmdSendTime) > 3000) {
                        switch (this.cmd) {
                            case ServiceCommands.CLEAR_BUFF:
                                let reply = new DriverReply();
                                reply.cmd = this.cmd;
                                reply.callbackId = this.callbackId;
                                reply.answer = false
                                process.send?.(new IpcReply(IpcReplyType.CONNECTED, reply))
                                this.disconnect()
                                break;
                            default:
                                process.send?.(new IpcReply(IpcReplyType.ERROR, `Command ${this.cmd} Timeout`))
                                let failed = new DriverReply();
                                failed.cmd = this.cmd;
                                failed.callbackId = this.callbackId;
                                failed.passed = false
                                process.send?.(new IpcReply(IpcReplyType.DRV, failed))
                                this.cmdInProgress  = false
                        }
                    }

                }
            }, 100)
        }
    }
    onClose(){
        console.log('disconnected');
        process.exit(0);
    }

    onData(data : string) {
        this.reply += data;
        if (this.reply.endsWith(cmdPass) || this.reply.endsWith(cmdFail)) {
            try {
                let driverReply = new DriverReply();
                driverReply.cmd = this.cmd;
                driverReply.callbackId = this.callbackId;

                if (driverReply.cmd === ServiceCommands.STRING || driverReply.cmd === ServiceCommands.GET_TRACE_DATA){
                    this.cmdInProgress = false
                    driverReply.answer  = this.reply;
                    driverReply.passed = this.reply.endsWith(cmdPass);
                    setImmediate(() => process.send?.(new IpcReply(IpcReplyType.DRV, driverReply)));
                    this.checkForPendingCmd()
                    return;
                }

                this.reply = this.reply.trim();
                driverReply.passed = this.reply.endsWith(cmdPass);
                this.reply  = this.reply.slice(0, this.reply.length - 1);
                let position:number =  this.reply.indexOf(lineTerminator);
                if (position !== -1 ) {
                    let devStr = this.reply.slice(position+lineTerminator.length, this.reply.length);
                    driverReply.deviceId = parseInt(devStr)
                    if (this.reply){
                        driverReply.answer = this.reply.slice(0, position);
                    }
                }
                this.postProcessAnswer(driverReply);
            }
            catch (err){

            }
        }
    }

    private postProcessAnswer(reply : DriverReply){
        this.cmdInProgress = false
        switch(reply.cmd){
            case ServiceCommands.CLEAR_BUFF:
                reply.answer = true
                process.send?.(new IpcReply(IpcReplyType.CONNECTED, reply))
                return;
            case Commands.STATUS:
                if (reply.answer){
                    //console.log(`status is ${reply.answer}`);
                    let num = parseInt(reply.answer, 16)
                    let status = new RobotStatus()
                    status.servoOn                  =   !Boolean(num & RobotStatusMask.ServoOn)
                    status.homed                    =   !Boolean(num & RobotStatusMask.Homed)
                    status.busy                     =   Boolean(num & RobotStatusMask.Busy)
                    status.index                    =   Boolean(num & RobotStatusMask.Index)
                    status.limitPos                 =   Boolean(num & RobotStatusMask.LimitPos)
                    status.currentOverload          =   Boolean(num & RobotStatusMask.CurrentOverload)
                    status.inMotion                  =   !Boolean(num & RobotStatusMask.InMotion)
                    status.emergencyStop            =   Boolean(num & RobotStatusMask.EmergencyStop)
                    status.inhibit                  =   Boolean(num & RobotStatusMask.Inhibit)
                    status.encoderErr               =   Boolean(num & RobotStatusMask.EncoderErr)
                    status.maxError                 =   Boolean(num & RobotStatusMask.MaxError)
                    status.overrun                  =   Boolean(num & RobotStatusMask.Overrun)
                    status.powerFail                =   Boolean(num & RobotStatusMask.PowerFail)

                    reply.answer = status
                }
                break;
        }
        process.send?.(new IpcReply(IpcReplyType.DRV, reply))
        this.checkForPendingCmd();

    }

    private checkForPendingCmd() {
        if (this.queue.count > 0) {
            let nextCmd = this.queue.dequeue()
            if (nextCmd) {
                this.sendCmd(nextCmd);
            }
        }
    }

    onError(err : string){
        console.log(err)
        process.send?.(new IpcReply(IpcReplyType.ERROR, err))
    }
    onConnect(){
        this.connected = true;
        this.sendCmd(new McdnCmd(ServiceCommands.CLEAR_BUFF, undefined));
        console.log('connected');
    }

    public disconnect () {
        if (!this.connected){
            process.exit(0);
            return;
        }
        this.netSocket.destroy();
    }

    public sendCmd(cmd : McdnCmd ){
        this.reply = '';
        if (this.connected == false) {
            process.send?.(new IpcReply(IpcReplyType.ERROR, 'Not Connected'))
            return
        }

        if (this.cmdInProgress == false){
            this.sendThruPort(cmd);
        }
        else{
            this.queue.enqueue(cmd);
        }
    }

    private sendThruPort(cmd: McdnCmd ) {
        this.cmdInProgress    = true
        this.cmd              = cmd.cmd
        this.callbackId        = cmd.uniqueId
        this.cmdSendTime      = Date.now()

        let actualCmd: string | undefined = ''
        switch (this.cmd) {
            case Commands.FW_VER:
                actualCmd = 'ver'
                break;
            case Commands.ENCODER:
                //actualCmd = '.pos'
                break;
            case Commands.FOLLOWING_ERROR:
                //actualCmd = 'err'
                break;
            case Commands.POWER_ON:
                //actualCmd = 'enable'
                break;
            case Commands.POWER_OFF:
                //actualCmd = 'disable'
                break;
            case Commands.SERVO_ON:
                actualCmd = 'servoOn'
                break;
            case Commands.SERVO_OFF:
                actualCmd = 'servoOff'
                break;
            case CommandsData.RelativeMove:
                //actualCmd = `rel ${cmd.data}${cmdTerm}go`
                break;
            case Commands.STATUS:
                actualCmd = `status`
                break;
            case Commands.STOP:
                //actualCmd = `stop`
                break;
            case Commands.AXIS1:
               // actualCmd = `1`
                break;
            case Commands.AXIS2:
                //actualCmd = `2`
                break;
            case Commands.INPUTS:
               // actualCmd = `inp`
                break;
            case Commands.GO:
                //actualCmd = `go`
                break;
            case ServiceCommands.CLEAR_BUFF:
                actualCmd = ' '
                break;
            case ServiceCommands.STRING:
                //actualCmd = cmd.data?.toString()
                break;
         //    case ServiceCommands.TRACE:
         //        break;
         //    case ServiceCommands.GET_TRACE_DATA:
         //       break;
            case CommandsData.KD:
            case CommandsData.KI:
            case CommandsData.KP:
            case CommandsData.IntegrationLimit:
            case CommandsData.BIAS:
            case CommandsData.AccelerationFeedForward:
            case CommandsData.VelocityFeedForward:
            case CommandsData.MotorOutputLimit:
            case CommandsData.DerivativeSampleInterval:
            case CommandsData.MaxError:
            case CommandsData.AutoStopMode:
            case CommandsData.ECPR:
            case CommandsData.Velocity:
            case CommandsData.Acceleration:
            case CommandsData.Decceleration:
            case CommandsData.AbsMove:
            case CommandsData.Position:
            case CommandsData.PWM:
                if (cmd.data !== undefined){
                    actualCmd = `${this.cmd} ${cmd.data}`
                }
                else{
                    actualCmd = `${this.cmd}`
                }
                break;
        }

        //console.log(`---- ${actualCmd}${cmdTerm} --- ${JSON.stringify(cmd)}`)

        this.netSocket.write(`${actualCmd}${cmdTerm}`, asciiEnc, (err: any) => {
            if (err) {
                process.send?.(new IpcReply(IpcReplyType.ERROR, err.message))
            }
        })
    }

}

export { Tcp }
