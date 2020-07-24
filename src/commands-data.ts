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
    DerivativeSampleInterval            = 'DS'
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


export {CommandsData, RelativeMove}