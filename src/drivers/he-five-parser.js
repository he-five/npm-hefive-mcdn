//import {cmdFail, cmdPass } from '../mcdn-cmd'
const { Transform } = require('stream')


class HeFiveParser extends Transform {
  constructor(options = {}) {
    super(options)

    this.terminators = [];
    if (options.terminators){
      if (Array.isArray(options.terminators)){
        options.terminators.forEach((term) => {
          this.terminators.push(Buffer.from(term, 'ascii'));
        })
      }
      else {
        throw new TypeError('"terminators" expect to be array ')
      }
    }
    else{
      throw new TypeError('"terminators" has to be paas as option')
    }

    this.buffer = Buffer.alloc(0)
  }

  _transform(chunk, encoding, cb) {
    let data = Buffer.concat([this.buffer, chunk])

    this.terminators.forEach((term) => {
      let position;
      while ((position = data.indexOf(term)) !== -1) {

        this.push(data.slice(0, position + term.length ))
        data = data.slice(position + term.length)
      }
    })
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
