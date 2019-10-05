import Node from "./Node";

export default class TagNode extends Node {
  constructor(opts) {
    super(opts)
    this.evaluatedValue = null
    this.setValue(opts.value || '...')
    this.type = 'operator'
    this.operator = 'tag'
  }

  setValue(value) {
    this.value = value
  }

  setEvaluatedValue(){}

  evaluate() {
    return new Promise(resolve => {
      resolve({
        operator: 'tag',
        tag: this.value
      })
    })
  }

  normalize(){
    const norm = Node.prototype.normalize.call(this)
    norm.operator = 'tag'
    return norm
  }
}