import sample from 'lodash.sample'

export default class Generator{
  constructor(){
    this.value = []
  }
  setValue(value){
    this.value = value
  }
  evaluate(){
    return Promise.resolve(sample(this.value))
  }
}