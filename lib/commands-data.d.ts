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
    DerivativeSampleInterval = "DS"
}
declare class RelativeMove {
    distance: number;
    constructor(distance: number);
}
declare class Param {
    value: number;
    constructor(value: number);
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
export { CommandsData, RelativeMove, KP, KI, KD, IntegrationLimit, VelocityFeedForward, AccelerationFeedForward, BIAS, MotorOutputLimit, DerivativeSampleInterval, Param };
