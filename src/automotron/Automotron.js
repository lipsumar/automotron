import Container from "./Container";
import Link from "./Link";
import sample from 'lodash.sample'
import Generator from "./Generator";
import Split from './Split'

export default class Automotron {
  constructor() {
    this.nextNodeId = 0
    this.nodes = []
    this.links = []
    this.startContainer = null
  }

  createContainer(opts) {
    const c = new Container(opts)
    c.id = this.nextNodeId++
    this.nodes.push(c)
    return c
  }

  createLink(from, to, opts) {
    this.links.push(new Link({ from, to, fromOutlet: opts.fromOutlet, toInlet:opts.toInlet }))
  }

  createGenerator(opts){
    const g = new Generator(opts)
    g.id = this.nextNodeId++
    this.nodes.push(g)
    return g
  }

  removeLink(from, to){
    const i = this.links.findIndex(l => l.from.id === from.id && l.to.id === to.id)
    this.links.splice(i, 1)
  }

  createAgreementLink(from, to){
    this.links.push(new Link({ from, to, type: 'agreement' }))
  }

  createOperator(){
    const split = new Split()
    split.id = this.nextNodeId++
    this.nodes.push(split)
    return split
  }

  play() {
    console.log(this.links)
    this.sequence = []
    return this.step(this.startContainer)
  }

  step(container) {
    // eslint-disable-next-line no-console
    console.log('STEP', container)

    return this.evaluateContainer(container)
      .then(evaluatedValue => {
        if(evaluatedValue !== null){
          container.setEvaluatedValue(evaluatedValue)
          console.log('SET', container, evaluatedValue)
          this.sequence.push(evaluatedValue)
        }
        

        const nextContainer = this.pickNextContainer(container)
        if(nextContainer){
          return this.step(nextContainer)
        }
        return this.sequence
      })
  }

  evaluateContainer(container){

    if(container instanceof Split){
      return Promise.resolve(null)
    }

    const generator = this.getContainerGenerator(container)
    if(generator){
      
      const agreementContainer = this.getAgreementContainer(container)
      console.log('agreement =>', agreementContainer)
      return generator.evaluate(agreementContainer ? (agreementContainer.evaluatedValue || agreementContainer.value) : null)
    }

    return container.evaluate()
  }

  pickNextContainer(container){
    let links = this.links.filter(l => l.type==='main' && l.from.id === container.id)
    if(links.length === 0) return null

    if(container instanceof Split){
      const nextOutlet = container.evaluateNextOutlet()
      console.log('===>', nextOutlet, links)
      links = links.filter(l => l.fromOutlet === nextOutlet)
    }

    return sample(links).to
  }

  getContainerGenerator(container){
    const links = this.links.filter(l => l.to.id === container.id && l.from instanceof Generator)
    if(links.length === 0) return null
    return sample(links).from
  }

  getAgreementContainer(container){
    const link = this.links.find(l => l.type==='agreement' && l.from.id === container.id)
    if(!link) return null
    return link.to
  }

  setStartContainer(container) {
    this.startContainer = container
  }
}