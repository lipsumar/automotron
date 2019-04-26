import sample from 'lodash.sample'

export default class Split{
  constructor(){

  }

  evaluateNextOutlet(){
    return sample(['split-a', 'split-b'])
  }
}