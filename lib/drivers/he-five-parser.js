"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mcdn_cmd_1 = require("../mcdn-cmd");
const { Transform } = require('stream');
class HeFiveParser extends Transform {
    constructor(options = {}) {
        super(options);
        this.passDelimiter = Buffer.from(mcdn_cmd_1.CmdPass, 'ascii');
        this.failDelimiter = Buffer.from(mcdn_cmd_1.CmdFail, 'ascii');
        this.buffer = Buffer.alloc(0);
    }
    _transform(chunk, encoding, cb) {
        let data = Buffer.concat([this.buffer, chunk]);
        let position;
        while (((position = data.indexOf(this.passDelimiter)) !== -1) ||
            ((position = data.indexOf(this.failDelimiter)) !== -1)) {
            this.push(data.toString('ascii'));
            data = data.slice(position + 1);
        }
        this.buffer = data;
        cb();
    }
    _flush(cb) {
        this.push(this.buffer);
        this.buffer = Buffer.alloc(0);
        cb();
    }
}
module.exports = HeFiveParser;
