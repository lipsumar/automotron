import Generator from "./Generator";

export default class Macro extends Generator{
  constructor(opts){
    super(opts)
    this.type = 'generator'
    this.generator = 'macro'
    this.graph = opts.graph
  }

  evaluate(agreementContainer = null){
    const next = this.graph.pickNextContainer(this)
    console.log('NEXT would be', next)
    const mySeq = []
    return this.graph.step(next, agreementContainer, mySeq).then(seq => {
      console.log('Macro end=>', mySeq)
      return seq
    })
  }

  normalize(){
    const norm = Generator.prototype.normalize.call(this)
    norm.generator = 'macro'
    return norm
  }
}