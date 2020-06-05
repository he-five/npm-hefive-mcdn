"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mcdn_cmd_1 = require("../mcdn-cmd");
const serial_1 = require("./serial");
const mcdn_1 = require("./mcdn");
var driver = process.argv[0] === 'mcdn' ? new mcdn_1.MCDN() : new serial_1.Serial();
process.on('message', (msg) => {
    switch (msg.cmd) {
        case mcdn_cmd_1.Commands.DISCONNECT:
            driver.disconnect();
            process.exit(0);
            break;
        case mcdn_cmd_1.Commands.CONNECT:
            driver.connect(msg.data);
            break;
        case mcdn_cmd_1.Commands.FW_VER:
            driver.readFwVersion();
            break;
        default:
            console.log('unknown command');
    }
});