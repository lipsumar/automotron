import Node from "./Node";

export default class Generator extends Node{
  toString(){
    return `#${this.id}[generator: ${this.generator}] ${this.rawValue ? this.rawValue.split('\n').join('↵') : ''}`
  }
}