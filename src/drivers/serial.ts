import {cmdFail, cmdPass, Commands, McdnCmd} from "../mcdn-cmd";
import {DriverReply, IpcReply, IpcReplyType} from "./driver-replay";

const SerialPort = require('serialport')
const HeFiveParser = require('./he-five-parser')
const lineTerminator = '\r\n'
const cmdTerm = '\r'
const asciiEnc     = 'ascii'

class Queue{
  _queue: Commands[];

  constructor(queue?: Commands[]) {
    this._queue = queue || [];
  }

  enqueue(item: Commands) {
    this._queue.push(item);
  }

  dequeue(): Commands | undefined {
    return this._queue.shift();
  }

  clear() {
    this._queue = [];
  }

  get count(): number {
    return this._queue.length;
  }
}

class Serial {
  private serialPort    : typeof SerialPort
  private connected     : boolean;
  private parser        : typeof HeFiveParser;
  private cmd           : Commands;
  private queue         : Queue
  private cmdInProgress : boolean;

  constructor (){
    this.connected      = false;
    this.serialPort     = null;
    this.cmd            = Commands.EMPTY;
    this.queue          = new Queue()
    this.cmdInProgress  = false

  }
  public connect (portName : string) {
    if (!this.connected){
      // Not connected
        this.serialPort = new SerialPort(portName,{ baudRate: 115200 }, (err: any) => {
          if (err){
            this.connected = false;
            process.send?.(new IpcReply(IpcReplyType.ERROR, err.message))
          }
        });

      // Send empty command before starting real-communication
      this.queue.enqueue(Commands.EMPTY);


      this.parser =  this.serialPort.pipe(new HeFiveParser({terminators: [cmdPass, cmdFail]}))
      this.connected = true;
      this.startLisening();
    }
  }

  public sendStr(cmd : string){
    if (this.connected == false) {
      process.send?.(new IpcReply(IpcReplyType.ERROR, 'Not Connected'))
      return
    }

    if (this.cmdInProgress == false){
      this.cmdInProgress = true
      this.sendThruPort(Commands.STRING,cmd);
    }
    // else{
    //   this.queue.enqueue(cmd);
    // }
  }

  public sendCmd(cmd : Commands){
    if (this.connected == false) {
      process.send?.(new IpcReply(IpcReplyType.ERROR, 'Not Connected'))
      return
    }

    if (this.cmdInProgress == false){
      this.cmdInProgress = true
      this.sendThruPort(cmd);
    }
    else{
      this.queue.enqueue(cmd);
    }

  }


  private sendThruPort(cmd: Commands, data?: string) {
    this.cmd = cmd;
    let actualCmd: string | undefined = ''
    switch (this.cmd) {
      case Commands.FW_VER:
        actualCmd = 'ver'
        break;
      case Commands.ENCODER:
        actualCmd = 'pos'
        break;
      case Commands.FOLLOWING_ERROR:
        actualCmd = 'err'
        break;
      case Commands.EMPTY:
        actualCmd = ' '
        break;
      case Commands.STRING:
        actualCmd = data
        break;
    }
    //console.log(`${actualCmd}${cmdTerm}`)

    this.serialPort.write(`${actualCmd}${cmdTerm}`, asciiEnc, (err: any) => {
      if (err) {
        process.send?.(new IpcReply(IpcReplyType.ERROR, err.message))
      }
    })
  }

  private startLisening(){
    if (!this.connected){
      return;
    }

    this.parser.on('data', (data : Buffer) => {
        let strData =  data.toString(asciiEnc)
        //console.log('answer:', strData)
        if (strData.length > 0){
          //new
          let reply = new DriverReply();
          reply.cmd = this.cmd;
          strData = strData.trim();
          reply.passed = strData.endsWith(cmdPass);
          strData  = strData.slice(0, strData.length - 1);
          let position:number =  strData.indexOf(lineTerminator);
          if (position !== -1 ) {
            let devStr = strData.slice(position+lineTerminator.length, strData.length);
            //console.log('deviceId:', devStr)
            reply.deviceId = parseInt(devStr)
            if (strData){
              reply.answer = strData.slice(0, position);
            }
            //console.log('reply.answer:'+ reply.answer)
          }
          this.postProcessAnswer(reply)
        }
     })
    // Open errors will be emitted as an error event
    this.serialPort.on('error', (err : any) => {
      //this.cmdInProgress = false
      console.log('Error: ', err.message)
      process.send?.(new IpcReply(IpcReplyType.ERROR, err))
    })


  }

  private postProcessAnswer(reply : DriverReply){
    this.cmdInProgress = false
      switch(reply.cmd){
        case Commands.EMPTY:
          this.checkForPendingCmd();
          return;
        case Commands.FW_VER:
          if (reply.answer){
            reply.answer = reply.answer.slice(0,reply.answer.indexOf(','))
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

  public disconnect () {
    if (!this.connected){
      return;
    }
    this.connected = false
    this.serialPort.close();
  }
}

export { Serial }
