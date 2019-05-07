import Generator from "./Generator";

export default class Macro extends Generator{
  constructor(opts){
    super(opts)
    this.type = 'generator'
    this.generator = 'macro'
    this.graph = opts.graph
  }

  evaluate(){
    const next = this.graph.pickNextContainer(this)
    console.log('NEXT would be', next)
    return this.graph.step(next)
  }

  normalize(){
    const norm = Generator.prototype.normalize.call(this)
    norm.generator = 'macro'
    return norm
  }
}