"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
const driver = new index_1.McdnDriver();
console.time('EXECUTION TIME enumSerialPorts');
driver.enumSerialPorts();
driver.on('ports', (ports) => {
    console.timeEnd('EXECUTION TIME enumSerialPorts');
    console.log(ports);
    console.time('EXECUTION TIME openSerialPort');
    driver.openSerialPort('COM3');
});
driver.on('connected', () => {
    console.timeEnd('EXECUTION TIME openSerialPort');
    console.log(`CONNECTED`);
    console.time('EXECUTION TIME Commands.FW_VER');
    driver.sendCmd(index_1.Commands.FW_VER);
    console.time('EXECUTION TIME Commands.ENCODER');
    driver.sendCmd(index_1.Commands.ENCODER);
    console.time('EXECUTION TIME Commands.FOLLOWING_ERROR');
    driver.sendCmd(index_1.Commands.FOLLOWING_ERROR);
    setTimeout(() => {
        console.time('EXECUTION TIME \'ver\'');
        driver.sendStr('ver');
    }, 500);
    setTimeout(() => {
        driver.disconnect();
    }, 1000);
});
driver.on('disconnected', () => {
    console.log(`DISCONNECTED`);
});
driver.on('error', (err) => {
    console.log(`ERROR: ${err}`);
});
driver.on('data', (data) => {
    if (data.cmd == 'FW_VER') {
        console.timeEnd('EXECUTION TIME Commands.FW_VER');
    }
    if (data.cmd == 'ENCODER') {
        console.timeEnd('EXECUTION TIME Commands.ENCODER');
    }
    if (data.cmd == 'FOLLOWING_ERROR') {
        console.timeEnd('EXECUTION TIME Commands.FOLLOWING_ERROR');
    }
    if (data.cmd == 'STR') {
        console.timeEnd('EXECUTION TIME \'ver\'');
    }
    console.log(`DATA: ${JSON.stringify(data)}`);
});
// driver.openMcdnPort('COM5');
// driver.closePort();
