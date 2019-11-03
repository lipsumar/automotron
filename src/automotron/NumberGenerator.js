import Generator from './Generator';

export default class List extends Generator {
  constructor(opts) {
    super(opts)
    this.type = 'generator'
    this.generator = 'number'
    this.currentNumber = 1;
  }

  evaluate() {
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
    return norm
  }
}
