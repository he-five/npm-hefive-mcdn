/// <reference types="node" />
import events from 'events';
declare class McdnDriver extends events.EventEmitter {
    connected: boolean;
    private driverProcess;
    constructor();
    connectMcdn(portName: string): void;
    connectSerial(portName: string): void;
    disconect(): void;
    /**
     * events.EventEmitter
     * 1. close
     * 2. disconnect
     * 3. error
     * 4. exit
     * 5. message
     */
    consumeEvents(): void;
}
export { McdnDriver };
