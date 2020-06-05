
class MCDN {
  constructor () {}
  public connect () {}
  public disconnect () {}
}

let mcdn = new MCDN()

mcdn.connect()

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
  // switch (msg) {
  //     case
  //
  // }
  //
})

