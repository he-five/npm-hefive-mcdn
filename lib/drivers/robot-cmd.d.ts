declare enum RobotStatusMask {
    IndexAcq = 1,
    FwrdLimit = 2,
    RvsLimit = 4,
    Index = 8,
    Wraparound = 16,
    AccPhase = 32,
    PathPoint = 64,
    ServoOn = 128,
    EncError = 256,
    MaxPos = 512,
    InMotion = 1024,
    Inhibit = 2048,
    Overrun = 4096,
    CurrentOverload = 8192,
    DigitalOverload = 16384,
    PowerFail = 32768
}
declare enum RobotAxes {
    T = 0,
    R = 1,
    R2 = 2,
    Z = 3,
    X = 4
}
declare class RobotStatus {
    fwrdLimit: boolean;
    index: boolean;
    wraparound: boolean;
    accPhase: boolean;
    servoOn: boolean;
    inhibit: boolean;
    overrun: boolean;
    currentOverload: boolean;
    digitalOverload: boolean;
    inMotion: boolean;
    maxPos: boolean;
    powerFail: boolean;
    indexAcq: boolean;
    encError: boolean;
    rvsLimit: boolean;
    pathPoint: boolean;
    constructor();
}
declare class RobotData {
    axis: string;
    distance: number | undefined;
    constructor(axis: string, distance: number);
}
export { RobotStatusMask, RobotStatus, RobotData, RobotAxes };
