import { McdnCmd } from "./mcdn-cmd";
declare class Serial {
    private serialPort;
    private connected;
    private parser;
    private cmd;
    private queue;
    private cmdInProgress;
    constructor();
    connect(portName: string): void;
    sendCmd(cmd: McdnCmd): void;
    private sendThruPort;
    private startLisening;
    private postProcessAnswer;
    private checkForPendingCmd;
    disconnect(): void;
}
export { Serial };
