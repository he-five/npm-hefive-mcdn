
enum Commands {
    DISCONNECT = 'DISCONNECT',
    CONNECT = `CONNECT`,

}

class McdnCmd {
    public cmd: Commands;
    public data: any;

    constructor(cmd: Commands, data?: any) {
        this.cmd = cmd
        this.data = data
    }
}

export {McdnCmd, Commands};
