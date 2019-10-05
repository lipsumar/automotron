import Operator from './Operator';

export default class Split extends Operator{
  constructor(opts){
    super(opts)
    this.type = 'operator'
    this.operator = 'split'
    this.value = opts.value || 50
  }

  setValue(value){
    this.value = parseInt(value, 10);
  }

  evaluateNextOutlet(){
    const nextOutlet = Math.random()*100 > this.value ? 'split-a' : 'split-b'; 
    return { nextOutlet }
  }

  normalize(){
    const norm = Operator.prototype.normalize.call(this)
    norm.operator = 'split'
    return norm
  }
}