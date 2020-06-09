const SerialPort = require('serialport')
const HeFiveParser = require('./he-five-parser')


class Serial {
  private serialPort  : typeof SerialPort
  private connected   : boolean;
  private parser      : typeof HeFiveParser;

  constructor (){
    this.connected = false;
    this.serialPort = null;
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
        this.parser =  this.serialPort.pipe(new HeFiveParser())
        this.connected = true;
        this.startLisening();
    }
  }

  public readFwVersion(){
    this.serialPort.write('ver\r', 'ascii', (err: any) => {
      if (err) {
        // TODO add error handaling
      }
    })
  }

  private startLisening(){
    if (!this.connected){
      return;
    }
    // Switches the port into "flowing mode"
    this.serialPort.on('data', (data : Buffer) => {
      //console.log('RAW:', data.toString('ascii'))
    })

    this.parser.on('data', (data : Buffer) => {
      console.log('PARSED:', data.toString('ascii'))
    })
    // Open errors will be emitted as an error event
    this.serialPort.on('error', (err : any) => {
      console.log('Error: ', err.message)
    })
  }

  public disconnect () {}
}

export { Serial }
