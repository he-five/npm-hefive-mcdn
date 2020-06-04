class Serial {
  constructor () {}
  public connect () {}
}

let serial = new Serial()

serial.connect()

process.on('message', msg => {
  //debug(msg);
  //
  // switch (msg) {
  //     case
  //
  // }
  //
})
