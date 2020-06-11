
const cmdPass = '>'
const cmdFail = '?'

enum Commands {
    NONE = '',
    DISCONNECT          = 'DISCONNECT',
    CONNECT             = `CONNECT`,
    FW_VER              = `FW_VER`,
    ENCODER             = 'ENCODER',
    FOLLOWING_ERROR     = 'FOLLOWING_ERROR'


}


class McdnCmd {
    public cmd: Commands;
    public data: any;

    constructor(cmd: Commands, data?: any) {
        this.cmd = cmd
        this.data = data
    }
}

export {McdnCmd, Commands, cmdPass, cmdFail};
