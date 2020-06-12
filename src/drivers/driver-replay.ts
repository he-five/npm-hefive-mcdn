import {Commands} from "../mcdn-cmd";

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
    public drvReply     : DriverReply | undefined;
    public err          : string

    constructor (type :IpcReplyType, data: any ) {
        this.type         = type;
        this.drvReply     = undefined;
        this.err          = '';

        switch (type){
            case IpcReplyType.DRV:
                this.drvReply   = data
                break;
            case IpcReplyType.ERROR:
                this.err        = data
                break;
            default:
                // ERROR

        }
    }

}


export { DriverReply, IpcReply, IpcReplyType }
