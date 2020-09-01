import {CommandReply, CommandsData,McdnDriver} from '../index'
import {Commands} from "../commands";
import {Trace, Trigger} from "../drivers/mcdn-cmd";



const i = 0
let moving = true
let position  = 0
//let distance = 800000
let distance = 100000

function statusCallBack (data:any) {
    let reply = data.answer
    moving = reply.moving
    //console.log(`testCallback: ${JSON.stringify(data)}`)
    console.log(`Moving ${moving}`)
}
function encoderCallBack (data:any) {
    //let reply = data.answer
    //moving = reply.moving
    //console.log(`encoderCallBack: ${JSON.stringify(data)}`)

    position = data.answer;
    console.log(`Position ${position}`)

    setTimeout(() => {
        startMotion()
    }, 10)


}

function encoderCallBackWithoutStart (data:any) {
    position = data.answer;
    console.log(`Position ${position}`)
}

function startMotion() {
    driver.setupTrace(new Trace(Trigger.MotionBegin, 1000))
    if (position > distance/2){
        driver.sendCmdDataNumber(CommandsData.AbsMove, 0)
        console.log('driver.sendCmdDataNumber(CommandsData.AbsMove, 0)')
    }
    else{
        driver.sendCmdDataNumber(CommandsData.AbsMove, distance)
        console.log('driver.sendCmdDataNumber(CommandsData.AbsMove, 100000)')
    }
    driver.sendCmd(Commands.GO)

    setTimeout(() => {
        moving = true
        waitMotionComplete()
    }, 25)
}
function processTraceData(data: CommandReply) {
    console.log(`TRACE DATA ${JSON.stringify(data.answer)}`)
    console.log(`COUNT DATA ${data.answer.split('\r\n').length}`)

    setTimeout(() => {
        driver.sendCmd(Commands.ENCODER, encoderCallBack)
    }, 25)
}


function waitMotionComplete() {
    try {
        driver.sendCmd(Commands.STATUS, statusCallBack)
        if (moving){
            setTimeout(() => {
                waitMotionComplete()
            }, 25)
        }
        else if (moving == false){
            driver.sendCmd(Commands.ENCODER, encoderCallBackWithoutStart)
            driver.sendStr('trace 0')
            driver.getTraceData(processTraceData)

             // setTimeout(() => {
             //     //driver.sendCmd(Commands.STATUS, statusCallBack)
             //     //
             //     //startMotion()
             // }, 150)

        }
    }
    catch (e) {
        console.log(e)
    }
}

const driver = new McdnDriver()
driver.enumSerialPorts()
driver.on('portsInfo', (ports) => {
    driver.openSerialPort('COM7')
})

driver.on('portsInfo', (ports) => {
    console.log(ports)
})

driver.on('connected', (data :boolean) => {
    console.log('CONNECTED: ' + data)

    driver.sendCmd(Commands.STATUS, statusCallBack)
    driver.sendCmd(Commands.SERVO_ON);
    driver.sendCmd(Commands.ENCODER, encoderCallBack)


    //waitMotionComplete()




})

driver.on('disconnected', () => {
    console.log('DISCONNECTED')
})

driver.on('error', (err) => {
    console.log(`ERROR: ${err}`)
})

// driver.on('data', (data) => {
//
//
//     console.log(`DATA: ${JSON.stringify(data)}`)
// })


