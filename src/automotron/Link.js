export default class Link{
  constructor(opts){
    this.type = opts.type || 'main'
    this.from = opts.from
    this.to = opts.to
    this.fromOutlet = opts.fromOutlet
    this.toInlet = opts.toInlet
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
      type: this.type
    }
  }
}