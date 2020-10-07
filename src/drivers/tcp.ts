import {McdnCmd, ServiceCommands} from "./mcdn-cmd";
import {Commands} from "../commands";
import {CommandsData} from "../commands-data";
import {Queue} from "../helpers/queue";
import {DriverReply, IpcReply, IpcReplyType} from "./driver-replay";
import {RobotAxisData, RobotStatus, RobotStatusMask} from "./robot-cmd"

const Net                   = require('net');
const asciiEnc        = 'ascii'
const lineTerminator = '\r\n';
const cmdTerm = '\r';

class Tcp {
    private netSocket    : typeof Net.Socket
    private readonly deviceAnswerTimeout : number
    private ip           : any
    private cmd           : Commands | ServiceCommands | CommandsData|  string
    private callbackId     : string | undefined
    private queue         : Queue
    private cmdInProgress : boolean
    private cmdSendTime   : number
    private timer         : any
    private connected     : boolean
    private reply         : string
    private cmdPass       : string
    private cmdFail       : string

    constructor () {
        this.netSocket = null
        this.deviceAnswerTimeout = 5000
        this.ip = undefined
        this.cmd = ServiceCommands.CLEAR_BUFF
        this.queue = new Queue()
        this.cmdInProgress = false
        this.cmdSendTime = 0
        this.timer = undefined
        this.connected = false
        this.reply = ''
        this.cmdPass = '>'
        this.cmdFail = '?'
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
                    if ((Date.now() - this.cmdSendTime) > this.deviceAnswerTimeout) {
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
            }, 200)
        }
    }
    onClose(){
        console.log('disconnected');
        process.exit(0);
    }

    onData(data : string) {
        this.reply += data;
        if (this.reply.endsWith(this.cmdPass) || this.reply.endsWith(this.cmdFail)) {
            let driverReply = new DriverReply();
            driverReply.cmd = this.cmd;
            driverReply.callbackId = this.callbackId;
            driverReply.passed = this.reply.endsWith(this.cmdPass);
            if (this.cmd === ServiceCommands.STRING){
                this.cmdInProgress = false
                driverReply.answer = this.reply
                setImmediate(() => process.send?.(new IpcReply(IpcReplyType.DRV, driverReply)));
                this.checkForPendingCmd()
                return;
            }
            try {
                this.reply = this.reply.trim();
                this.reply = this.reply.replace(this.cmdPass, '').replace(this.cmdFail, '')
                driverReply.answer = this.reply;
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
                this.cmd = ''
                process.send?.(new IpcReply(IpcReplyType.CONNECTED, reply))
                return;
            case Commands.AXES:
            case CommandsData.Position:
            case Commands.ENCODER:
                if (reply.answer){
                    let posArray = reply.answer.split(lineTerminator);
                    posArray = posArray.filter((el: string)=> el != undefined && el != null && el != '');
                    posArray = posArray.map((eachAxis: string) =>{
                        let quotePosition = eachAxis.indexOf(':')
                        let equalPosition = eachAxis.indexOf('=')
                        if (quotePosition !== -1 && equalPosition !== -1) {
                            let axis = eachAxis.substring(quotePosition+1, equalPosition).trim();
                            if (this.cmd === Commands.AXES){
                                return axis;
                            }
                            return new RobotAxisData(axis, parseInt(eachAxis.slice(equalPosition+1)))
                        }
                    })
                    posArray = posArray.filter((el: any) => el != undefined && el != null && el != '');
                    reply.answer = posArray;
                }
                break;
            case Commands.STATUS:
                if (reply.answer){
                    let answerArr = reply.answer.split(lineTerminator);
                    answerArr = answerArr.map((eachStatusAxis: string) => {
                        let equalSignPosition = eachStatusAxis.indexOf('=')
                        if (equalSignPosition !== -1) {
                            eachStatusAxis = eachStatusAxis.slice(equalSignPosition + 1);
                        }
                        if (eachStatusAxis){
                            return parseInt(eachStatusAxis , 16);
                        }
                    })
                    answerArr = answerArr.filter((el:number)=> el != undefined && el != null)
                    if (this.cmd === Commands.STATUS){
                        let num = answerArr.reduce((prevValue:number,currentVal:number)=> prevValue | currentVal)
                        let status = new RobotStatus()
                        status.servoOn                  =   !Boolean(num & RobotStatusMask.ServoOn)
                        status.indexAcq                 =   Boolean(num & RobotStatusMask.IndexAcq)
                        status.index                    =   Boolean(num & RobotStatusMask.Index)
                        status.wraparound               =   Boolean(num & RobotStatusMask.Wraparound)
                        status.currentOverload          =   Boolean(num & RobotStatusMask.CurrentOverload)
                        status.fwrdLimit                =   !Boolean(num & RobotStatusMask.FwrdLimit)
                        status.digitalOverload          =   Boolean(num & RobotStatusMask.DigitalOverload)
                        status.inhibit                  =   Boolean(num & RobotStatusMask.Inhibit)
                        status.pathPoint                =   Boolean(num & RobotStatusMask.PathPoint)
                        status.accPhase                 =   Boolean(num & RobotStatusMask.AccPhase)
                        status.overrun                  =   Boolean(num & RobotStatusMask.Overrun)
                        status.powerFail                =   Boolean(num & RobotStatusMask.PowerFail)
                        status.inMotion                 =   !Boolean(num & RobotStatusMask.MotionCompleted)
                        status.rvsLimit                 =   Boolean(num & RobotStatusMask.RvsLimit)
                        status.digitalOverload          =   Boolean(num & RobotStatusMask.DigitalOverload)
                        status.busy                     =   Boolean(num & (RobotStatusMask.SysMacroRunning | RobotStatusMask.UserMacroRunning ))

                        reply.answer = status
                    }
                }
                break;
            default :
                reply.answer = reply.answer.replace(/\r\n/g, '')
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

        if (cmd.cmd === CommandsData.CmdPassString){
            if (cmd.data) this.cmdPass = cmd.data.toString()
            return;
        }
        if (cmd.cmd === CommandsData.CmdFailString){
            if (cmd.data) this.cmdFail = cmd.data.toString()
            return;
        }

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
                actualCmd = '.ver'
                break;
            case Commands.ENCODER:
                actualCmd = '.enc'
                break;
            case Commands.POWER_ON:
                actualCmd = '.power'
                break;
            case Commands.POWER_OFF:
                actualCmd = '.nopower'
                break;
            case Commands.SERVO_ON:
                actualCmd = '.servo'
                break;
            case Commands.SERVO_OFF:
                actualCmd = '.noservo'
                break;
            case CommandsData.RelativeMove:
            case CommandsData.AbsMove:
                if (cmd.data) {
                    let data: RobotAxisData = cmd.data as RobotAxisData;
                    if (data) {
                        let moveCmd = this.cmd === CommandsData.RelativeMove ? '.rel' : '.abs';
                        actualCmd = `${moveCmd} ${data.name} = ${data.value} go ${data.name}`
                    }
                }
                break;
            case CommandsData.Delay:
                actualCmd = `.delay ${cmd.data}`
                break;
            case Commands.AXES:
                actualCmd = `.pos`
                break;
            case Commands.STATUS:
                actualCmd = '.sta'
                break;
            case Commands.STOP:
                actualCmd = '.stop'
                break;
            case ServiceCommands.CLEAR_BUFF:
                actualCmd = ' '
                break;
            case ServiceCommands.STRING:
                actualCmd = cmd.data?.toString()
                break;
            case CommandsData.Position:
                actualCmd = '.pos'
                break;
        }
        this.netSocket.write(`${actualCmd}${cmdTerm}`, asciiEnc, (err: any) => {
            if (err) {
                process.send?.(new IpcReply(IpcReplyType.ERROR, err.message))
            }
        })
    }

}

export { Tcp }
