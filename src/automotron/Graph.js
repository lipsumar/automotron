import Container from "./Container";
import Link from "./Link";
import sample from 'lodash.sample'
import Generator from "./Generator";
import Split from './Split'
import Loop from "./Loop";
import Operator from "./Operator";
import List from "./List";
import Macro from "./Macro";
import Proxy from "./Proxy";
import Tag from './Tag';
import Logic from './Logic';

export default class AutomotronGraph {
  constructor(state) {
    this.nextNodeId = 0
    this.nodes = []
    this.links = []
    this.startContainer = null
    this.buildState(state)
    this.setStartContainer(this.getNode(state.startNodeId))
  }

  buildState(state) {
    state.nodes.forEach(node => {
      if (node.type === 'container') {
        this.createContainer(node)
      } else if (node.type === 'generator') {
        this.createGenerator(node)
      } else if (node.type === 'operator') {
        this.createOperator(node)
      }

      this.nextNodeId = node.id >= this.nextNodeId ? node.id + 1 : this.nextNodeId
    })

    state.links.forEach(link => {
      const from = this.getNode(link.from.nodeId)
      const to = this.getNode(link.to.nodeId)
      if (link.type === 'agreement') {
        this.createAgreementLink(from, to)
      } else {
        this.createLink(from, to, {
          fromOutlet: link.from.outlet,
          toInlet: link.to.inlet
        })
      }

    })
  }

  getNewNodeId() {
    return this.nextNodeId++
  }

  getNode(id) {
    return this.nodes.find(n => n.id === id)
  }

  createContainer(opts) {
    const c = new Container(opts)
    c.id = opts.id || this.getNewNodeId()
    this.nodes.push(c)
    return c
  }

  createGenerator(opts) {
    let generator;
    if (opts.generator === 'list') {
      generator = new List(opts)
    } else if (opts.generator === 'macro') {
      generator = new Macro({ ...opts, graph: this })
    } else if (opts.generator === 'proxy') {
      generator = new Proxy({ ...opts, graph: this })
    }

    generator.id = opts.id || this.getNewNodeId()
    this.nodes.push(generator)
    return generator
  }

  createOperator(opts) {
    let operator;
    if (opts.operator === 'split') {
      operator = new Split(opts)
    } else if (opts.operator === 'loop') {
      operator = new Loop({ ...opts, graph: this })
    } else if (opts.operator === 'tag') {
      operator = new Tag(opts)
    } else if (opts.operator === 'logic') {
      operator = new Logic(opts)
    }

    operator.id = opts.id || this.getNewNodeId()
    this.nodes.push(operator)
    return operator
  }

  removeNode(id) {
    const index = this.nodes.findIndex(n => n.id === id)
    if (index === -1) {
      throw new Error(`Can't remove node #${id}: no such node`)
    }
    if (id === this.startContainer.id) {
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
    const link = new Link({ from, to, type: 'agreement', fromOutlet: 'agreement', toInlet: 'agreement' })
    this.links.push(link)
    return link
  }

  reset() {
    this.sequence = []
    this.nodes.forEach(n => n.reset())
    this.stepsCount = 0
    this.previousNode = null
  }

  run() {
    this.reset();
    return this.recursiveSteps(this.startContainer);
  }

  recursiveSteps(container, agreement = null, seq = null) {
    return this.step(container, agreement, seq).then(({ nextContainer, seq }) => {
      if (nextContainer) {
        return this.recursiveSteps(nextContainer, null, seq);
      } else {
        return seq || this.sequence
      }
    })
  }

  step(container, agreement = null, seq = null) {
    console.log('STEP ' + container)

    this.stepsCount++
    if (this.stepsCount > 1000) {
      console.log('inifnite loop')
      return
    }

    return this.evaluateContainer(container, agreement)
      .then(evaluatedValue => {
        if (evaluatedValue !== null && !(evaluatedValue instanceof Array)) {
          container.setEvaluatedValue(evaluatedValue)
          console.log('  SET ' + container, '\n  --> ', evaluatedValue.value, '\n      ', JSON.stringify(evaluatedValue.agreement))
          this.sequence.push(evaluatedValue)
          if (seq) seq.push(evaluatedValue)
        }
        if (evaluatedValue instanceof Array) {
          const joined = evaluatedValue.map(v => v.value).join(' ')
          console.log('  SET ' + container, joined)
          container.setEvaluatedValue({
            value: joined
          })
        }

        this.previousNode = container

        const nextContainer = this.pickNextContainer(container)
        return { nextContainer, seq, evaluatedValue }
      })
  }

  evaluateContainer(container, withAgreement = null) {
    const agreementContainer = this.getAgreementContainer(container)
    const agreement = withAgreement || (agreementContainer 
      ? agreementContainer.evaluatedValue.agreement 
      : { m: true, f: true, s: true, p: true });

    console.log('  using agreement', agreement)

    const generator = this.getContainerGenerator(container)
    if(generator){
      console.log('  using generator instead => '+ generator)
      return generator.evaluate(agreement)
    }

    console.log('no generator', agreement)
    return container.evaluate(agreement)
  }

  pickNextContainer(container) {
    let links = this.links.filter(l => l.type === 'main' && l.from.id === container.id && l.toInlet === 'inlet')
    if (links.length === 0) return null

    if (container instanceof Operator) {
      const { nextOutlet } = container.evaluateNextOutlet(this.sequence)

      console.log('===>', nextOutlet, links)
      links = links.filter(l => l.fromOutlet === nextOutlet)
    }

    if (container.pickNextLink) {
      return container.pickNextLink(links).to
    }
    return sample(links).to
  }

  getContainerGenerator(container) {
    const links = this.links.filter(l => l.to.id === container.id && l.from instanceof Generator && l.toInlet === 'generator')
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

  normalize() {
    return {
      nodes: this.nodes.map(n => n.normalize()),
      links: this.links.map(l => l.normalize()),
      startNodeId: this.startContainer.id
    }
  }
}