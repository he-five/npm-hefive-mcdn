enum CommandsData {
    RelativeMove                        = 'RelativeMove',
    KP                                  = 'KP',
    KI                                  = 'KI',
    KD                                  = 'KD',
    IntegrationLimit                    = 'IL',
    VelocityFeedForward                 = 'VFF',
    AccelerationFeedForward             = 'AFF',
    BIAS                                = 'BIAS',
    MotorOutputLimit                    = 'MLIMIT',
    DerivativeSampleInterval            = 'DS',
    MaxError                            = 'MaxError',
    AutoStopMode                        = 'AStop'
}

class RelativeMove {
    public distance : number
    constructor(distance : number) {
        this.distance = distance;
    }
}

class Param {
    public value : number
    constructor(value : number) {
        this.value = value;
    }
}

class KP extends Param{
}

class KI extends Param{
}

class KD extends Param {
}

class  IntegrationLimit extends Param {

}

class  VelocityFeedForward extends Param {

}

class  AccelerationFeedForward extends Param {

}

class  BIAS extends Param {

}

class  MotorOutputLimit extends Param {

}

class  DerivativeSampleInterval extends Param {

}

class MaxError extends Param {

}

class AutoStopMode extends Param  {

}


export {    CommandsData, RelativeMove, KP, KI, KD,
            IntegrationLimit, VelocityFeedForward, AccelerationFeedForward,
            BIAS, MotorOutputLimit, DerivativeSampleInterval, MaxError,  AutoStopMode, Param}
