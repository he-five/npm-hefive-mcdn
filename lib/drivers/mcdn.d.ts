import { McdnCmd } from "./mcdn-cmd";
declare class MCDN {
    constructor();
    connect(): void;
    disconnect(): void;
    sendCmd(cmd: McdnCmd): void;
}
export { MCDN };
