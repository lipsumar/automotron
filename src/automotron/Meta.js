import Node from "./Node";
import AutomotronGraph from "./Graph";
import emptyGraph from '../data/emptyGraph.json'

export default class MetaNode extends Node {
  constructor(opts) {
    super(opts)
    this.evaluatedValue = null
    this.setValue(opts.value || `meta-${opts.id}`)
    this.type = 'meta'
    this.graph = new AutomotronGraph(opts.graph || emptyGraph.graph);
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
    return this.graph.run().then(seq => {
      console.log(seq)
      return {value: seq}
    })
  }

  normalize(){
    const norm = Node.prototype.normalize.call(this)
    norm.graph = this.graph.normalize()
    return norm
  }
}