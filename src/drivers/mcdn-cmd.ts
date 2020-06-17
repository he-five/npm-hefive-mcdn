import {Commands} from "../index";

const cmdPass = '>'
const cmdFail = '?'

enum ServiceCommands {

    DISCONNECT          = 'DISCONNECT',
    CONNECT             = `CONNECT`,
    CLEAR_BUFF          = 'CLEAR_BUFF',
    STRING              = 'STR'
}


class McdnCmd {
    public cmd      : Commands | ServiceCommands;
    public data     : any;
    public uniqueId : string | undefined;

    constructor(cmd: Commands | ServiceCommands, data: string | undefined, uniqueId?: string) {
        this.cmd = cmd
        this.data = data
        this.uniqueId = uniqueId;
    }
}

export {McdnCmd, ServiceCommands, cmdPass, cmdFail};