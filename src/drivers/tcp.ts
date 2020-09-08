import {cmdFail, cmdPass, McdnCmd, ServiceCommands} from "./mcdn-cmd";
import {Commands} from "../commands";
import {CommandsData} from "../commands-data";
import {Queue} from "../helpers/queue";
import {DriverReply, IpcReply, IpcReplyType} from "./driver-replay";
import {RobotAxisValue, RobotData, RobotStatus, RobotStatusMask} from "./robot-cmd"

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
    onClose(){
        console.log('disconnected');
        process.exit(0);
    }

    onData(data : string) {
        this.reply += data;
        if (this.reply.endsWith(cmdPass) || this.reply.endsWith(cmdFail)) {
            let driverReply = new DriverReply();
            driverReply.cmd = this.cmd;
            driverReply.callbackId = this.callbackId;
            driverReply.passed = this.reply.endsWith(cmdPass);
            if (this.cmd === ServiceCommands.STRING){
                this.cmdInProgress = false
                driverReply.answer = this.reply
                setImmediate(() => process.send?.(new IpcReply(IpcReplyType.DRV, driverReply)));
                this.checkForPendingCmd()
                return;
            }
            try {
                this.reply = this.reply.trim();
                this.reply = this.reply.replace(cmdPass, '').replace(cmdFail, '')
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
                process.send?.(new IpcReply(IpcReplyType.CONNECTED, reply))
                return;
            case CommandsData.Position:
            case Commands.ENCODER:
            case Commands.STATUS:
                if (reply.answer){
                    let answerArr = reply.answer.split(lineTerminator);
                    answerArr = answerArr.map((eachStatusAxis: string) => {
                        let equalSignPosition = eachStatusAxis.indexOf('=')
                        if (equalSignPosition !== -1) {
                            eachStatusAxis = eachStatusAxis.slice(equalSignPosition + 1);
                        }
                        if (this.cmd === Commands.STATUS){
                            if (eachStatusAxis){
                                return parseInt(eachStatusAxis , 16);
                            }}
                        else{
                            return  parseInt(eachStatusAxis);
                        }
                    })
                    answerArr = answerArr.filter((el:number)=> el !== undefined)
                    if (this.cmd === Commands.STATUS){
                        let num = answerArr.reduce((prevValue:number,currentVal:number)=> prevValue | currentVal)
                        let status = new RobotStatus()
                        status.servoOn                  =   !Boolean(num & RobotStatusMask.ServoOn)
                        status.indexAcq                 =   Boolean(num & RobotStatusMask.IndexAcq)
                        status.busy                     =   Boolean(num & RobotStatusMask.Busy)
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
                    else{
                        let robotPosition = new RobotAxisValue();
                        robotPosition.T = answerArr[0];
                        robotPosition.R = answerArr[1];
                        robotPosition.Z = answerArr[2];
                        robotPosition.R2 = answerArr[3];
                        robotPosition.X = answerArr[4];

                        reply.answer = robotPosition;
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
                    let data: RobotData = cmd.data as RobotData;
                    if (data) {
                        let moveCmd = this.cmd === CommandsData.RelativeMove ? '.rel' : '.abs';
                        actualCmd = `${moveCmd} ${data.axis} = ${data.distance} go ${data.axis}`
                    }
                }
                break;
            case CommandsData.Delay:
                actualCmd = `.delay ${cmd.data}`
                break;
            case Commands.AXESNUM:
                actualCmd = `._axes`
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
