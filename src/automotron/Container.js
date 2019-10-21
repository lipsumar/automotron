import Node from "./Node";
import agreementUtils from './agreementUtils'
import sample from 'lodash.sample'

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
    const possibleValues = agreementUtils.getMatchingValues(this.value, agreement)

    const pickedFlag = sample(Object.keys(possibleValues))
    const evaluatedValue = {
      value: possibleValues[pickedFlag],
      agreement: agreementUtils._getAgreement(pickedFlag)
    }

    return Promise.resolve(evaluatedValue)
  }
}