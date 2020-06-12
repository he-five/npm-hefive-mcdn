export = HeFiveParser;
declare const HeFiveParser_base: any;
declare class HeFiveParser extends HeFiveParser_base {
    [x: string]: any;
    constructor(options?: {});
    terminators: any[];
    buffer: any;
    _transform(chunk: any, encoding: any, cb: any): void;
    _flush(cb: any): void;
}
