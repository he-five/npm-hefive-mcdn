import {Commands} from "../commands";

const cmdPass = '>'
const cmdFail = '?'

enum ServiceCommands {

    DISCONNECT          = 'DISCONNECT',
    CONNECT             = `CONNECT`,
    CLEAR_BUFF          = 'CLEAR_BUFF',
    STRING              = 'STR'
}


class McdnCmd {
    public cmd: Commands | ServiceCommands;
    public data: any;

    constructor(cmd: Commands | ServiceCommands, data?: string) {
        this.cmd = cmd
        this.data = data
    }
}

export {McdnCmd, ServiceCommands, cmdPass, cmdFail};