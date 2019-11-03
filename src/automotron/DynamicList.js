import sample from 'lodash.sample'
import Generator from './Generator';
import agreementUtils from './agreementUtils'

export default class List extends Generator {
  constructor(opts) {
    super(opts)    
    this.type = 'generator'
    this.generator = 'dynamic-list'
    this.graph = opts.graph
    this.dynamicValues = []
    
    this.graph.on('setEvaluatedValue', evt => {
      if(this.ingressContainersIds.includes(evt.container.id)){
        console.log('👂heard', evt)
        this.dynamicValues.push(evt.evaluatedValue)
      }
    })
  }

  evaluate(agreement) {
    return Promise.resolve(
      sample(this.dynamicValues)
    )
  }

  reset(){
    this.dynamicValues = []
    this.ingressContainers = this.graph.getContainersConnectedToNodeOutlet(this, 'ingress')
    this.ingressContainersIds = this.ingressContainers.map(n => n.id)
    console.log('ingress containers====>', this.ingressContainers)
  }

  normalize() {
    const norm = Generator.prototype.normalize.call(this)
    norm.generator = this.generator
    return norm
  }
}
