"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
const mcdn_cmd_1 = require("./mcdn-cmd");
const driver = new index_1.McdnDriver();
driver.enumSerialPorts();
driver.on('ports', (ports) => {
    console.log(ports);
    driver.openSerialPort('COM8');
    setTimeout(() => { driver.sendCmd(mcdn_cmd_1.Commands.FW_VER); }, 6000);
});
// driver.openMcdnPort('COM5');
// driver.closePort();
//driver.getFwVersion();
// driver.sendStr( cmd : string);
//
driver.on('error', (err) => {
    console.log(`CLIENT ERROR: ${err}`);
});
driver.on('data', (data) => {
    console.log(`CLIENT DATA: ${JSON.stringify(data)}`);
});
// Commands.ENCODER 'enc'
// Commands.FOLLOWING-ERROR 'err'
