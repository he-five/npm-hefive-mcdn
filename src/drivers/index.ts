import {McdnCmd, ServiceCommands} from "./mcdn-cmd"
import { Serial } from './serial'
import { MCDN } from './mcdn'

var driver = process.argv[0] === 'mcdn'? new MCDN():new Serial();

process.on('message', (msg : McdnCmd) => {
    let cmd : string
    switch (msg.cmd) {
        case ServiceCommands.DISCONNECT:
            driver.disconnect();
            //process.exit(0);
            break;
        case ServiceCommands.CONNECT:
            cmd = '';
            cmd = msg.data === undefined ? '' : msg.data.toString();
            driver.connect(cmd);
            break;
        default:
            driver.sendCmd(msg)
            break;

    }
})
