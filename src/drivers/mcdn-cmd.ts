import {CommandsData} from "../index";
import {Commands} from "../commands";

const cmdPass = '>'
const cmdFail = '?'

enum StatusMask {
    AtTarget    = 0x0001,
    ServoOn     = 0x0002,
    PowerOn     = 0x0004,
    PosCaptured = 0x0008,

    IdxCaptured = 0x0010,
    Homed       = 0x0020,
    Aligning    = 0x0040,
    Aligned     = 0x0080,

    Busy        = 0x0100,
    OverCurrent = 0x0200,
    Inhibit     = 0x0400,
    PvtEmpty    = 0x0800,

    AmpWarning  = 0x1000,
    AmpFault    = 0x0200,
    PosError    = 0x4000,
    Wraparound  = 0x8000
}


enum ServiceCommands {

    DISCONNECT          = 'DISCONNECT',
    CONNECT             = `CONNECT`,
    CLEAR_BUFF          = 'CLEAR_BUFF',
    STRING              = 'STR'
}


class McdnCmd {
    public cmd      : Commands | ServiceCommands | CommandsData;
    public data     : any;
    public uniqueId : string | undefined;

    constructor(cmd: Commands | ServiceCommands | CommandsData, data: string | any, uniqueId?: string) {
        this.cmd = cmd
        this.data = data
        this.uniqueId = uniqueId;
    }
}

export {McdnCmd, ServiceCommands, cmdPass, cmdFail, StatusMask};