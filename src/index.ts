import {McdnCmd, Commands} from "./mcdn-cmd";
import {ChildProcess} from 'child_process'
import {EventEmitter} from 'events';

const path =  require('path');
const SerialPort = require('serialport')
const child_process = require('child_process')


class McdnDriver extends EventEmitter {
  public connected : boolean
  private driverProcess: ChildProcess | null

  constructor () {
    super()
    this.driverProcess = null
    this.connected = false;
  }

  public enumSerialPorts() {

    SerialPort.list().then(
        (ports:any[]) => {
          let portsPath : string[] = [];
          ports.forEach((port) => {
            console.log(port['path'])
            if (port['path']){
              portsPath.push(port['path']);
            }
          })
          this.emit('ports', portsPath);
        },
        (err:any) => {
          this.emit('error', err);
          //console.error(err)

        }
    )
  }

  public connectMcdn (portName: string) {
    let serilOrMcdn = 'mcdn';
    this.createProcess(serilOrMcdn, portName);
  }

  public connectSerial (portName: string) {
    let serilOrMcdn = 'serial';
    this.createProcess(serilOrMcdn, portName);
   }

  private createProcess(serilOrMcdn: string, portName: string) {
    this.driverProcess = child_process.fork(path.join(__dirname, '/drivers/index'), [serilOrMcdn])
    if (this.driverProcess!.connected) {
      this.connected = true
      this.consumeEvents()
      this.driverProcess?.send(new McdnCmd(Commands.CONNECT, portName));
    }
  }

  public disconnect () {
    this.driverProcess?.send(new McdnCmd(Commands.DISCONNECT));
  }

  public getFwVersion() {
    this.driverProcess?.send(new McdnCmd(Commands.FW_VER));
  }

  public consumeEvents () {
    this.driverProcess?.on('close', () => {
      console.log('driverProcess close')
      this.connected = false
    })
    this.driverProcess?.on('disconnect', () => {
      //console.log('driverProcess disconnect')
    })
    this.driverProcess?.on('error', err => {
      console.log(`driverProcess error: ${err}`)
    })
    this.driverProcess?.on('message', msg => {
      console.log(`driverProcess error: ${msg}`)

    })
  }
}

export { McdnDriver }
