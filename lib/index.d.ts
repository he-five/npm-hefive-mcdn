/// <reference types="node" />
import { EventEmitter } from "events";
import { ServiceCommands } from "./drivers/mcdn-cmd";
import { Commands } from "./commands";
import { CommandsData } from "./commands-data";
declare class Status {
    servoOn: boolean;
    powerOn: boolean;
    constructor(servoOn: boolean, powerOn: boolean);
}
declare class Inputs {
    axis1HallAActive: boolean;
    axis1HallBActive: boolean;
    axis1HallCActive: boolean;
    axis1OverTemp: boolean;
    axis1ForwardLimit: boolean;
    axis1ReverseLimit: boolean;
    axis1ExtraLimit: boolean;
    axis2HallAActive: boolean;
    axis2HallBActive: boolean;
    axis2HallCActive: boolean;
    axis2OverTemp: boolean;
    axis2ForwardLimit: boolean;
    axis2ReverseLimit: boolean;
    axis2ExtraLimit: boolean;
    constructor();
}
declare enum SerialPortType {
    USB = "USB",
    UNKNOWN = "UNKNOWN"
}
declare class SerialPortInfo {
    comName: string;
    manufacturer: string;
    type: SerialPortType;
    constructor(comName: string, manufacturer: string, type?: SerialPortType);
}
declare class CommandReply {
    cmd: Commands | string;
    passed: boolean;
    answer: any;
    deviceId: number;
    constructor(cmd: Commands | string, passed: boolean, answer: any, deviceId: number);
}
declare class McdnDriver extends EventEmitter {
    connected: boolean;
    private driverProcess;
    private callbacksMap;
    private sequentialNum;
    constructor();
    enumSerialPorts(): void;
    openMcdnPort(portName: string): void;
    openSerialPort(portName: string): void;
    private createProcess;
    disconnect(): void;
    getFwVersion(): void;
    sendCmdData(cmd: CommandsData, data: any, callback?: (data: any) => void): void;
    sendCmd(cmd: Commands | ServiceCommands, callback?: (data: any) => void): void;
    private sendToDriver;
    sendStr(str: string): void;
    consumeEvents(): void;
}
export { Commands } from "./commands";
export { CommandsData, RelativeMove } from "./commands-data";
export { McdnDriver, CommandReply, Status, SerialPortInfo, SerialPortType, Inputs };
