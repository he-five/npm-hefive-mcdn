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
    STRING              = 'STR',
    TRACE               = 'TRACE',
    GET_TRACE_DATA      = 'GET_TRACE_DATA'
}

const Type = {
    Position            : 0,
    Velocity            : 1,
    Acceleration        : 2,
    I2tAccumulator      : 3,
    PosError            : 8,
    PidOutput           : 9,
    TotalCurrent        : 10
}

const Trigger = {
    MotionBegin         : 7,
    MotionEnd           : 3,
    Manual              : 0,
    //case 3: // Level change (Channel #3)
    //_crntAxis.TraceTrigger = cbSlope.SelectedIndex == 0 ? 9 : 10;
}

class Trace {
    public channel1Type         : number;
    public channel2Type         : number;
    public channel3Type         : number;
    public trigger              : number;
    public level                : number
    public rateInMicrosecond    : number

    constructor(trigger: number = Trigger.Manual, rateInMicrosecond: number = 5000) {
        this.channel1Type       = Type.Velocity
        this.channel2Type       = Type.PosError
        this.channel3Type       = Type.PosError
        this.trigger            = trigger
        this.level              = 0
        this.rateInMicrosecond  = rateInMicrosecond;

    }
}


class McdnCmd {
    public cmd      : Commands | ServiceCommands | CommandsData;
    public data     : string | number | Trace |undefined;
    public uniqueId : string | undefined;

    constructor(cmd: Commands | ServiceCommands | CommandsData, data?: string | number| Trace, uniqueId?: string) {
        this.cmd = cmd
        this.data = data
        this.uniqueId = uniqueId;
    }
}

export {McdnCmd, ServiceCommands, cmdPass, cmdFail, StatusMask, Trace, Trigger, Type};