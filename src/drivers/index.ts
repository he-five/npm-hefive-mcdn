import {McdnCmd, ServiceCommands} from "./mcdn-cmd"
import { Serial } from './serial'
import { MCDN } from './mcdn'

var driver = process.argv[0] === 'mcdn'? new MCDN():new Serial();

process.on('message', (msg : McdnCmd) => {
    switch (msg.cmd) {
        case ServiceCommands.DISCONNECT:
            driver.disconnect();
            //process.exit(0);
            break;
        case ServiceCommands.CONNECT:
            driver.connect(msg.data);
            break;
        case ServiceCommands.DISCONNECT:
            driver.disconnect();
            break;
        // case ServiceCommands.STRING:
        //     driver.sendStr(msg.data);
        //     break;
        default:
            driver.sendCmd(msg)
            break;

    }
})
