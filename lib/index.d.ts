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
    RelativeMove = "RelativeMove",
    STATUS = "STATUS"
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
    constructor();
    enumSerialPorts(): void;
    openMcdnPort(portName: string): void;
    openSerialPort(portName: string): void;
    private createProcess;
    disconnect(): void;
    getFwVersion(): void;
    sendCmd(cmd: Commands | ServiceCommands, data?: any, callback?: (data: any) => void): void;
    sendStr(str: string): void;
    consumeEvents(): void;
}
export { Commands, McdnDriver, CommandReply, RelativeMove, Status };
