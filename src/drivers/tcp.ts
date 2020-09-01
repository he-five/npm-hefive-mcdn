import {McdnCmd, ServiceCommands, Trace} from "./mcdn-cmd";
import {Commands} from "../commands";
import {CommandsData} from "../commands-data";
import {Queue} from "../helpers/queue";
import {DriverReply, IpcReply, IpcReplyType} from "./driver-replay";
const Net                   = require('net');
const asciiEnc        = 'ascii'
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

    constructor () {
        this.netSocket = null
        this.ip = undefined
        this.cmd = ServiceCommands.CLEAR_BUFF
        this.queue = new Queue()
        this.cmdInProgress = false
        this.cmdSendTime = 0
        this.timer = undefined
        this.connected = false

    }

    public connect (ip : string) {
        if (!this.connected) {
            this.ip = ip;
            this.netSocket = new Net.Socket();
            let self = this;
            this.netSocket.on('data', (data : string) =>{ self.onData(data); });
            this.netSocket.on('close', ()=> {
                try {
                    self.onClose();
                }catch (err) {

                }
            });

            this.netSocket.on('error', (err : string) => {self.onError(err); });
            this.netSocket.setEncoding('utf8');
            let tcpServerAddressArray = this.ip.split(':');
            this.netSocket.connect(tcpServerAddressArray[1], tcpServerAddressArray[0], () => {
                self.onConnect();
            });

            this.sendCmd(new McdnCmd(ServiceCommands.CLEAR_BUFF, undefined));

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

    }

    onData(data : string) {
        console.log(data)
    }
    onError(err : string){
        console.log(err)
        process.send?.(new IpcReply(IpcReplyType.ERROR, err))
    }
    onConnect(){
        this.connected = true;
        console.log('connected');
    }

    public disconnect () {
        if (!this.connected){
            process.exit(0);
            return;
        }
       // this.netSocket.close();
    }

    public sendCmd(cmd : McdnCmd ){
        // if (this.connected == false) {
        //     process.send?.(new IpcReply(IpcReplyType.ERROR, 'Not Connected'))
        //     return
        // }

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
                //actualCmd = 'ver'
                break;
            case Commands.ENCODER:
                //actualCmd = 'pos'
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
                //actualCmd = 'on'
                break;
            case Commands.SERVO_OFF:
                //actualCmd = 'off'
                break;
            case CommandsData.RelativeMove:
                //actualCmd = `rel ${cmd.data}${cmdTerm}go`
                break;
            case Commands.STATUS:
                //actualCmd = `sta`
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
            case ServiceCommands.GET_TRACE_DATA:
                //actualCmd = `play`
                break;
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
