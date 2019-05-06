import sample from 'lodash.sample'
import Operator from './Operator';

export default class Split extends Operator{
  constructor(opts){
    super(opts)
    this.type = 'operator'
    this.operator = 'split'
  }

  evaluateNextOutlet(){
    return {nextOutlet: sample(['split-a', 'split-b'])}
  }

  normalize(){
    const norm = Operator.prototype.normalize.call(this)
    norm.operator = 'split'
    return norm
  }
}