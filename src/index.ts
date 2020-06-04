var path = require('path');
import { ChildProcess } from 'child_process'
const child_process = require('child_process')

import {EventEmitter} from 'events';

class McdnDriver extends EventEmitter {
  public connected = false

  private driverProcess: ChildProcess | null

  constructor () {
    super()
    this.driverProcess = null
  }

  public connectMcdn (portName: string) {
    this.driverProcess = child_process.fork(path.join(__dirname,'/drivers/mcdn'), [portName])
    if (this.driverProcess!.connected) {
      this.connected = true
      this.consumeEvents()
    }
  }

  public connectSerial (portName: string) {
    this.driverProcess = child_process.fork(path.join(__dirname,'./drivers/serial'), [portName])
    if (this.driverProcess!.connected) {
      this.connected = true
      this.consumeEvents()
    }
  }

  public disconect () {}

  /**
   * events.EventEmitter
   * 1. close
   * 2. disconnect
   * 3. error
   * 4. exit
   * 5. message
   */

  public consumeEvents () {
    this.driverProcess?.on('close', () => {
      console.log('driverProcess close')
    })
    this.driverProcess?.on('disconnect', () => {
      console.log('driverProcess disconnect')
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
