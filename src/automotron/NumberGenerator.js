import Generator from './Generator';

export default class List extends Generator {
  constructor(opts) {
    super(opts)
    this.type = 'generator'
    this.generator = 'number'
    this.currentNumber = 1;
    this.value = opts.value || ''
  }

  setValue(val){
    this.value = val
  }

  evaluate() {
    if(this.value && this.value.substr(0,6)==='random'){
      const [min, max] = this.value.replace('random(', '').replace(')','').split(',')
      return Promise.resolve(
        {value: rand(min, max)}
      )
    }
    return Promise.resolve(
      {value: this.currentNumber++}
    )
  }

  reset(){
    this.currentNumber = 1;
  }

  normalize() {
    const norm = Generator.prototype.normalize.call(this)
    norm.generator = this.generator
    norm.value = this.value
    return norm
  }
}

function rand(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}