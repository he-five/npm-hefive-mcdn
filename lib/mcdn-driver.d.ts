/// <reference types="node" />
import { EventEmitter } from "events";
import { ServiceCommands } from "./drivers/mcdn-cmd";
import { Commands } from "./commands";
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
    sendCmd(cmd: Commands | ServiceCommands): void;
    sendStr(str: string): void;
    consumeEvents(): void;
}
export { McdnDriver };
