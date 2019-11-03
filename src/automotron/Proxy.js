import Generator from "./Generator";

export default class Proxy extends Generator{
  constructor(opts){
    super(opts)
    this.type = 'generator'
    this.generator = 'proxy'
    this.graph = opts.graph
  }

  evaluate(agreement){
    // either this proxy has run before,
    // then we return the same as before
    if(this.evaluatedSequence){
      const joined = this.graph.joinSequence(this.evaluatedSequence)// this.evaluatedSequence.map(v => v.value).join(' ')
      console.log('----->', joined)
      return Promise.resolve({
        value: joined,
        agreement: undefined,
      })
    }

    // or not, then it behaves like a macro
    const next = this.graph.pickNextContainer(this)
    const mySeq = []
    return this.graph.recursiveSteps(next, agreement, mySeq).then(seq => {
      this.evaluatedSequence = seq;
      return {
        value: this.graph.joinSequence(seq)
      }
    })
  }

  reset(){
    this.evaluatedSequence = null
  }

  normalize(){
    const norm = Generator.prototype.normalize.call(this)
    norm.generator = this.generator
    return norm
  }
}