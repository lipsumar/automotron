import Node from "./Node";

export default class Operator extends Node{
  evaluate(){
    return Promise.resolve(null)
  }
  toString(){
    return `#${this.id}[operator: ${this.operator}]`
  }
}