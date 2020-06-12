declare class Serial {
    private serialPort;
    private connected;
    private parser;
    private cmd;
    constructor();
    connect(portName: string): void;
    readFwVersion(): void;
    private startLisening;
    private postProcessAnswer;
    disconnect(): void;
}
export { Serial };
