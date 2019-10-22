import sample from 'lodash.sample'
import Generator from './Generator';
import agreementUtils from './agreementUtils'

export default class List extends Generator {
  constructor(opts) {
    super(opts)
    this.setValue(opts.rawValue || '...')
    this.type = 'generator'
    this.generator = 'list'
  }

  setValue(value) {
    this.value = value.split('\n').map(line => agreementUtils.parse(line))
    this.rawValue = value
  }

  evaluate(agreement) {
    const possibleValues = this.value
      .filter(value => {
        return agreementUtils.getMatchingValues(value, agreement) !== false
      })

    const chosenValue = sample(possibleValues);

    return Promise.resolve(
      agreementUtils.getRandomMatchingValue(chosenValue, agreement)
    )
  }

  normalize() {
    const norm = Generator.prototype.normalize.call(this)
    norm.generator = 'list'
    norm.rawValue = this.rawValue
    return norm
  }
}
