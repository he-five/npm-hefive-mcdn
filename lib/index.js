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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Commands = exports.McdnDriver = void 0;
var events_1 = require("events");
var mcdn_cmd_1 = require("./drivers/mcdn-cmd");
var driver_replay_1 = require("./drivers/driver-replay");
var path = require('path');
var SerialPort = require('serialport');
var child_process = require('child_process');
var Commands;
(function (Commands) {
    Commands["FW_VER"] = "FW_VER";
    Commands["ENCODER"] = "ENCODER";
    Commands["FOLLOWING_ERROR"] = "FOLLOWING_ERROR";
})(Commands || (Commands = {}));
exports.Commands = Commands;
var McdnDriver = /** @class */ (function (_super) {
    __extends(McdnDriver, _super);
    function McdnDriver() {
        var _this = _super.call(this) || this;
        _this.driverProcess = null;
        _this.connected = false;
        return _this;
    }
    McdnDriver.prototype.enumSerialPorts = function () {
        var _this = this;
        SerialPort.list().then(function (ports) {
            var portsPath = [];
            ports.forEach(function (port) {
                //console.log(port['path'])
                if (port['path']) {
                    portsPath.push(port['path']);
                }
            });
            _this.emit('ports', portsPath);
        }, function (err) {
            _this.emit('error', err);
            //console.error(err)
        });
    };
    McdnDriver.prototype.openMcdnPort = function (portName) {
        var serilOrMcdn = 'mcdn';
        this.createProcess(serilOrMcdn, portName);
    };
    McdnDriver.prototype.openSerialPort = function (portName) {
        var serilOrMcdn = 'serial';
        this.createProcess(serilOrMcdn, portName);
    };
    McdnDriver.prototype.createProcess = function (serilOrMcdn, portName) {
        var _a;
        this.driverProcess = child_process.fork(path.join(__dirname, '/drivers/index'), [serilOrMcdn]);
        if (this.driverProcess.connected) {
            this.connected = true;
            this.consumeEvents();
            (_a = this.driverProcess) === null || _a === void 0 ? void 0 : _a.send(new mcdn_cmd_1.McdnCmd(mcdn_cmd_1.ServiceCommands.CONNECT, portName));
        }
    };
    McdnDriver.prototype.disconnect = function () {
        var _a;
        (_a = this.driverProcess) === null || _a === void 0 ? void 0 : _a.send(new mcdn_cmd_1.McdnCmd(mcdn_cmd_1.ServiceCommands.DISCONNECT));
    };
    McdnDriver.prototype.getFwVersion = function () {
        this.sendCmd(Commands.FW_VER);
    };
    McdnDriver.prototype.sendCmd = function (cmd) {
        var _a;
        console.log("REQUEST: " + cmd);
        (_a = this.driverProcess) === null || _a === void 0 ? void 0 : _a.send(new mcdn_cmd_1.McdnCmd(cmd));
    };
    McdnDriver.prototype.sendStr = function (str) {
        var _a;
        console.log("STR REQUEST: " + str);
        (_a = this.driverProcess) === null || _a === void 0 ? void 0 : _a.send(new mcdn_cmd_1.McdnCmd(mcdn_cmd_1.ServiceCommands.STRING, str));
    };
    McdnDriver.prototype.consumeEvents = function () {
        var _this = this;
        var _a, _b, _c, _d;
        (_a = this.driverProcess) === null || _a === void 0 ? void 0 : _a.on('close', function () {
            //console.log('close')
            _this.connected = false;
            _this.emit('disconnected');
        });
        (_b = this.driverProcess) === null || _b === void 0 ? void 0 : _b.on('disconnect', function () {
            //console.log('driverProcess disconnect')
        });
        (_c = this.driverProcess) === null || _c === void 0 ? void 0 : _c.on('error', function (err) {
            console.log("error: " + err);
            _this.emit('error', err);
        });
        (_d = this.driverProcess) === null || _d === void 0 ? void 0 : _d.on('message', function (msg) {
            //console.log(`driverProcess error: ${msg}`)
            if (msg.type == driver_replay_1.IpcReplyType.DRV) {
                _this.emit('data', msg.drvReply);
            }
            if (msg.type == driver_replay_1.IpcReplyType.ERROR) {
                _this.emit('error', msg.err);
            }
            if (msg.type == driver_replay_1.IpcReplyType.CONNECTED) {
                _this.emit('connected', msg.drvReply);
            }
        });
    };
    return McdnDriver;
}(events_1.EventEmitter));
exports.McdnDriver = McdnDriver;
