enum RobotStatusMask {
    IndexAcq                    = 0x00000001,
    FwrdLimit                   = 0x00000002,
    RvsLimit                    = 0x00000004,
    Index                       = 0x00000008,

    Wraparound                  = 0x00000010,
    AccPhase                    = 0x00000020,
    PathPoint                   = 0x00000040,
    ServoOn                     = 0x00000080,


    EncError                    = 0x00000100,
    MaxPos                      = 0x00000200,
    MotionCompleted             = 0x00000400,
    Inhibit                     = 0x00000800,

    Overrun                     = 0x00001000,
    CurrentOverload             = 0x00002000,
    DigitalOverload             = 0x00004000,
    PowerFail                   = 0x00008000
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
    public encError                     : boolean;
    public rvsLimit                     : boolean;
    public pathPoint                    : boolean;

    constructor() {
        this.fwrdLimit                  = false;
        this.wraparound                 = false;
        this.accPhase                   = false;
        this.encError                   = false;
        this.servoOn                    = false;
        this.index                      = false;
        this.inhibit                    = false;
        this.overrun                    = false;
        this.currentOverload            = false;
        this.digitalOverload            = false;
        this.powerFail                  = false;
        this.indexAcq                   = false;
        this.encError                   = false;
        this.maxPos                     = false;
        this.inMotion            = false;
        this.rvsLimit                   = false;
        this.pathPoint                  = false;
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