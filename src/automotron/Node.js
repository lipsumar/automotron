export default class Node{
  constructor(opts){
    this.id = opts.id
    this.pos = opts.pos
  }
  normalize(){
    return {
      id: this.id,
      type: this.type,
      value: this.value,
      pos: this.pos
    }
  }
  reset(){}

  toString(){
    return `#${this.id}[${this.type}] ${this.value.raw}`
  }
}