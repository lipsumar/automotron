export default class Container {
  constructor(opts) {
    this.evaluatedValue = null
    this.setValue(opts.value)
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