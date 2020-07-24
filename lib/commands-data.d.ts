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
export { CommandsData, RelativeMove };
