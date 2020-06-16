"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
// import {cmdFail, cmdPass } from '../mcdn-cmd'
var Transform = require('stream').Transform;
var HeFiveParser = /** @class */ (function (_super) {
    __extends(HeFiveParser, _super);
    function HeFiveParser(options) {
        if (options === void 0) { options = {}; }
        var _this = _super.call(this, options) || this;
        _this.terminators = [];
        if (options.terminators) {
            if (Array.isArray(options.terminators)) {
                options.terminators.forEach(function (term) {
                    _this.terminators.push(Buffer.from(term, 'ascii'));
                });
            }
            else {
                throw new TypeError('"terminators" expect to be array ');
            }
        }
        else {
            throw new TypeError('"terminators" has to be paas as option');
        }
        _this.buffer = Buffer.alloc(0);
        return _this;
    }
    HeFiveParser.prototype._transform = function (chunk, encoding, cb) {
        var _this = this;
        var data = Buffer.concat([this.buffer, chunk]);
        this.terminators.forEach(function (term) {
            var position;
            while ((position = data.indexOf(term)) !== -1) {
                _this.push(data.slice(0, position + term.length));
                data = data.slice(position + term.length);
            }
        });
        this.buffer = data;
        cb();
    };
    HeFiveParser.prototype._flush = function (cb) {
        this.push(this.buffer);
        this.buffer = Buffer.alloc(0);
        cb();
    };
    return HeFiveParser;
}(Transform));
module.exports = HeFiveParser;
