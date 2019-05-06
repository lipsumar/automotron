import Container from "./Container";
import Link from "./Link";
import sample from 'lodash.sample'
import Generator from "./Generator";
import Split from './Split'

export default class AutomotronGraph {
  constructor(state) {
    this.nextNodeId = 0
    this.nodes = []
    this.links = []
    this.startContainer = null
    this.buildState(state)
  }

  buildState(state) {
    state.nodes.forEach(node => {
      if (node.type === 'container') {
        this.createContainer(node)
      } else if (node.type === 'generator') {
        this.createGenerator(node)
      } else if(node.type==='operator'){
        this.createOperator(node)
      }

      this.nextNodeId = node.id >= this.nextNodeId ? node.id+1 : this.nextNodeId
    })

    state.links.forEach(link => {
      const from = this.getNode(link.from.nodeId)
      const to = this.getNode(link.to.nodeId)
      this.createLink(from, to, {
        fromOutlet: link.from.outlet,
        toInlet: link.to.inlet
      })
    })

    this.setStartContainer(this.getNode(state.startNodeId))
  }

  getNode(id) {
    return this.nodes.find(n => n.id === id)
  }

  createContainer(opts) {
    const c = new Container(opts)
    c.id = opts.id || this.nextNodeId++
    this.nodes.push(c)
    return c
  }

  createGenerator(opts) {
    const g = new Generator(opts)
    g.id = opts.id || this.nextNodeId++
    this.nodes.push(g)
    return g
  }

  createOperator(opts) {
    const split = new Split(opts)
    split.id = opts.id || this.nextNodeId++
    this.nodes.push(split)
    return split
  }

  removeNode(id){
    const index = this.nodes.findIndex(n => n.id === id)
    if(index === -1){
      throw new Error(`Can't remove node #${id}: no such node`)
    }
    if(id === this.startContainer.id){
      throw new Error(`Can't remove start node`)
    }
    this.nodes.splice(index, 1)
  }

  createLink(from, to, opts) {
    const link = new Link({ from, to, fromOutlet: opts.fromOutlet, toInlet: opts.toInlet })
    this.links.push(link)
    return link
  }

  removeLink(from, to) {
    const i = this.links.findIndex(l => l.from.id === from.id && l.to.id === to.id)
    this.links.splice(i, 1)
  }

  createAgreementLink(from, to) {
    const link = new Link({ from, to, type: 'agreement', fromOutlet: 'agreement', toInlet:'agreement' })
    this.links.push(link)
    return link
  }

  run() {
    this.sequence = []
    return this.step(this.startContainer)
  }

  step(container) {
    // eslint-disable-next-line no-console
    console.log('STEP', container)

    return this.evaluateContainer(container)
      .then(evaluatedValue => {
        if (evaluatedValue !== null) {
          container.setEvaluatedValue(evaluatedValue)
          console.log('SET', container, evaluatedValue)
          this.sequence.push(evaluatedValue)
        }


        const nextContainer = this.pickNextContainer(container)
        if (nextContainer) {
          return this.step(nextContainer)
        }
        return this.sequence
      })
  }

  evaluateContainer(container) {

    if (container instanceof Split) {
      return Promise.resolve(null)
    }

    const generator = this.getContainerGenerator(container)
    if (generator) {

      const agreementContainer = this.getAgreementContainer(container)
      console.log('agreement =>', agreementContainer)
      return generator.evaluate(agreementContainer ? (agreementContainer.evaluatedValue || agreementContainer.value) : null)
    }

    return container.evaluate()
  }

  pickNextContainer(container) {
    let links = this.links.filter(l => l.type === 'main' && l.from.id === container.id)
    if (links.length === 0) return null

    if (container instanceof Split) {
      const nextOutlet = container.evaluateNextOutlet()
      console.log('===>', nextOutlet, links)
      links = links.filter(l => l.fromOutlet === nextOutlet)
    }

    return sample(links).to
  }

  getContainerGenerator(container) {
    const links = this.links.filter(l => l.to.id === container.id && l.from instanceof Generator)
    if (links.length === 0) return null
    return sample(links).from
  }

  getAgreementContainer(container) {
    const link = this.links.find(l => l.type === 'agreement' && l.from.id === container.id)
    if (!link) return null
    return link.to
  }

  setStartContainer(container) {
    this.startContainer = container
  }

  normalize(){
    return {
      nodes: this.nodes.map(n => n.normalize()),
      links: this.links.map(l => l.normalize()),
      startNodeId: this.startContainer.id
    }
  }
}