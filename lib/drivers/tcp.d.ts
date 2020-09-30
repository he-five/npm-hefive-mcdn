import { McdnCmd } from "./mcdn-cmd";
declare class Tcp {
    private netSocket;
    private ip;
    private cmd;
    private callbackId;
    private queue;
    private cmdInProgress;
    private cmdSendTime;
    private timer;
    private connected;
    private reply;
    private cmdPass;
    private cmdFail;
    constructor();
    connect(ip: string): void;
    onClose(): void;
    onData(data: string): void;
    private postProcessAnswer;
    private checkForPendingCmd;
    onError(err: string): void;
    onConnect(): void;
    disconnect(): void;
    sendCmd(cmd: McdnCmd): void;
    private sendThruPort;
}
export { Tcp };
