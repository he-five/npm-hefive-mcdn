/// <reference types="node" />
import { EventEmitter } from "events";
import { ServiceCommands, Trace } from "./drivers/mcdn-cmd";
import { Commands } from "./commands";
import { CommandsData } from "./commands-data";
declare class Status {
    servoOn: boolean;
    powerOn: boolean;
    moving: boolean;
    positionCaptured: boolean;
    indexCaptured: boolean;
    homingCompleted: boolean;
    phaseAligning: boolean;
    phaseAlignmentCompleted: boolean;
    busy: boolean;
    overCurrent: boolean;
    pvtQueueFull: boolean;
    pvtQueueEmpty: boolean;
    overCurrentWarning: boolean;
    amplifierCurrentLimit: boolean;
    followingErrorLimit: boolean;
    counterWrapAround: boolean;
    constructor();
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
    sendCmdDataString(cmd: CommandsData, data: string, callback?: (data: any) => void): void;
    sendCmdDataNumber(cmd: CommandsData, data: number, callback?: (data: any) => void): void;
    setupTrace(traceData: Trace, callback?: (data: any) => void): void;
    sendCmd(cmd: Commands | ServiceCommands | CommandsData, callback?: (data: any) => void): void;
    private sendToDriver;
    sendStr(str: string, callback?: (data: any) => void): void;
    consumeEvents(): void;
}
export { Commands } from "./commands";
export { CommandsData } from "./commands-data";
export { McdnDriver, CommandReply, Status, SerialPortInfo, SerialPortType, Inputs, ServiceCommands };
