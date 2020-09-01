import { McdnCmd } from "../drivers/mcdn-cmd";
declare class Queue {
    private cmds;
    constructor(queue?: McdnCmd[]);
    enqueue(item: any): void;
    dequeue(): any;
    clear(): void;
    get count(): number;
}
export { Queue };
