import {cmdFail, cmdPass, McdnCmd, ServiceCommands, StatusMask} from "./mcdn-cmd";
import {DriverReply, IpcReply, IpcReplyType} from "./driver-replay";
import {Commands, RelativeMove, Status} from "../index";

const SerialPort = require('serialport')
const HeFiveParser = require('./he-five-parser')
const lineTerminator = '\r\n'
const cmdTerm = '\r'
const asciiEnc     = 'ascii'

class Queue{
  _queue : any[];

  constructor(queue?: any[]) {
    this._queue = queue || [];
  }

  enqueue(item: any) {
    this._queue.push(item);
  }

  dequeue(): any {
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
  private parser        : typeof HeFiveParser
  private cmd           : Commands | ServiceCommands | string
  private callbacId     : string | undefined
  private queue         : Queue
  private cmdInProgress : boolean
  private cmdSendTime   : number
  private timer         : any

  constructor () {
    this.serialPort = null
    this.cmd = ServiceCommands.CLEAR_BUFF
    this.queue = new Queue()
    this.cmdInProgress = false
    this.cmdSendTime = 0
    this.timer = undefined

  }

  public connect (portName : string) {
    if (!this.serialPort?.connected){
      // Not connected
        this.serialPort = new SerialPort(portName,{ baudRate: 115200 }, (err: any) => {
          if (err){
            process.send?.(new IpcReply(IpcReplyType.ERROR, err.message))
          }
        });

      this.parser =  this.serialPort.pipe(new HeFiveParser({terminators: [cmdPass, cmdFail]}))
      this.startListening();
      // Send empty command before starting real communication
      this.sendCmd(new McdnCmd(ServiceCommands.CLEAR_BUFF, undefined));

      this.timer = setInterval(() => {
        if (this.cmdInProgress) {
          if ((Date.now() - this.cmdSendTime) > 500) {
            switch (this.cmd) {
              case ServiceCommands.CLEAR_BUFF:
                let reply = new DriverReply();
                reply.cmd = this.cmd;
                reply.callbackId = this.callbacId;
                reply.answer = false
                process.send?.(new IpcReply(IpcReplyType.CONNECTED, reply))
                this.disconnect()
                break;
              default:
                process.send?.(new IpcReply(IpcReplyType.ERROR, `Command ${this.cmd} Timeout`))
                this.cmdInProgress  = false
            }
          }

        }
      }, 50)

    }
  }


  public sendCmd(cmd : McdnCmd ){
    if (this.serialPort.connected == false) {
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
    this.callbacId        = cmd.uniqueId
    this.cmdSendTime      = Date.now()

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
      case Commands.POWER_ON:
        actualCmd = 'enable'
        break;
      case Commands.POWER_OFF:
        actualCmd = 'disable'
        break;
      case Commands.SERVO_ON:
        actualCmd = 'on'
        break;
      case Commands.SERVO_OFF:
        actualCmd = 'off'
        break;
      case Commands.RelativeMove:
        let data = cmd.data as RelativeMove
        actualCmd = `rel ${data.distance}${cmdTerm}go`
       break;
      case Commands.STATUS:
        actualCmd = `sta`
        break;

      case ServiceCommands.CLEAR_BUFF:
        actualCmd = ' '
        break;
      case ServiceCommands.STRING:
        actualCmd = cmd.data
        break;
    }
    //console.log(`${actualCmd}${cmdTerm}`)

    this.serialPort.write(`${actualCmd}${cmdTerm}`, asciiEnc, (err: any) => {
      if (err) {
        process.send?.(new IpcReply(IpcReplyType.ERROR, err.message))
      }
    })
  }

  private startListening(){
    this.parser.on('data', (data : Buffer) => {
        let strData =  data.toString(asciiEnc)
        //console.log('answer:', strData)
        if (strData.length > 0){
          //new
          let reply = new DriverReply();
          reply.cmd = this.cmd;
          reply.callbackId = this.callbacId;

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
      this.cmdInProgress = false
      console.log('Error: ', err.message)
      process.send?.(new IpcReply(IpcReplyType.ERROR, err))
    })


    // The close event is emitted when the port is closed
    this.serialPort.on('close', () => {
      process.exit(0);
    })
  }



  private postProcessAnswer(reply : DriverReply){
    this.cmdInProgress = false
      switch(reply.cmd){
        case ServiceCommands.CLEAR_BUFF:
          // replay verify
          reply.answer = true
          process.send?.(new IpcReply(IpcReplyType.CONNECTED, reply))
          return;
        case Commands.FW_VER:
          if (reply.answer){
            reply.answer = reply.answer.slice(0,reply.answer.indexOf(','))
          }
          break;
        case Commands.STATUS:
          if (reply.answer){
            let num = Number(reply.answer)
            let servoOn = (num & StatusMask.ServoOn) == 0 ? false:true
            let powerOn = (num & StatusMask.PowerOn) == 0 ? false:true
            reply.answer = new Status(servoOn, powerOn)
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
    if (!this.serialPort.connected){
      process.exit(0);
      return;
    }
    this.serialPort.close();
  }
}

export { Serial }

