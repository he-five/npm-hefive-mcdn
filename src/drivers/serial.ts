import {cmdFail, cmdPass, Commands} from "../mcdn-cmd";
import {DriverReply, IpcReply, IpcReplyType} from "../driver-replay";
const SerialPort = require('serialport')
const HeFiveParser = require('./he-five-parser')

const lineTerminator = '\r\n'


class Serial {
  private serialPort  : typeof SerialPort
  private connected   : boolean;
  private parser      : typeof HeFiveParser;
  private cmd         : Commands;



  constructor (){
    this.connected  = false;
    this.serialPort = null;
    this.cmd        = Commands.NONE;
  }
  public connect (portName : string) {
    if (!this.connected){
      // Not connected
        this.serialPort = new SerialPort(portName,{ baudRate: 115200 }, (err: string) => {
          if (err){
            this.connected = false;
            // TODO Error event 'Open port failed'
          }
        });
        this.parser =  this.serialPort.pipe(new HeFiveParser({terminators: [cmdPass, cmdFail]}))
        this.connected = true;
        this.startLisening();
    }
  }

  public readFwVersion(){
    if (this.connected){
      this.cmd = Commands.FW_VER;
      this.serialPort.write('ver\r', 'ascii', (err: any) => {
        if (err) {
          // TODO add error handaling
        }
      })
    }
    else{
      // SEND error
    }
  }

  private startLisening(){
    if (!this.connected){
      return;
    }
    // Switches the port into "flowing mode"
    //this.serialPort.on('data', (data : Buffer) => {
    //   console.log('RAW:', data.toString('ascii'))
    // })

    this.parser.on('data', (data : Buffer) => {
      //setImmediate((data) =>{
        let strData =  data.toString('ascii')
        console.log('Complete answer:', strData)
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
            reply.answer = strData.slice(0, position);
            //console.log('reply.answer:'+ reply.answer)
          }
          else { // ERROR

          }
         this.postProcessAnswer(reply)
        }
     //})
    })
    // Open errors will be emitted as an error event
    this.serialPort.on('error', (err : any) => {
      console.log('Error: ', err.message)
      //process.send?.(err);
    })
  }

  private postProcessAnswer(reply : DriverReply){

    switch(reply.cmd){
      case Commands.FW_VER:
        reply.answer = reply.answer.slice(0,reply.answer.indexOf(','))
        break;
    }
    //console.log(reply);

    process.send?.(new IpcReply(IpcReplyType.DRV, reply))

  }

  public disconnect () {}
}

export { Serial }
