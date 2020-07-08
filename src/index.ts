import {EventEmitter} from "events";
import {ChildProcess} from "child_process";
import {McdnCmd, ServiceCommands} from "./drivers/mcdn-cmd";
import {DriverReply, IpcReply, IpcReplyType} from "./drivers/driver-replay";

const path = require('path');
const SerialPort = require('serialport')
const child_process = require('child_process')

enum Commands {
    FW_VER              = `FW_VER`,
    ENCODER             = 'ENCODER',
    FOLLOWING_ERROR     = 'FOLLOWING_ERROR',
    POWER_ON            = 'POWER_ON',
    POWER_OFF           = 'POWER_OFF',
    SERVO_ON            = 'SERVO_ON',
    SERVO_OFF           = 'SERVO_OFF',
    STATUS              = 'STATUS'
}

enum CommandsData {
    RelativeMove        = 'RelativeMove'
}

class RelativeMove {
    public distance : number

    constructor(distance : number) {
        this.distance = distance;
    }
}

class Status {
    public servoOn : boolean
    public powerOn : boolean


    constructor(servoOn : boolean, powerOn : boolean) {
        this.servoOn = servoOn;
        this.powerOn = powerOn;
    }
}

enum SerialPortType  {
    USB         = 'USB',
    UNKNOWN     = 'UNKNOWN'
}

class SerialPortInfo {

    public comName      : string
    public manufacturer : string
    public type         : SerialPortType

    constructor(comName: string, manufacturer: string, type : SerialPortType = SerialPortType.UNKNOWN ) {
        this.comName      = comName
        this.manufacturer = manufacturer
        this.type         = type
    }
}


class CommandReply {
    public cmd          : Commands | string
    public passed       : boolean
    public answer       : any
    public deviceId     : number

    constructor(cmd: Commands | string, passed: boolean, answer: any, deviceId: number) {
        this.cmd        = cmd
        this.passed     = passed
        this.answer     = answer
        this.deviceId   = deviceId

    }
}



class McdnDriver extends EventEmitter {
    public connected: boolean
    private driverProcess: ChildProcess | null
    private callbacksMap: any;
    private sequentialNum : number;

    constructor() {
        super()
        this.driverProcess = null
        this.connected = false
        this.callbacksMap = new Map();
        this.sequentialNum = 1;
    }

    public enumSerialPorts() {
        SerialPort.list().then(
            (ports: any[]) => {
                //let portsPath: string[] = [];
                let portsInfo: SerialPortInfo[] = []
                ports.forEach((port) => {
                    //console.log(port);
                    //console.log(port['path'])
                    let portType= port['path'].toUpperCase().includes('USB')
                    if (portType == false && port.hasOwnProperty('pnpId')){
                        portType= port['pnpId'].toUpperCase().includes('USB')
                    }
                    let info = new SerialPortInfo(  port['path'],
                                                    port['manufacturer'],
                                                portType? SerialPortType.USB : SerialPortType.UNKNOWN)
                    portsInfo.push(info)
                })

                this.emit('portsInfo',portsInfo )

            },
            (err: any) => {
                this.emit('error', err);
                //console.error(err)
            }
        )
    }

    public openMcdnPort(portName: string) {
        let serilOrMcdn = 'mcdn';
        this.createProcess(serilOrMcdn, portName);
    }

    public openSerialPort(portName: string) {
        let serilOrMcdn = 'serial';
        this.createProcess(serilOrMcdn, portName);
    }

    private createProcess(serilOrMcdn: string, portName: string) {
        this.driverProcess = child_process.fork(path.join(__dirname, '/drivers/index'), [serilOrMcdn])
        if (this.driverProcess!.connected) {
            this.connected = true
            this.consumeEvents()
            this.driverProcess?.send(new McdnCmd(ServiceCommands.CONNECT, portName));
        }
    }

    public disconnect() {
        this.driverProcess?.send(new McdnCmd(ServiceCommands.DISCONNECT, undefined));
    }

    public getFwVersion() {
        this.sendCmd(Commands.FW_VER)
    }

    public sendCmdData(cmd: CommandsData, data : any, callback?: (data: any) => void) {
        this.sendToDriver(callback, cmd, data);
    }

    public sendCmd(cmd: Commands | ServiceCommands, callback?: (data: any) => void) {
        //console.log(`REQUEST: ${cmd}`)
        let data = undefined
        // expected driver reply to call callback function too
        this.sendToDriver(callback, cmd, data);
    }

    private sendToDriver(callback: ((data: any) => void) | undefined, cmd: Commands | ServiceCommands | CommandsData, data: any) {
        if (callback) {
            let key = `${cmd.toString()}_${this.sequentialNum}}`;
            this.sequentialNum++
            if (this.sequentialNum > 1000){ this.sequentialNum = 0}
            this.callbacksMap.set(key, callback)
            //console.log(`sequentialNum: ${this.sequentialNum}`)
            this.driverProcess?.send(new McdnCmd(cmd, data, key));
        } else {
            this.driverProcess?.send(new McdnCmd(cmd, data));
        }
    }

    public sendStr(str: string) {
        console.log(`STR REQUEST: ${str}`)
        this.driverProcess?.send(new McdnCmd(ServiceCommands.STRING, str));
    }

    public consumeEvents() {
        this.driverProcess?.on('close', () => {
            //console.log('close')
            this.connected = false
            this.emit('disconnected');

        })
        this.driverProcess?.on('disconnect', () => {
            //console.log('driverProcess disconnect')
        })
        this.driverProcess?.on('error', err => {
            //console.log(`error: ${err}`)
            this.emit('error', err);
        })
        this.driverProcess?.on('message', (msg: IpcReply) => {
            //console.log(`driverProcess message: ${msg}`)

            if (msg.type == IpcReplyType.DRV) {
                let reply = msg.drvReply as DriverReply
                if (this.callbacksMap.has(reply.callbackId)){
                    let callbackFunc = this.callbacksMap.get(reply.callbackId)
                    this.callbacksMap.delete(reply.callbackId);

                    try {
                        callbackFunc(new CommandReply(reply.cmd, reply.passed, reply.answer,reply.deviceId))
                    }
                    catch (err) {
                        // TODO something
                    }

                }
            }

            if (msg.type == IpcReplyType.DRV) {
                let reply = msg.drvReply as DriverReply
                this.emit('data', new CommandReply(reply.cmd, reply.passed, reply.answer,reply.deviceId));
            }
            if (msg.type == IpcReplyType.ERROR) {
                this.emit('error', msg.err);
            }
            if (msg.type == IpcReplyType.CONNECTED) {
                let reply = msg.drvReply as DriverReply
                this.emit('connected', reply.answer);
            }
        })
    }
}

export {Commands, CommandsData, McdnDriver, CommandReply, RelativeMove, Status, SerialPortInfo, SerialPortType};