import {cmdFail, cmdPass, McdnCmd, ServiceCommands, StatusMask, Trace} from "./mcdn-cmd";
import {DriverReply, IpcReply, IpcReplyType} from "./driver-replay";
import {Inputs, Status} from "../index";
import {Commands} from "../commands";
import {CommandsData} from "../commands-data";

const SerialPort      = require('serialport')
const HeFiveParser    = require('./he-five-parser')
const lineTerminator  = '\r\n'
const cmdTerm         = '\r'
const asciiEnc        = 'ascii'

class Queue{
  private cmds : McdnCmd[]

  constructor(queue?: McdnCmd[]) {
    this.cmds = queue || [];
  }

  enqueue(item: any) {
    this.cmds.push(item);
  }

  dequeue(): any {
    return this.cmds.shift();
  }

  clear() {
    this.cmds = [];
  }

  get count(): number {
    return this.cmds.length;
  }
}

class Serial {
  private serialPort    : typeof SerialPort
  private parser        : typeof HeFiveParser
  private cmd           : Commands | ServiceCommands | CommandsData|  string
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
          if ((Date.now() - this.cmdSendTime) > 3000) {
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
                let failed = new DriverReply();
                failed.cmd = this.cmd;
                failed.callbackId = this.callbacId;
                failed.passed = false
                process.send?.(new IpcReply(IpcReplyType.DRV, failed))

                this.cmdInProgress  = false
            }
          }

        }
      }, 100)

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
      case CommandsData.RelativeMove:
        actualCmd = `rel ${cmd.data}${cmdTerm}go`
       break;
      case Commands.STATUS:
        actualCmd = `sta`
        break;
      case Commands.STOP:
        actualCmd = `stop`
        break;
      case Commands.AXIS1:
        actualCmd = `1`
        break;
      case Commands.AXIS2:
        actualCmd = `2`
        break;
      case Commands.INPUTS:
        actualCmd = `inp`
        break;
      case Commands.GO:
        actualCmd = `go`
        break;
      case ServiceCommands.CLEAR_BUFF:
        actualCmd = ' '
        break;
      case ServiceCommands.STRING:
        actualCmd = cmd.data?.toString()
        break;
      case ServiceCommands.TRACE:
        actualCmd =`trace ${cmd.data}`
        break;
      case ServiceCommands.CH1:
      case ServiceCommands.CH2:
      case ServiceCommands.CH3:
      case ServiceCommands.TLEVEL:
        actualCmd =`${this.cmd} ${cmd.data}`
        break;
      case ServiceCommands.TRATE:
        let rateInMicrosecond = (cmd.data as number) / 50
        actualCmd =`${this.cmd} ${rateInMicrosecond}`
        break;

        // `ch1 ${trace.channel1Type}${cmdTerm}
        //  ch2 ${trace.channel2Type}${cmdTerm}
        //  ch3 ${trace.channel3Type}${cmdTerm}
        //  trate ${trace.rateInMicrosecond/50}${cmdTerm}
        //  tlevel ${trace.level}${cmdTerm}

         //console.log(`ServiceCommands.TRACE ${actualCmd}`)

      case ServiceCommands.STOP_TRACE:
        actualCmd =`trace 0`
        //console.log(`ServiceCommands.STOP_TRACE ${actualCmd}`)
        break;
      case ServiceCommands.GET_TRACE_DATA:
        actualCmd = `play`
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
    //console.log(`--- TX ${Date.now()} ${actualCmd}`)
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

          if (reply.cmd === ServiceCommands.STRING || reply.cmd === ServiceCommands.GET_TRACE_DATA){
            this.cmdInProgress = false
            reply.answer  = strData;
            //reply.passed = strData.endsWith(cmdPass);
            process.send?.(new IpcReply(IpcReplyType.DRV, reply));
            this.checkForPendingCmd()
            return;
          }

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
            let num = parseInt(reply.answer, 16)
            let status = new Status()
            status.servoOn                  = (num & StatusMask.ServoOn) == 0       ?  false:true
            status.powerOn                  = (num & StatusMask.PowerOn) == 0       ?  false:true
            status.moving                   = (num & StatusMask.AtTarget) == 0      ?  true:false
            status.positionCaptured         = (num & StatusMask.PosCaptured) == 0   ?  false:true

            status.indexCaptured            = (num & StatusMask.IdxCaptured) == 0   ?  false:true
            status.homingCompleted          = (num & StatusMask.Homed) == 0         ?  false:true
            status.phaseAligning            = (num & StatusMask.Aligning) == 0      ?  false:true
            status.phaseAlignmentCompleted  = (num & StatusMask.Aligned) == 0       ?  false:true

            status.busy                     = (num & StatusMask.Busy) == 0          ?  false:true
            status.overCurrent              = (num & StatusMask.OverCurrent) == 0   ?  false:true
            status.pvtQueueFull             = (num & StatusMask.Inhibit) == 0       ?  false:true
            status.pvtQueueEmpty            = (num & StatusMask.PvtEmpty) == 0      ?  false:true

            status.overCurrentWarning       = (num & StatusMask.AmpWarning) == 0    ?  false:true
            status.amplifierCurrentLimit    = (num & StatusMask.AmpFault) == 0      ?  false:true
            status.followingErrorLimit      = (num & StatusMask.PosError) == 0      ?  false:true
            status.counterWrapAround        = (num & StatusMask.Wraparound) == 0    ?  false:true

            reply.answer = status
          }
          break;
        case Commands.INPUTS:
          //console.log('INPUTS: ', reply.answer)
          let num = parseInt(reply.answer, 16) & 0x0007
          let input = new Inputs();
          this.decodeInputs(input, num);
          reply.answer = input
          break;
      }
    //console.log(`--- RX ${Date.now()} ${reply.answer}`)
    process.send?.(new IpcReply(IpcReplyType.DRV, reply))
    this.checkForPendingCmd();

  }

  private decodeInputs(input: Inputs, num: number) {
    input.axis1HallAActive = (num & 0x0001) != 0
    input.axis1HallBActive = (num & 0x0002) != 0
    input.axis1HallCActive = (num & 0x0004) != 0
    input.axis1OverTemp = (num & 0x0100) != 0
    input.axis1ForwardLimit = (num & 0x0200) != 0
    input.axis1ReverseLimit = (num & 0x0400) != 0
    input.axis1ExtraLimit = (num & 0x0800) != 0
    input.axis2HallAActive = (num & 0x0010) != 0
    input.axis2HallBActive = (num & 0x0020) != 0
    input.axis2HallCActive = (num & 0x0040) != 0
    input.axis2OverTemp = (num & 0x1000) != 0
    input.axis2ForwardLimit = (num & 0x2000) != 0
    input.axis2ReverseLimit = (num & 0x4000) != 0
    input.axis2ExtraLimit = (num & 0x8000) != 0
  }

  private checkForPendingCmd() {
    let queueCount = this.queue.count;
    if (queueCount > 0) {
      let nextCmd = this.queue.dequeue()
      if (nextCmd) {
        this.sendCmd(nextCmd)
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


