import sample from 'lodash.sample'

export default class Split{
  constructor(opts){
    this.type = 'operator'
    this.pos = opts.pos
  }

  evaluateNextOutlet(){
    return sample(['split-a', 'split-b'])
  }
}