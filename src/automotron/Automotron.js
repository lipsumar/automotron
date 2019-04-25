import Container from "./Container";
import Link from "./Link";
import sample from 'lodash.sample'
import Generator from "./Generator";

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

  createLink(from, to) {
    this.links.push(new Link({ from, to }))
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

  createAgreementLink(){
    //todo - currently ignored
  }


  play() {
    this.sequence = []
    return this.step(this.startContainer)
  }

  step(container) {
    // eslint-disable-next-line no-console
    console.log('STEP', container)

    return this.evaluateContainer(container)
      .then(value => {
        this.sequence.push(value)
        const nextContainer = this.pickNextContainer(container)
        if(nextContainer){
          return this.step(nextContainer)
        }
        return this.sequence.join(' ')
      })
  }

  evaluateContainer(container){
    const generator = this.getContainerGenerator(container)
    if(generator){
      return generator.evaluate()
    }

    return container.evaluate()
  }

  pickNextContainer(container){
    const links = this.links.filter(l => l.from.id === container.id)
    if(links.length === 0) return null
    return sample(links).to
  }

  getContainerGenerator(container){
    const links = this.links.filter(l => l.to.id === container.id && l.from instanceof Generator)
    if(links.length === 0) return null
    return sample(links).from
  }

  setStartContainer(container) {
    this.startContainer = container
  }
}