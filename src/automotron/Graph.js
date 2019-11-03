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
import ExternalGraph from './ExternalGraph';
import DynamicList from './DynamicList';
import NumberGenerator from './NumberGenerator';
import GraphRuntimeError from './errors/GraphRuntimeError'
import { EventEmitter } from "events";

export default class AutomotronGraph extends EventEmitter {
  constructor(state, opts) {
    super()
    this.nextNodeId = 0
    this.nodes = []
    this.links = []
    this.startContainer = null
    this.apiBaseUrl = opts.apiBaseUrl;
    this.axios = opts.axios;
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
      if(!from || !to){
        console.log('abort link in graph')
        return
      }
      if(link.type === 'agreement'){
        this.createAgreementLink(from, to)
      } else {
        this.createLink(from, to, {
          fromOutlet: link.from.outlet,
          toInlet: link.to.inlet,
          separator: link.separator
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
    } else if( opts.generator === 'external-graph') {
      generator = new ExternalGraph({ ...opts, graph: this, apiBaseUrl: this.apiBaseUrl })
    } else if(opts.generator === 'dynamic-list') {
      generator = new DynamicList({ ...opts, graph: this })
    } else if(opts.generator === 'number') {
      generator = new NumberGenerator(opts)
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
    const link = new Link({ from, to, fromOutlet: opts.fromOutlet, toInlet: opts.toInlet, separator: opts.separator })
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

  removeAgreementLink(from, to){
    const i = this.links.findIndex(l => l.from.id === from.id && l.to.id === to.id && l.type === 'agreement')
    this.links.splice(i, 1)
  }

  reset() {
    this.sequence = []
    this.nodes.forEach(n => n.reset())
    this.stepsCount = 0
    this.previousNode = null
  }

  run() {
    this.reset();
    return this.recursiveSteps(this.startContainer, null, this.sequence);
  }

  recursiveSteps(container, agreement = null, seq = null) {
    return this.step(container, agreement, seq).then(({ nextContainer, seq }) => {
      if (nextContainer) {
        return this.recursiveSteps(nextContainer, null, seq);
      } else {
        return seq //|| this.sequence
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
          //this.sequence.push(evaluatedValue)
          if (seq) seq.push(evaluatedValue)
          this.emit('setEvaluatedValue', { container, evaluatedValue })
        }
        if (evaluatedValue instanceof Array) {
          const joined = this.joinSequence(evaluatedValue) //evaluatedValue.map(v => v.value).join(' ')
          console.log('  🤔SET ' + container, evaluatedValue, joined)
          container.setEvaluatedValue({
            value: joined
          })
          this.emit('setEvaluatedValue', { container, evaluatedValue: {value: joined} })
        }

        this.previousNode = container

        const nextContainer = this.pickNextContainer(container, seq)
        return { nextContainer, seq, evaluatedValue }
      })
  }

  evaluateContainer(container, withAgreement = null) {
    const agreementContainer = this.getAgreementContainer(container)
    let agreement = { m: true, f: true, s: true, p: true }; // default: agree with anything
    if(withAgreement){
      agreement = withAgreement;
    } else if (agreementContainer) {
      console.log('there is an agreement container', agreementContainer)
      if(!agreementContainer.evaluatedValue){
        throw new GraphRuntimeError('AGREEMENT_CONTAINER_NOT_EVALUATED', container)
      }
      agreement = agreementContainer.evaluatedValue.agreement 
    }

    console.log('  using agreement', agreement)

    const generator = this.getContainerGenerator(container)
    if(generator){
      console.log('  using generator instead => '+ generator)
      return generator.evaluate(agreement)
    }

    console.log('no generator', agreement)
    return container.evaluate(agreement)
  }

  pickNextContainer(container, seq) {
    let links = this.links.filter(l => l.type === 'main' && l.from.id === container.id && l.toInlet === 'inlet')
    if (links.length === 0) return null

    if (container instanceof Operator) {
      const { nextOutlet } = container.evaluateNextOutlet(this.sequence)

      console.log('===>', nextOutlet, links)
      links = links.filter(l => l.fromOutlet === nextOutlet)
    }

    let nextLink = sample(links)
    if (container.pickNextLink) {
      nextLink = container.pickNextLink(links)
    }
    if(seq) seq.push({separator: nextLink.separator})
    return nextLink.to
  }

  getContainerGenerator(container) {
    const links = this.links.filter(l => l.to.id === container.id && l.from instanceof Generator && l.toInlet === 'generator')
    if (links.length === 0) return null
    return sample(links).from
  }

  getAgreementContainer(container) {
    const link = this.links.find(l => l.type === 'agreement' && l.from.id === container.id)
    console.log('agreement link', link)
    if (!link) return null
    return link.to
  }

  getContainersConnectedToNodeOutlet(node, outlet){
    return this.links
      .filter(l => l.from.id === node.id && l.fromOutlet === outlet)
      .map(l => l.to)
  }

  setStartContainer(container) {
    this.startContainer = container
  }

  joinSequence(sequence){
    return sequence.map(i => i.value || i.separator).join('')
  }

  normalize() {
    return {
      nodes: this.nodes.map(n => n.normalize()),
      links: this.links.map(l => l.normalize()),
      startNodeId: this.startContainer.id
    }
  }
}