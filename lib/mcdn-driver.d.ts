/// <reference types="node" />
import { EventEmitter } from "events";
import { Commands } from "./mcdn-cmd";
declare class McdnDriver extends EventEmitter {
    connected: boolean;
    private driverProcess;
    constructor();
    enumSerialPorts(): void;
    openMcdnPort(portName: string): void;
    openSerialPort(portName: string): void;
    private createProcess;
    disconnect(): void;
    getFwVersion(): void;
    sendCmd(cmd: Commands): void;
    sendStr(str: string): void;
    consumeEvents(): void;
}
export { McdnDriver };
