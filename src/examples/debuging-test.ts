import {CommandReply, Commands, CommandsData,McdnDriver, RelativeMove} from '../index'

// eslint-disable-next-line no-unused-vars
function testCallback (data:any) {
  let reply = data as CommandReply
  console.log(`testCallback: ${JSON.stringify(data)}`)
}

function testCallback1 (data:any) {
  let reply = data as CommandReply
  console.log(`testCallback: ${JSON.stringify(data)}`)
}

function testCallback2 (data:any) {
  let reply = data as CommandReply
  console.log(`testCallback: ${JSON.stringify(data)}`)
}

const i = 0

const driver = new McdnDriver()
console.time('EXECUTION TIME enumSerialPorts')
driver.enumSerialPorts()
driver.on('portsInfo', (ports) => {
  console.timeEnd('EXECUTION TIME enumSerialPorts')
  //console.log(ports)
  console.time('EXECUTION TIME openSerialPort')
  driver.openSerialPort('COM9')
})

driver.on('portsInfo', (ports) => {

  console.log(ports)

})

driver.on('connected', (data :boolean) => {
  console.timeEnd('EXECUTION TIME openSerialPort')
  console.log('CONNECTED: ' + data)
  console.time('EXECUTION TIME Commands.ENCODER')


  driver.sendCmd(Commands.STATUS, testCallback2)

  setTimeout(() => {
    driver.sendCmd(Commands.SERVO_OFF);
    //driver.sendCmd(Commands.POWER_OFF);
    driver.sendCmd(Commands.STATUS, testCallback1)
    setTimeout(() => {
      driver.sendCmd(Commands.STATUS, testCallback)
      driver.sendCmd(Commands.SERVO_ON);
      driver.sendCmd(Commands.POWER_ON);

      driver.sendCmd(Commands.STATUS)

      //driver.disconnect()
    }, 1000)

    //driver.disconnect()
  }, 1000)
})

driver.on('disconnected', () => {
  console.log('DISCONNECTED')
})

driver.on('error', (err) => {
  console.log(`ERROR: ${err}`)
})

driver.on('data', (data) => {
  if (data.cmd === 'FW_VER') {
    console.timeEnd('EXECUTION TIME Commands.FW_VER')
  }

  if (data.cmd === 'ENCODER') {
    //console.timeEnd('EXECUTION TIME Commands.ENCODER')
  }

  // if (data.cmd === 'FOLLOWING_ERROR') {
  //   console.timeEnd('EXECUTION TIME Commands.FOLLOWING_ERROR')
  // }

  if (data.cmd === 'STR') {
    console.timeEnd('EXECUTION TIME \'ver\'')
  }

  if (data.cmd === Commands.POWER_ON) {

    //driver.sendCmd(Commands.RelativeMove, new RelativeMove(100));


    //console.timeEnd('EXECUTION TIME \'ver\'')
  }
  if (data.cmd === Commands.STATUS) {

    setTimeout(() => {
      // if (i%1 === 0 ){
      //   driver.sendCmd(Commands.SERVO_OFF);
      // }
      // else {
      //   driver.sendCmd(Commands.SERVO_ON);
      // }

    }, 500)

    driver.sendCmd(Commands.STATUS, testCallback)
    driver.sendCmd(Commands.ENCODER, testCallback1)
    driver.sendCmd(Commands.FOLLOWING_ERROR, testCallback2)

  }

  if (data.cmd === CommandsData.RelativeMove) {
     setTimeout(() => {
       driver.sendCmd(Commands.ENCODER)
     }, 500)

  }

    console.log(`DATA: ${JSON.stringify(data)}`)
})


