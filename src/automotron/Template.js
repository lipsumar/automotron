import Node from "./Node";

export default class TemplateContainerNode extends Node {
  constructor(opts) {
    super(opts)
    this.evaluatedValue = null
    this.setValue(opts.value || '...')
    this.type = 'container'
    this.container = 'template'
    this.graph = opts.graph
  }

  setValue(value) {
    if (typeof value === 'string') {
      this.value = {
        values: { '**': value },
        raw: value
      }
    } else {
      this.value = value
    }

  }

  setEvaluatedValue(evValue) {
    this.evaluatedValue = evValue
  }

  reset() {
    this.evaluatedValue = null
  }

  evaluate() {
    let tpl = this.value.raw

    const links = this.graph.links.filter(l => l.type === 'main' && l.from.id === this.id && l.toInlet === 'inlet' && l.fromOutlet==='labels')

    const labels = this.findLabels(tpl)
    const replacements = []
    return labels.reduce((acc, label) => {
      return acc.then(() => {
        const link = links.find(link => link.to.value === label)
        const mySeq = []
        return this.graph.recursiveSteps(link.to, null, mySeq).then(seq => {
          replacements.push(this.graph.joinSequence(seq))
        })
      })
    }, Promise.resolve())
    /*Promise.all(
      labels.map(label => {
        const link = links.find(link => link.to.value === label)
        const mySeq = []
        return this.graph.recursiveSteps(link.to, null, mySeq).then(seq => {
          return this.graph.joinSequence(seq)
        })
      })
    )*/.then(() => {
      labels.forEach((label,i) => {
        tpl = tpl.replace('[['+label+']]', replacements[i]);
      })
      return {value: tpl}
    })
    
  }

  findLabels(str) {
    const regex = /\[\[([^\]]+)\]\]/gm;
    let m;
    const labels = []
    while ((m = regex.exec(str)) !== null) {
      // This is necessary to avoid infinite loops with zero-width matches
      if (m.index === regex.lastIndex) {
        regex.lastIndex++;
      }

      // The result can be accessed through the `m`-variable.
      labels.push(m[1])
    }
    return labels
  }

  normalize() {
    const norm = Node.prototype.normalize.call(this)
    norm.container = this.container
    return norm;
  }
}