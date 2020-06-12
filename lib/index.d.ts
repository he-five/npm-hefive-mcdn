import { Commands } from "./mcdn-cmd";
import { EventEmitter } from 'events';
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
    consumeEvents(): void;
}
export { McdnDriver };