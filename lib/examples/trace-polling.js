"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
const commands_1 = require("../commands");
const mcdn_cmd_1 = require("../drivers/mcdn-cmd");
const i = 0;
let moving = true;
let position = 0;
let distance = 800000;
function statusCallBack(data) {
    let reply = data.answer;
    moving = reply.moving;
    //console.log(`testCallback: ${JSON.stringify(data)}`)
    console.log(`Moving ${moving}`);
}
function encoderCallBack(data) {
    //let reply = data.answer
    //moving = reply.moving
    //console.log(`encoderCallBack: ${JSON.stringify(data)}`)
    position = data.answer;
    console.log(`Position ${position}`);
    setTimeout(() => {
        startMotion();
    }, 10);
}
function encoderCallBackWithoutStart(data) {
    position = data.answer;
    console.log(`Position ${position}`);
}
function startMotion() {
    driver.setupTrace(new mcdn_cmd_1.Trace(mcdn_cmd_1.Trigger.MotionBegin, 1000));
    if (position > distance / 2) {
        driver.sendCmdDataNumber(index_1.CommandsData.AbsMove, 0);
        console.log('driver.sendCmdDataNumber(CommandsData.AbsMove, 0)');
    }
    else {
        driver.sendCmdDataNumber(index_1.CommandsData.AbsMove, distance);
        console.log('driver.sendCmdDataNumber(CommandsData.AbsMove, 100000)');
    }
    driver.sendCmd(commands_1.Commands.GO);
    setTimeout(() => {
        moving = true;
        waitMotionComplete();
    }, 25);
}
function processTraceData(data) {
    console.log(`TRACE DATA ${JSON.stringify(data.answer)}`);
    console.log(`COUNT DATA ${data.answer.split('\r\n').length}`);
    setTimeout(() => {
        driver.sendCmd(commands_1.Commands.ENCODER, encoderCallBack);
    }, 25);
}
function waitMotionComplete() {
    try {
        driver.sendCmd(commands_1.Commands.STATUS, statusCallBack);
        if (moving) {
            setTimeout(() => {
                waitMotionComplete();
            }, 25);
        }
        else if (moving == false) {
            driver.sendStr('trace 0');
            driver.getTraceData(processTraceData);
            // setTimeout(() => {
            //     //driver.sendCmd(Commands.STATUS, statusCallBack)
            //     //driver.sendCmd(Commands.ENCODER, encoderCallBackWithoutStart)
            //     //startMotion()
            // }, 150)
        }
    }
    catch (e) {
        console.log(e);
    }
}
const driver = new index_1.McdnDriver();
driver.enumSerialPorts();
driver.on('portsInfo', (ports) => {
    driver.openSerialPort('COM7');
});
driver.on('portsInfo', (ports) => {
    console.log(ports);
});
driver.on('connected', (data) => {
    console.log('CONNECTED: ' + data);
    driver.sendCmd(commands_1.Commands.STATUS, statusCallBack);
    driver.sendCmd(commands_1.Commands.SERVO_ON);
    driver.sendCmd(commands_1.Commands.ENCODER, encoderCallBack);
    //waitMotionComplete()
});
driver.on('disconnected', () => {
    console.log('DISCONNECTED');
});
driver.on('error', (err) => {
    console.log(`ERROR: ${err}`);
});
// driver.on('data', (data) => {
//
//
//     console.log(`DATA: ${JSON.stringify(data)}`)
// })
