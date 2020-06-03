import { ChildProcess } from 'child_process'
const child_process = require('child_process')

import events from 'events'
import Debug from 'debug'
const debug = Debug('@hefive/mcdn')

class McdnDriver extends events.EventEmitter {
  public connected = false

  private driverProcess: ChildProcess | null

  constructor () {
    super()
    this.driverProcess = null
  }

  public connectMcdn (portName: string) {
    this.driverProcess = child_process.fork('./drivers/mcdn.ts', [portName])
    if (this.driverProcess!.connected) {
      this.connected = true
      this.consumeEvents()
    }
  }

  public connectSerial (portName: string) {
    this.driverProcess = child_process.fork('./drivers/serial.ts', [portName])
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
      debug('driverProcess close')
    })
    this.driverProcess?.on('disconnect', () => {
      debug('driverProcess disconnect')
    })
    this.driverProcess?.on('error', err => {
      debug(`driverProcess error: ${err}`)
    })
    this.driverProcess?.on('message', msg => {
      debug(`driverProcess error: ${msg}`)
    })
  }
}

let driver = new McdnDriver();
driver.connectMcdn('COMPORT');

export { McdnDriver }
