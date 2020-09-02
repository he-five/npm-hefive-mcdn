enum RobotStatusMask {
    Homed           = 0x0001,
    InMotion         = 0x0002,
    Index           = 0x0008,
    LimitPos        = 0x0010,
    MaxError        = 0x0020,
    EncoderErr      = 0x0040,
    ServoOn        = 0x0080,
    Busy            = 0x0100,
    Inhibit         = 0x0800,
    Overrun         = 0x1000,
    CurrentOverload = 0x2000,
    EmergencyStop   = 0x4000,
    PowerFail       = 0x8000
}

class RobotStatus {
    public inMotion          : boolean;
    public index            : boolean;
    public limitPos         : boolean;
    public maxError         : boolean;
    public encoderErr       : boolean;
    public servoOn          : boolean;
    public inhibit          : boolean;
    public overrun          : boolean;
    public currentOverload  : boolean;
    public emergencyStop    : boolean;
    public powerFail        : boolean;
    public homed            : boolean;
    public busy             : boolean;

    constructor() {
        this.inMotion            = false;
        this.limitPos           = false;
        this.maxError           = false;
        this.encoderErr         = false;
        this.servoOn            = false;
        this.index              = false;
        this.inhibit            = false;
        this.overrun            = false;
        this.currentOverload    = false;
        this.emergencyStop      = false;
        this.powerFail          = false;
        this.homed              = false;
        this.busy               = false;
    }
}

export {RobotStatusMask, RobotStatus};