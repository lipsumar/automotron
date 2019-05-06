import Operator from './Operator';

export default class Loop extends Operator{
  constructor(opts){
    super(opts)
    this.type = 'operator'
    this.operator = 'loop'
    this.reset()
    this.maxCount = 4
    this.value = this.maxCount
  }

  setValue(value){
    this.value = value
    this.maxCount = value 
  }

  reset(){
    this.loopCount = 0
  }

  evaluateNextOutlet(){
    if(this.loopCount < this.maxCount){
      this.loopCount++
      return {nextOutlet: 'outlet', comeBackTo: this}
    }
    return {nextOutlet: 'then', comeBackTo: null}
  }

  normalize(){
    const norm = Operator.prototype.normalize.call(this)
    norm.operator = 'loop'
    norm.value = this.maxCount
    return norm
  }
}