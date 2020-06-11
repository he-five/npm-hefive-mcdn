import {Commands} from "./mcdn-cmd";

class DriverReply {
    public cmd      : Commands;
    public passed   : boolean;
    public answer   : any;
    public deviceId    : number

    constructor () {
        this.cmd        = Commands.NONE;
        this.passed     = false;
        this.answer       = null;
        this.deviceId      = 1
    }

}

enum IpcReplyType {
    INVALID,
    DRV = 'DRV',
    ERROR = 'ERR',
}

class IpcReply {
    public type         : IpcReplyType;
    public drvReply     : DriverReply | null;
    public err          : any

    constructor () {
        this.type         = IpcReplyType.INVALID;
        this.drvReply     = null;
        this.err          = null
    }

}


export { DriverReply, IpcReply }
