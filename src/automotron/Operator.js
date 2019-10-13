import Node from "./Node";

export default class Operator extends Node{
  evaluate(){
    return Promise.resolve(null)
  }
}