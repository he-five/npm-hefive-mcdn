import { ServiceCommands } from "./mcdn-cmd";
import { Commands } from "../commands";
declare class Serial {
    private serialPort;
    private connected;
    private parser;
    private cmd;
    private queue;
    private cmdInProgress;
    constructor();
    connect(portName: string): void;
    sendStr(cmd: string): void;
    sendCmd(cmd: Commands | ServiceCommands | string): void;
    private sendThruPort;
    private startLisening;
    private postProcessAnswer;
    private checkForPendingCmd;
    disconnect(): void;
}
export { Serial };
