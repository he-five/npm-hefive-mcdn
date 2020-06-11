//import {cmdFail, cmdPass } from '../mcdn-cmd'
const { Transform } = require('stream')


class HeFiveParser extends Transform {
  constructor(options = {}) {
    super(options)

    if (options.cmdTerminators){
      if (Array.isArray(options.cmdTerminators)){
        options.cmdTerminators.forEach((term) => {
          this.terminators.push(Buffer.from(term, 'ascii'));
        })
      }
      else {
        throw new TypeError('"cmdTerminators" expect to be array ')
      }
    }
    else{
      throw new TypeError('"cmdTerminators" has a 0 or undefined length')
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
