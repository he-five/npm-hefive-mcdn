"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Serial = void 0;
const SerialPort = require('serialport');
class Serial {
    constructor() {
        this.connected = false;
        this.serialPort = null;
    }
    connect(portName) {
        if (!this.connected) {
            // Not connected
            this.serialPort = new SerialPort(portName, (err) => {
                if (err) {
                    this.connected = false;
                    // TODO Error event 'Open port failed'
                }
            });
            this.connected = true;
            this.startLisening();
        }
    }
    readFwVersion() {
        this.serialPort.write('ver\r\n', (err) => {
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
            console.log('Data:', data);
        });
        // Open errors will be emitted as an error event
        this.serialPort.on('error', (err) => {
            console.log('Error: ', err.message);
        });
    }
    disconnect() { }
}
exports.Serial = Serial;
