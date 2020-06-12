/// <reference types="node" />
export = HeFiveParser;
declare const HeFiveParser_base: typeof import("stream").Transform;
declare class HeFiveParser extends HeFiveParser_base {
    constructor(options?: {});
    terminators: any[];
    buffer: Buffer;
}
