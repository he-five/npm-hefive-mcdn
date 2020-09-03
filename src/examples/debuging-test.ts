import {CommandReply, Commands, CommandsData, McdnDriver} from '../index'
import {RobotData} from "../drivers/robot-cmd";

// eslint-disable-next-line no-unused-vars
function testCallback (data : any) {
  let reply = data as CommandReply
  console.log(`testCallback: ${JSON.stringify(data)}`)
}

function testCallback1 (data:any) {
  let reply = data as CommandReply
  console.log(`testCallback: ${JSON.stringify(data)}`)
}

function testCallback2 (data:any) {
  let reply = data as CommandReply
  //console.log(`testCallback: ${JSON.stringify(data)}`)

}

function callbackAfterSonSof(data:any){
  console.log(`answer after son/sof is ${JSON.stringify(data)}`)


}

function testCallbackStatus (data: any){
  console.log(`testCallbackStatus: ${JSON.stringify(data)}`)
  //driver.sendCmdDataNumber(CommandsData.RelativeMove, new RobotData('T', 1000) ,testCallbackAfetrMvr )
  //driver.disconnect()
}

function testCallbackAfetrMvr(data:any){
  console.log(`testCallbackAfetrMvr: ${JSON.stringify(data)}`)
  //driver.disconnect()

}
const i = 0

const driver = new McdnDriver()
driver.openTcpPort('87.119.102.13:3000')

//console.time('EXECUTION TIME enumSerialPorts')
//driver.enumSerialPorts()
driver.on('portsInfo', (ports) => {
  //console.timeEnd('EXECUTION TIME enumSerialPorts')
  //console.log(ports)
  //console.time('EXECUTION TIME openSerialPort')
  //driver.openSerialPort('COM7')
})

driver.on('portsInfo', (ports) => {

  console.log(ports)

})

driver.on('connected', (data :boolean) => {
  // console.timeEnd('EXECUTION TIME openSerialPort')
  console.log('CONNECTED: ' + data)
  //console.time('EXECUTION TIME Commands.ENCODER')

  setInterval(() => {
  driver.sendCmd(Commands.FW_VER, testCallback2)
  driver.sendCmd(Commands.SERVO_ON)
  driver.sendCmd(Commands.STATUS, testCallbackStatus)
    driver.sendCmdDataNumber(CommandsData.RelativeMove, new RobotData('T', 1000) ,testCallbackAfetrMvr )
  }, 200)
})

driver.on('disconnected', () => {
  console.log('DISCONNECTED')
})

driver.on('error', (err) => {
  console.log(`ERROR: ${err}`)
})

driver.on('data', (data) => {
  if (data.cmd === 'FW_VER') {
    //console.timeEnd('EXECUTION TIME Commands.FW_VER')
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
  if (data.cmd === Commands.INPUTS) {

    setTimeout(() => {
      //     driver.sendCmd(Commands.STATUS, testCallback)
      // driver.sendCmd(Commands.SERVO_ON);
      // driver.sendCmd(Commands.POWER_ON);

      //   driver.sendCmd(Commands.STATUS)
      driver.sendCmd(Commands.INPUTS)

      //driver.disconnect()
    }, 1000)
  }

  // if (data.cmd === CommandsData.RelativeMove) {
  //    setTimeout(() => {
  //      driver.sendCmd(Commands.ENCODER)
  //    }, 500)
  //
  // }

   // console.log(`DATA: ${JSON.stringify(data)}`)

})


