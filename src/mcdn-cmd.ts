
const CmdPass = '>'
const CmdFail = '?'

enum Commands {
    NONE = '',
    DISCONNECT = 'DISCONNECT',
    CONNECT = `CONNECT`,
    FW_VER = `FW_VER`,

}


class McdnCmd {
    public cmd: Commands;
    public data: any;

    constructor(cmd: Commands, data?: any) {
        this.cmd = cmd
        this.data = data
    }
}

export {McdnCmd, Commands, CmdFail, CmdPass};
