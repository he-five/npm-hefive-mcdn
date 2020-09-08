declare enum RobotStatusMask {
    IndexAcq = 1,
    FwrdLimit = 2,
    RvsLimit = 4,
    Index = 8,
    Wraparound = 16,
    AccPhase = 32,
    PathPoint = 64,
    ServoOn = 128,
    Busy = 256,
    MaxPos = 512,
    MotionCompleted = 1024,
    Inhibit = 2048,
    Overrun = 4096,
    CurrentOverload = 8192,
    DigitalOverload = 16384,
    PowerFail = 32768,
    UserMacroRunning = 134217728,
    SysMacroRunning = 4194304
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
    busy: boolean;
    rvsLimit: boolean;
    pathPoint: boolean;
    private userMacroRunning;
    private sysMacroRunning;
    constructor();
}
declare class RobotData {
    axis: string;
    distance: number | undefined;
    constructor(axis: string, distance: number);
}
declare class RobotAxisValue {
    T: number | undefined;
    R: number | undefined;
    Z: number | undefined;
    R2: number | undefined;
    X: number | undefined;
    constructor();
}
export { RobotStatusMask, RobotStatus, RobotData, RobotAxisValue };
