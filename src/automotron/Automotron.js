import Container from "./Container";
import Link from "./Link";
import sample from 'lodash.sample'

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

  removeLink(from, to){
    const i = this.links.findIndex(l => l.from.id === from.id && l.to.id === to.id)
    this.links.splice(i, 1)
  }

  play() {
    this.sequence = []
    return this.step(this.startContainer)
  }

  step(container) {
    console.log('STEP', container)
    return container.evaluate()
      .then(value => {
        this.sequence.push(value)
        const nextContainer = this.pickNextContainer(container)
        if(nextContainer){
          return this.step(nextContainer)
        }
        return this.sequence.join(' ')
      })
  }

  pickNextContainer(container){
    const links = this.links.filter(l => l.from.id === container.id)
    if(links.length === 0) return null
    return sample(links).to
  }

  setStartContainer(container) {
    this.startContainer = container
  }
}