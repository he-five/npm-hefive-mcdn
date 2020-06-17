/// <reference types="node" />
import { EventEmitter } from "events";
import { ServiceCommands } from "./drivers/mcdn-cmd";
declare enum Commands {
    FW_VER = "FW_VER",
    ENCODER = "ENCODER",
    FOLLOWING_ERROR = "FOLLOWING_ERROR"
}
declare class McdnDriver extends EventEmitter {
    connected: boolean;
    private driverProcess;
    private callbacksMap;
    constructor();
    enumSerialPorts(): void;
    openMcdnPort(portName: string): void;
    openSerialPort(portName: string): void;
    private createProcess;
    disconnect(): void;
    getFwVersion(): void;
    sendCmd(cmd: Commands | ServiceCommands, callback?: (data: any) => void): void;
    sendStr(str: string): void;
    consumeEvents(): void;
}
export { Commands, McdnDriver };
