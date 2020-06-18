import { McdnCmd } from "./mcdn-cmd";
declare class Serial {
    private serialPort;
    private connected;
    private parser;
    private cmd;
    private callbacId;
    private queue;
    private cmdInProgress;
    private cmdSendTime;
    private timer;
    constructor();
    connect(portName: string): void;
    sendCmd(cmd: McdnCmd): void;
    private sendThruPort;
    private startListening;
    private postProcessAnswer;
    private checkForPendingCmd;
    disconnect(): void;
}
export { Serial };
