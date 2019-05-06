import sample from 'lodash.sample'
import Node from './Node';

export default class Split extends Node{
  constructor(opts){
    super(opts)
    this.type = 'operator'
  }

  evaluateNextOutlet(){
    return sample(['split-a', 'split-b'])
  }

  normalize(){
    const norm = Node.prototype.normalize.call(this)
    norm.operator = 'split'
    return norm
  }
}