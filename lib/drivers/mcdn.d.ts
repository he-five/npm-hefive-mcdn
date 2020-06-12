import { Commands } from "../mcdn-cmd";
declare class MCDN {
    constructor();
    connect(): void;
    disconnect(): void;
    sendCmd(cmd: Commands): void;
}
export { MCDN };
