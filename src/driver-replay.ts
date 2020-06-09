import {Commands} from "./mcdn-cmd";

class DriverReply {
    public cmd      : Commands;
    public passed   : boolean;
    public data     : any;
    public netId    : number

    constructor () {
        this.cmd        = Commands.NONE;
        this.passed     = false;
        this.data       = null;
        this.netId      = 1
    }

}

export { DriverReply }
