"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mcdn_cmd_1 = require("./mcdn-cmd");
const serial_1 = require("./serial");
const mcdn_1 = require("./mcdn");
const communication_types_1 = require("../helpers/communication-types");
const tcp_1 = require("./tcp");
let driver = undefined;
switch (process.argv[2]) {
    case communication_types_1.CommunicationTypes.MCDN:
        driver = new mcdn_1.MCDN();
        break;
    case communication_types_1.CommunicationTypes.SERIAL:
        driver = new serial_1.Serial();
        break;
    case communication_types_1.CommunicationTypes.TCP:
        driver = new tcp_1.Tcp();
        break;
}
process.on('message', (msg) => {
    let cmd;
    switch (msg.cmd) {
        case mcdn_cmd_1.ServiceCommands.DISCONNECT:
            driver === null || driver === void 0 ? void 0 : driver.disconnect();
            //process.exit(0);
            break;
        case mcdn_cmd_1.ServiceCommands.CONNECT:
            cmd = '';
            cmd = msg.data === undefined ? '' : msg.data.toString();
            driver === null || driver === void 0 ? void 0 : driver.connect(cmd);
            break;
        default:
            driver === null || driver === void 0 ? void 0 : driver.sendCmd(msg);
            break;
    }
});
