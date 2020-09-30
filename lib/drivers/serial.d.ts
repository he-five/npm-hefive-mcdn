import { McdnCmd } from "./mcdn-cmd";
declare class Serial {
    private serialPort;
    private parser;
    private cmd;
    private callbacId;
    private queue;
    private cmdInProgress;
    private cmdSendTime;
    private timer;
    private cmdPass;
    private cmdFail;
    constructor();
    connect(portName: string): void;
    sendCmd(cmd: McdnCmd): void;
    private sendThruPort;
    private startListening;
    private postProcessAnswer;
    private decodeInputs;
    private checkForPendingCmd;
    disconnect(): void;
}
export { Serial };
