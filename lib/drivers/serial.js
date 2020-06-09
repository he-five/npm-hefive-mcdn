"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Serial = void 0;
const SerialPort = require('serialport');
const HeFiveParser = require('./he-five-parser');
class Serial {
    constructor() {
        this.connected = false;
        this.serialPort = null;
    }
    connect(portName) {
        if (!this.connected) {
            // Not connected
            this.serialPort = new SerialPort(portName, { baudRate: 115200 }, (err) => {
                if (err) {
                    this.connected = false;
                    // TODO Error event 'Open port failed'
                }
            });
            this.parser = this.serialPort.pipe(new HeFiveParser());
            this.connected = true;
            this.startLisening();
        }
    }
    readFwVersion() {
        this.serialPort.write('ver\r', 'ascii', (err) => {
            if (err) {
                // TODO add error handaling
            }
        });
    }
    startLisening() {
        if (!this.connected) {
            return;
        }
        // Switches the port into "flowing mode"
        this.serialPort.on('data', (data) => {
            //console.log('RAW:', data.toString('ascii'))
        });
        this.parser.on('data', (data) => {
            console.log('PARSED:', data.toString('ascii'));
        });
        // Open errors will be emitted as an error event
        this.serialPort.on('error', (err) => {
            console.log('Error: ', err.message);
        });
    }
    disconnect() { }
}
exports.Serial = Serial;
