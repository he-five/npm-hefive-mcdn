const SerialPort = require('serialport')


class Serial {
  private serialPort : typeof SerialPort
  private connected : boolean;

  constructor (){
    this.connected = false;
    this.serialPort = null;
  }
  public connect (portName : string) {
    if (!this.connected){
      // Not connected
        this.serialPort = new SerialPort(portName, (err: string) => {
          if (err){
            this.connected = false;
            // TODO Error event 'Open port failed'
          }
        });
        this.connected = true;
        this.startLisening();
    }
  }

  public readFwVersion(){
    this.serialPort.write('ver', (err: any) => {
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
    this.serialPort.on('data', (data : string) => {
      console.log('Data:', data)
    })

    // Open errors will be emitted as an error event
    this.serialPort.on('error', (err : any) => {
      console.log('Error: ', err.message)
    })
  }

  public disconnect () {}
}

export { Serial }
