declare enum RobotStatusMask {
    Homed = 1,
    InMotion = 2,
    Index = 8,
    LimitPos = 16,
    MaxError = 32,
    EncoderErr = 64,
    ServoOn = 128,
    Busy = 256,
    Inhibit = 2048,
    Overrun = 4096,
    CurrentOverload = 8192,
    EmergencyStop = 16384,
    PowerFail = 32768
}
declare class RobotStatus {
    inMotion: boolean;
    index: boolean;
    limitPos: boolean;
    maxError: boolean;
    encoderErr: boolean;
    servoOn: boolean;
    inhibit: boolean;
    overrun: boolean;
    currentOverload: boolean;
    emergencyStop: boolean;
    powerFail: boolean;
    homed: boolean;
    busy: boolean;
    constructor();
}
export { RobotStatusMask, RobotStatus };
