import { Commands } from "./mcdn-cmd";
declare class DriverReply {
    cmd: Commands;
    passed: boolean;
    answer: any;
    deviceId: number;
    constructor();
}
declare enum IpcReplyType {
    INVALID = 0,
    DRV = "DRV",
    ERROR = "ERR"
}
declare class IpcReply {
    type: IpcReplyType;
    drvReply: DriverReply | undefined;
    err: string;
    constructor(type: IpcReplyType, data: any);
}
export { DriverReply, IpcReply, IpcReplyType };
