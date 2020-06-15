import { ServiceCommands } from "./mcdn-cmd";
import { Commands } from "../commands";
declare class MCDN {
    constructor();
    connect(): void;
    disconnect(): void;
    sendCmd(cmd: Commands | ServiceCommands): void;
    sendStr(cmd: string): void;
}
export { MCDN };
