declare enum CommandsData {
    RelativeMove = "RelativeMove",
    KP = "KP",
    KI = "KI",
    KD = "KD",
    IntegrationLimit = "IL",
    VelocityFeedForward = "VFF",
    AccelerationFeedForward = "AFF",
    BIAS = "BIAS",
    MotorOutputLimit = "MLIMIT",
    DerivativeSampleInterval = "DS",
    MaxError = "Max",
    AutoStopMode = "AStop",
    ECPR = "ECPR",
    Velocity = "Vel",
    Acceleration = "Acc",
    Decceleration = "Dec",
    AbsMove = "Abs",
    Position = "Pos",
    PWM = "Pwm"
}
declare class RelativeMove {
    distance: number;
    constructor(distance: number);
}
declare class Param {
    value: number;
    constructor(value: number);
}
declare class Position extends Param {
}
declare class PWM extends Param {
}
declare class AbsMove extends Param {
}
declare class KP extends Param {
}
declare class KI extends Param {
}
declare class KD extends Param {
}
declare class IntegrationLimit extends Param {
}
declare class VelocityFeedForward extends Param {
}
declare class AccelerationFeedForward extends Param {
}
declare class BIAS extends Param {
}
declare class MotorOutputLimit extends Param {
}
declare class DerivativeSampleInterval extends Param {
}
declare class MaxError extends Param {
}
declare class AutoStopMode extends Param {
}
declare class ECPR extends Param {
}
declare class Velocity extends Param {
}
declare class Acceleration extends Param {
}
declare class Decceleration extends Param {
}
export { CommandsData, RelativeMove, KP, KI, KD, IntegrationLimit, VelocityFeedForward, AccelerationFeedForward, BIAS, MotorOutputLimit, DerivativeSampleInterval, MaxError, AutoStopMode, ECPR, Velocity, Acceleration, Decceleration, AbsMove, Position, PWM, Param };
