import Generator from "./Generator";

export default class Proxy extends Generator{
  constructor(opts){
    super(opts)
    this.type = 'generator'
    this.generator = 'proxy'
    this.graph = opts.graph
  }

  evaluate(){
    const next = this.graph.pickNextContainer(this)
    console.log('PROXY to', next)
    return Promise.resolve(next.evaluatedValue)
  }

  normalize(){
    const norm = Generator.prototype.normalize.call(this)
    norm.generator = this.generator
    return norm
  }
}