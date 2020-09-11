"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Queue = void 0;
class Queue {
    constructor(queue) {
        this.cmds = queue || [];
    }
    enqueue(item) {
        this.cmds.push(item);
    }
    dequeue() {
        return this.cmds.shift();
    }
    clear() {
        this.cmds = [];
    }
    get count() {
        return this.cmds.length;
    }
}
exports.Queue = Queue;
