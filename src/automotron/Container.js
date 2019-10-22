import Node from "./Node";
import agreementUtils from './agreementUtils'

export default class ContainerNode extends Node {
  constructor(opts) {
    super(opts)
    this.evaluatedValue = null
    this.setValue(opts.value || '...')
    this.type = 'container'
  }

  setValue(value) {
    if(typeof value === 'string'){
      this.value = agreementUtils.parse(value)
      this.value.raw = value
    }else{
      this.value = value 
    }
  }

  setEvaluatedValue(evValue){
    this.evaluatedValue = evValue
  }

  reset(){
    this.evaluatedValue = null
  }

  evaluate(agreement) {
    return Promise.resolve(
      agreementUtils.getRandomMatchingValue(this.value, agreement)
    )
  }
}