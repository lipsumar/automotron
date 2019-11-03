import Operator from './Operator';

export default class Loop extends Operator{
  constructor(opts){
    super(opts)
    this.type = 'operator'
    this.operator = 'loop'
    this.graph = opts.graph
    this.reset()
    this.setValue(opts.value || 4)
  }

  setValue(value){
    this.value = parseInt(value, 10)
    this.maxCount = this.value 
  }

  reset(){
    this.loopCount = 0
    this.all = []
  }

  evaluate(){
    this.reset();
    return this.loop()
  }
  setEvaluatedValue(){}

  loop(){
    console.log('    loop '+this.loopCount)
    const next = this.graph.pickNextContainer(this)
    return this.graph.recursiveSteps(next, null, this.graph.sequence).then(seq => {
      this.all.push(...seq)
      this.loopCount++
      if(this.loopCount === this.maxCount){
        return this.all
      }
      return this.loop()
    })
  }

  evaluateNextOutlet(){
    if(this.loopCount < this.maxCount){
      // this.loopCount++
      return {nextOutlet: 'outlet'}
    }
    return {nextOutlet: 'then'}
    
  }

  normalize(){
    const norm = Operator.prototype.normalize.call(this)
    norm.operator = 'loop'
    norm.value = this.maxCount
    return norm
  }
}