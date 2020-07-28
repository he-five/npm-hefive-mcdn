"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Param = exports.Position = exports.AbsMove = exports.Decceleration = exports.Acceleration = exports.Velocity = exports.ECPR = exports.AutoStopMode = exports.MaxError = exports.DerivativeSampleInterval = exports.MotorOutputLimit = exports.BIAS = exports.AccelerationFeedForward = exports.VelocityFeedForward = exports.IntegrationLimit = exports.KD = exports.KI = exports.KP = exports.RelativeMove = exports.CommandsData = void 0;
var CommandsData;
(function (CommandsData) {
    CommandsData["RelativeMove"] = "RelativeMove";
    CommandsData["KP"] = "KP";
    CommandsData["KI"] = "KI";
    CommandsData["KD"] = "KD";
    CommandsData["IntegrationLimit"] = "IL";
    CommandsData["VelocityFeedForward"] = "VFF";
    CommandsData["AccelerationFeedForward"] = "AFF";
    CommandsData["BIAS"] = "BIAS";
    CommandsData["MotorOutputLimit"] = "MLIMIT";
    CommandsData["DerivativeSampleInterval"] = "DS";
    CommandsData["MaxError"] = "Max";
    CommandsData["AutoStopMode"] = "AStop";
    CommandsData["ECPR"] = "ECPR";
    CommandsData["Velocity"] = "Vel";
    CommandsData["Acceleration"] = "Acc";
    CommandsData["Decceleration"] = "Dec";
    CommandsData["AbsMove"] = "Abs";
    CommandsData["Position"] = "Position";
})(CommandsData || (CommandsData = {}));
exports.CommandsData = CommandsData;
class RelativeMove {
    constructor(distance) {
        this.distance = distance;
    }
}
exports.RelativeMove = RelativeMove;
class Param {
    constructor(value) {
        this.value = value;
    }
}
exports.Param = Param;
class Position extends Param {
}
exports.Position = Position;
class AbsMove extends Param {
}
exports.AbsMove = AbsMove;
class KP extends Param {
}
exports.KP = KP;
class KI extends Param {
}
exports.KI = KI;
class KD extends Param {
}
exports.KD = KD;
class IntegrationLimit extends Param {
}
exports.IntegrationLimit = IntegrationLimit;
class VelocityFeedForward extends Param {
}
exports.VelocityFeedForward = VelocityFeedForward;
class AccelerationFeedForward extends Param {
}
exports.AccelerationFeedForward = AccelerationFeedForward;
class BIAS extends Param {
}
exports.BIAS = BIAS;
class MotorOutputLimit extends Param {
}
exports.MotorOutputLimit = MotorOutputLimit;
class DerivativeSampleInterval extends Param {
}
exports.DerivativeSampleInterval = DerivativeSampleInterval;
class MaxError extends Param {
}
exports.MaxError = MaxError;
class AutoStopMode extends Param {
}
exports.AutoStopMode = AutoStopMode;
class ECPR extends Param {
}
exports.ECPR = ECPR;
class Velocity extends Param {
}
exports.Velocity = Velocity;
class Acceleration extends Param {
}
exports.Acceleration = Acceleration;
class Decceleration extends Param {
}
exports.Decceleration = Decceleration;
