import {McdnCmd, ServiceCommands} from "./mcdn-cmd"
import { Serial } from './serial'
import { MCDN } from './mcdn'
import {CommunicationTypes} from "../helpers/communication-types";
import {Tcp} from "./tcp";

let driver: MCDN | Serial | Tcp | undefined = undefined

switch (process.argv[2]) {
    case CommunicationTypes.MCDN:
        driver = new MCDN();
        break;
    case CommunicationTypes.SERIAL:
        driver = new Serial();
        break;
    case CommunicationTypes.TCP:
        driver = new Tcp();
        break;
}

process.on('message', (msg : McdnCmd) => {
    let cmd : string
    switch (msg.cmd) {
        case ServiceCommands.DISCONNECT:
            driver?.disconnect();
            //process.exit(0);
            break;
        case ServiceCommands.CONNECT:
            cmd = '';
            cmd = msg.data === undefined ? '' : msg.data.toString();
            driver?.connect(cmd);
            break;
        default:
            driver?.sendCmd(msg)
            break;

    }
})
