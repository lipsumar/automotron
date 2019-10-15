import Node from "./Node";

export default class ContainerNode extends Node {
  constructor(opts) {
    super(opts)
    this.evaluatedValue = null
    this.setValue(opts.value || '...')
    this.type = 'container'
    this.graph = opts.graph
  }

  setValue(value) {
    if(typeof value === 'string'){
      this.value = {
        value,
        agreement: { m: true, f: true, s: true, p: true }
      }
    }else{
      this.value = value
    }
    
  }

  setEvaluatedValue(evValue){
    this.evaluatedValue = evValue
  }

  evaluate() {
    return new Promise(resolve => {
      resolve(this.value)
    })
  }
}