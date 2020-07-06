/// <reference types="node" />
import { EventEmitter } from "events";
import { ServiceCommands } from "./drivers/mcdn-cmd";
declare enum Commands {
    FW_VER = "FW_VER",
    ENCODER = "ENCODER",
    FOLLOWING_ERROR = "FOLLOWING_ERROR",
    POWER_ON = "POWER_ON",
    POWER_OFF = "POWER_OFF",
    SERVO_ON = "SERVO_ON",
    SERVO_OFF = "SERVO_OFF",
    STATUS = "STATUS"
}
declare enum CommandsData {
    RelativeMove = "RelativeMove"
}
declare class RelativeMove {
    distance: number;
    constructor(distance: number);
}
declare class Status {
    servoOn: boolean;
    powerOn: boolean;
    constructor(servoOn: boolean, powerOn: boolean);
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
export { Commands, CommandsData, McdnDriver, CommandReply, RelativeMove, Status, SerialPortInfo, SerialPortType };
