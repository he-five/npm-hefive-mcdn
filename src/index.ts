import {EventEmitter} from "events";
import {ChildProcess} from "child_process";
import {McdnCmd, ServiceCommands} from "./drivers/mcdn-cmd";
import {IpcReply, IpcReplyType} from "./drivers/driver-replay";

const path = require('path');
const SerialPort = require('serialport')
const child_process = require('child_process')

enum Commands {
    FW_VER = `FW_VER`,
    ENCODER = 'ENCODER',
    FOLLOWING_ERROR = 'FOLLOWING_ERROR',
}

class McdnDriver extends EventEmitter {
    public connected: boolean
    private driverProcess: ChildProcess | null

    constructor() {
        super()
        this.driverProcess = null
        this.connected = false;
    }

    public enumSerialPorts() {
        SerialPort.list().then(
            (ports: any[]) => {
                let portsPath: string[] = [];
                ports.forEach((port) => {
                    //console.log(port['path'])
                    if (port['path']) {
                        portsPath.push(port['path']);
                    }
                })
                this.emit('ports', portsPath);
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
        this.driverProcess?.send(new McdnCmd(ServiceCommands.DISCONNECT));
    }

    public getFwVersion() {
        this.sendCmd(Commands.FW_VER)
    }

    public sendCmd(cmd: Commands | ServiceCommands) {
        console.log(`REQUEST: ${cmd}`)
        this.driverProcess?.send(new McdnCmd(cmd));
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
                this.emit('data', msg.drvReply);
            }
            if (msg.type == IpcReplyType.ERROR) {
                this.emit('error', msg.err);
            }
            if (msg.type == IpcReplyType.CONNECTED) {
                this.emit('connected', msg.drvReply);
            }
        })
    }
}

export {Commands, McdnDriver};