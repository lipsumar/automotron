import { EventEmitter } from "events";

export default class Link extends EventEmitter{
  constructor(opts){
    super()
    this.type = opts.type || 'main'
    this.from = opts.from
    this.to = opts.to
    this.fromOutlet = opts.fromOutlet
    this.toInlet = opts.toInlet
    this.separator = typeof opts.separator === 'undefined' ? ' ' : opts.separator
  }

  setSeparator(sep){
    this.separator = sep
    this.emit('setSeparator')
  }

  normalize(){
    return {
      from: {
        nodeId: this.from.id,
        outlet: this.fromOutlet
      },
      to:{
        nodeId: this.to.id,
        inlet: this.toInlet
      },
      type: this.type,
      separator: this.separator
    }
  }
}