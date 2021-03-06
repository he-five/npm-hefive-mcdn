import { ServiceCommands } from "./mcdn-cmd";
import { Commands } from "../commands";
declare class DriverReply {
    cmd: Commands | ServiceCommands | string;
    passed: boolean;
    answer: any;
    deviceId: number;
    callbackId: string | undefined;
    constructor();
}
declare enum IpcReplyType {
    INVALID = 0,
    DRV = "DRV",
    ERROR = "ERR",
    CONNECTED = "CONNECTED",
    DISCONNECTED = "DISCONNECTED"
}
declare class IpcReply {
    type: IpcReplyType;
    drvReply: DriverReply | boolean | undefined;
    err: string;
    constructor(type: IpcReplyType, data: any);
}
export { DriverReply, IpcReply, IpcReplyType };
