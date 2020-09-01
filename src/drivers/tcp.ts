import {McdnCmd, ServiceCommands} from "./mcdn-cmd";
import {Commands} from "../commands";
import {CommandsData} from "../commands-data";
import {Queue} from "../helpers/queue";
import {IpcReply, IpcReplyType} from "./driver-replay";
const Net                   = require('net');

class Tcp {
    //constructor () {}
   // public connect () {}
   // public disconnect () {}
   // public sendCmd(cmd : McdnCmd ) {}
    //public sendStr(cmd : string){}


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
            // this.netSocket.on('close', ()=> {
            //     try {
            //         self.onClose();
            //     }catch (err) {
            //
            //     }
            // });
            this.netSocket.on('error', (err : string) => {self.onError(err); });
            //this.netSocket.setEncoding('utf8');
            this.netSocket.connect(this.ip, () => {
                self.onConnect();
            });

            // Watch for command which execute more than 1000
            // setInterval(() => {
            //     if (self.waitForReply){
            //         if ( performance.now() - self.commandStartTime > 5000 ){
            //             self.onData(cmdFail);
            //             childLog.error('Command: ' + this.commandCallback.command + ' didn\'t receive terminated reply');
            //         }
            //     }
            // }, 1000);
        }
    }
    onData(data : string) {

        console.log(data)

    }
    onError(err : string){

        console.log(err)
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
        this.netSocket.close();
    }

    public sendCmd(cmd : McdnCmd ){
        if (this.connected == false) {
            process.send?.(new IpcReply(IpcReplyType.ERROR, 'Not Connected'))
            return
        }

        if (this.cmdInProgress == false){
           // this.sendThruPort(cmd);
        }
        else{
            this.queue.enqueue(cmd);
        }
    }
}

export { Tcp }
