enum RobotStatusMask {
    IndexAcq                    = 0x0001,
    FwrdLimit                   = 0x0002,
    RvsLimit                    = 0x0004,
    Index                       = 0x0008,

    Wraparound                  = 0x0010,
    AccPhase                    = 0x0020,
    PathPoint                   = 0x0040,
    ServoOn                     = 0x0080,

    Busy                        = 0x0100,
    MaxPos                      = 0x0200,
    MotionCompleted             = 0x0400,
    Inhibit                     = 0x0800,

    Overrun                     = 0x1000,
    CurrentOverload             = 0x2000,
    DigitalOverload             = 0x4000,
    PowerFail                   = 0x8000,

    UserMacroRunning            = 0x08000000,
    SysMacroRunning             = 0x00400000,

}

class RobotStatus {
    public fwrdLimit                    : boolean;
    public index                        : boolean;
    public wraparound                   : boolean;
    public accPhase                     : boolean;
    public servoOn                      : boolean;
    public inhibit                      : boolean;
    public overrun                      : boolean;
    public currentOverload              : boolean;
    public digitalOverload              : boolean;
    public inMotion                     : boolean;
    public maxPos                       : boolean;
    public powerFail                    : boolean;
    public indexAcq                     : boolean;
    public busy                         : boolean;
    public rvsLimit                     : boolean;
    public pathPoint                    : boolean;
    private userMacroRunning             : boolean;
    private sysMacroRunning              : boolean;

    constructor() {
        this.fwrdLimit                  = false;
        this.wraparound                 = false;
        this.accPhase                   = false;
        this.busy                       = false;
        this.servoOn                    = false;
        this.index                      = false;
        this.inhibit                    = false;
        this.overrun                    = false;
        this.currentOverload            = false;
        this.digitalOverload            = false;
        this.powerFail                  = false;
        this.indexAcq                   = false;
        this.busy                       = false;
        this.maxPos                     = false;
        this.inMotion                   = false;
        this.rvsLimit                   = false;
        this.pathPoint                  = false;
        this.userMacroRunning           = false;
        this.sysMacroRunning            = false;
    }
}

class RobotData {
    public axis     : string;
    public distance : number | undefined;

    constructor(axis : string, distance: number) {
        this.axis = axis;
        this.distance = distance;
    }
}

export {RobotStatusMask, RobotStatus, RobotData};