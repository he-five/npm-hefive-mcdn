class Serial {
  constructor () {}
  public connect () {}
  public disconnect () {}
}

let serial = new Serial()

serial.connect()

process.on('message', (data) => {
   switch (data.cmd) {
     case 'disconnect':
       serial.disconnect();
       process.exit(0);
       break;
     default:
       console.log('unknown command')
   }
  //
  // }
  //
})
