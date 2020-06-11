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

export { DriverReply }
