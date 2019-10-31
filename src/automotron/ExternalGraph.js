import Generator from "./Generator";

export default class ExternalGrpah extends Generator{
  constructor(opts){
    super(opts)
    this.type = 'generator'
    this.generator = 'external-graph'
    this.value = opts.value || ''
    this.graph = opts.graph;
    this.apiBaseUrl = opts.apiBaseUrl
  }

  setValue(value){
    this.value = value
  }

  evaluate(){
    return this.graph.axios.get(`${this.apiBaseUrl}/graphs/${this.value}/run/json`).then(resp => {
      const sequence = resp.data;
      this.graph.sequence.push(...sequence)
      return sequence
    })
  }

  normalize(){
    const norm = Generator.prototype.normalize.call(this)
    norm.generator = this.generator
    norm.value = this.value
    return norm
  }
}