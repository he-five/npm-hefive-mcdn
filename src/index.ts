import {McdnCmd, Commands} from "./mcdn-cmd";
import {ChildProcess} from 'child_process'
import {EventEmitter} from 'events';

//import { PlatformPath }  from 'path';
const path =  require('path');
const child_process = require('child_process')

class McdnDriver extends EventEmitter {
  public connected : boolean
  private driverProcess: ChildProcess | null

  constructor () {
    super()
    this.driverProcess = null
    this.connected = false;
  }

  public connectMcdn (portName: string) {
    let serilOrMcdn = 'mcdn';
    this.createProcess(serilOrMcdn);
  }

  public connectSerial (portName: string) {
    let serilOrMcdn = 'serial';
    this.createProcess(serilOrMcdn);
   }

  private createProcess(serilOrMcdn: string) {
    this.driverProcess = child_process.fork(path.join(__dirname, '/drivers/index'), serilOrMcdn)
    if (this.driverProcess!.connected) {
      this.connected = true
      this.consumeEvents()
    }
  }

  public disconnect () {
    this.driverProcess?.send(new McdnCmd(Commands.DISCONNECT));
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
