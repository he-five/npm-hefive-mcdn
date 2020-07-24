"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RelativeMove = exports.CommandsData = void 0;
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
class KP extends Param {
}
class KI extends Param {
}
class KD extends Param {
}
class IntegrationLimit extends Param {
}
class VelocityFeedForward extends Param {
}
