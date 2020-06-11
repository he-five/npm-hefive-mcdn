import {cmdFail, cmdPass, Commands} from "../mcdn-cmd";
import {DriverReply} from "../driver-replay";
const delimiter  = require('@serialport/parser-delimiter');
const SerialPort = require('serialport')
const HeFiveParser = require('./he-five-parser')

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
      console.log('PARSED:', data)
      let strData =  data.toString('ascii')
      if (data.length > 0){
        let reply = new DriverReply();
        reply.cmd = this.cmd;
        strData = strData.trim();
        reply.passed = strData.endsWith(cmdPass);
        let arg  = strData.slice(0)
        //reply.


      }
    })
    // Open errors will be emitted as an error event
    this.serialPort.on('error', (err : any) => {
      console.log('Error: ', err.message)
      //process.send?.(err);
    })
  }

  public disconnect () {}
}

export { Serial }
