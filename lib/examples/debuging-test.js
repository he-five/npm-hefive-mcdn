"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
// eslint-disable-next-line no-unused-vars
let timeSentCmd = Date.now();
function testCallbackPos(data) {
    let reply = data;
    console.log(`robot position: ${JSON.stringify(data)}`);
}
function testCallback(data) {
    //let reply = data as CommandReply
    console.log(`testCallback: ${JSON.stringify(data)}`);
}
function testCallback1(data) {
    let reply = data;
    console.log(`testCallback1: ${JSON.stringify(data)}`);
}
function testCallback2(data) {
    let reply = data;
    console.log(`testCallback2: ${JSON.stringify(data)}`);
}
function callbackAfterSonSof(data) {
    console.log(`answer after son/sof is ${JSON.stringify(data)}`);
}
function testCallbackStatus(data) {
    let elapsedTime = Date.now();
    console.log(`testCallbackStatus: ${JSON.stringify(data)}`);
    console.log(`elapsed time: ${elapsedTime - timeSentCmd}`);
    //driver.sendCmdDataNumber(CommandsData.RelativeMove, new RobotAxisData('T', 1000) ,testCallbackAfetrMvr )
    //driver.disconnect()
}
function testCallbackAfetrMvr(data) {
    console.log(`testCallbackAfetrMvr: ${JSON.stringify(data)}`);
    //driver.disconnect()
}
const i = 0;
const driver = new index_1.McdnDriver();
const parameters = ['87.119.102.13:3000', '>', '?'];
driver.openTcpPort(...parameters);
//console.time('EXECUTION TIME enumSerialPorts')
//driver.enumSerialPorts()
driver.on('portsInfo', (ports) => {
    //console.timeEnd('EXECUTION TIME enumSerialPorts')
    //console.log(ports)
    //console.time('EXECUTION TIME openSerialPort')
    //driver.openSerialPort('COM7')
});
driver.on('portsInfo', (ports) => {
    console.log(ports);
});
driver.on('connected', (data) => {
    // console.timeEnd('EXECUTION TIME openSerialPort')
    console.log('CONNECTED: ' + data);
    //console.time('EXECUTION TIME Commands.ENCODER')
    setInterval(() => {
        //driver.sendCmd(Commands.FW_VER, testCallback2)
        driver.sendCmd(index_1.Commands.SERVO_ON);
        driver.sendCmd(index_1.Commands.AXES, testCallback2);
        driver.sendCmd(index_1.Commands.STATUS, testCallback2);
        driver.sendStr(`.rel r = 100 go r`, testCallback);
        driver.sendCmd(index_1.CommandsData.Position, testCallbackPos);
        //driver.sendCmdDataNumber(CommandsData.RelativeMove, new RobotAxisData('T', 10000), testCallbackAfetrMvr)
        //  driver.sendCmdDataNumber(CommandsData.RelativeMove, new RobotAxisData('T', 1000))
        // driver.sendCmdDataNumber(CommandsData.RelativeMove, new RobotAxisData('Z', 100))
        //timeSentCmd =  Date.now();
        // driver.sendCmdDataNumber(CommandsData.RelativeMove, new RobotAxisData('T', 100), testCallbackAfetrMvr)
    }, 2000);
});
driver.on('disconnected', () => {
    console.log('DISCONNECTED');
});
driver.on('error', (err) => {
    console.log(`ERROR: ${err}`);
});
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
        // console.timeEnd('EXECUTION TIME \'ver\'')
    }
    if (data.cmd === index_1.Commands.POWER_ON) {
        //driver.sendCmd(Commands.RelativeMove, new RelativeMove(100));
        //console.timeEnd('EXECUTION TIME \'ver\'')
    }
    if (data.cmd === index_1.Commands.INPUTS) {
        setTimeout(() => {
            //     driver.sendCmd(Commands.STATUS, testCallback)
            // driver.sendCmd(Commands.SERVO_ON);
            // driver.sendCmd(Commands.POWER_ON);
            //   driver.sendCmd(Commands.STATUS)
            driver.sendCmd(index_1.Commands.INPUTS);
            //driver.disconnect()
        }, 1000);
    }
    // if (data.cmd === CommandsData.RelativeMove) {
    //    setTimeout(() => {
    //      driver.sendCmd(Commands.ENCODER)
    //    }, 500)
    //
    // }
    // console.log(`DATA: ${JSON.stringify(data)}`)
});
