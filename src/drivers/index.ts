import {Commands, McdnCmd} from "../mcdn-cmd";
import { Serial } from './serial'
import { MCDN } from './mcdn'

var driver = process.argv[0] === 'mcdn'? new MCDN():new Serial();

process.on('message', (msg : McdnCmd) => {
    switch (msg.cmd) {
        case Commands.DISCONNECT:
            driver.disconnect();
            process.exit(0);
            break;
        case Commands.CONNECT:
            driver.connect(msg.data);
            break;
        default:
            driver.sendCmd(msg.cmd)
            break;

    }
})
