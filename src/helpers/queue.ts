import {McdnCmd} from "../drivers/mcdn-cmd";

class Queue{
    private cmds : McdnCmd[]

    constructor(queue?: McdnCmd[]) {
        this.cmds = queue || [];
    }

    enqueue(item: any) {
        this.cmds.push(item);
    }

    dequeue(): any {
        return this.cmds.shift();
    }

    clear() {
        this.cmds = [];
    }

    get count(): number {
        return this.cmds.length;
    }
}
export {Queue}