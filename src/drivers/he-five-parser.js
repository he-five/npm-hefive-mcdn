const { Transform } = require('stream')

/**
 * A transform stream that emits data each time a byte sequence is received.
 * @extends Transform
 * @summary To use the `Delimiter` parser, provide a delimiter as a string, buffer, or array of bytes. Runs in O(n) time.
 * @example
 const SerialPort = require('serialport')
 const Delimiter = require('@serialport/parser-delimiter')
 const port = new SerialPort('/dev/tty-usbserial1')
 const parser = port.pipe(new Delimiter({ delimiter: '\n' }))
 parser.on('data', console.log)
 */
class HeFiveParser extends Transform {
  constructor(options = {}) {
    super(options)
    this.passDelimiter = Buffer.from('>', 'ascii');
    this.failDelimiter = Buffer.from('?', 'ascii');
    this.buffer = Buffer.alloc(0)
  }

  _transform(chunk, encoding, cb) {
    let data = Buffer.concat([this.buffer, chunk])
    let position
    while (((position = data.indexOf(this.passDelimiter)) !== -1) ||
          ((position = data.indexOf(this.failDelimiter)) !== -1))
    {
      this.push(data)
      data = data.slice(position + this.passDelimiter.length)
    }
    this.buffer = data
    cb()
  }

  _flush(cb) {
    this.push(this.buffer)
    this.buffer = Buffer.alloc(0)
    cb()
  }
}

module.exports = HeFiveParser
