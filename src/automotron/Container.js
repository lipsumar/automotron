export default class ContainerNode {
  constructor(opts) {
    this.evaluatedValue = null
    this.setValue(opts.value)
    this.pos = opts.pos
    this.type = 'container'
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