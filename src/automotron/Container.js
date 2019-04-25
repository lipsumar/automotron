export default class Container{
  constructor(opts){
    this.value = opts.value
  }

  setValue(value){
    this.value = value
  }

  evaluate(){
    return new Promise(resolve => {
      resolve(this.value)
    })
  }
}