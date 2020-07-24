
import {ServiceCommands} from "./mcdn-cmd";
import {Commands} from "../commands";


class DriverReply {
    public cmd          : Commands | ServiceCommands | string
    public passed       : boolean
    public answer       : any
    public deviceId     : number
    public callbackId   : string | undefined

    constructor () {
        this.cmd        = ServiceCommands.CLEAR_BUFF
        this.passed     = false
        this.answer     = null
        this.deviceId   = 1
        this.callbackId = undefined
    }

}

enum IpcReplyType {
    INVALID,
    DRV = 'DRV',
    ERROR = 'ERR',
    CONNECTED = 'CONNECTED',
    DISCONNECTED = 'DISCONNECTED'
}

class IpcReply {
    public type         : IpcReplyType;
    public drvReply     : DriverReply | boolean | undefined;
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
                this.drvReply   = data

        }
    }

}


export { DriverReply, IpcReply, IpcReplyType }
