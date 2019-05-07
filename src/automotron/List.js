import sample from 'lodash.sample'
import Generator from './Generator';

export default class List extends Generator{
  constructor(opts){
    super(opts)
    this.setValue(opts.value)
    this.type = 'generator'
    this.generator = 'list'
  }
  setValue(value){
    if(typeof value === 'string'){
      this.rawValue = value
      this.value = rawValueToList(value)
    }else{
      this.value = value
      this.rawValue = value.map(v => v.value).join('\n')
    }
    
  }
  evaluate(agreementValue = null){
    if(!agreementValue){
      return Promise.resolve(sample(this.value))
    }
    
    const possible = this.value.filter(onlyAgreeable.bind(null, agreementValue))
    const chosen = sample(possible)
    const evaluatedValue = {
      value: chosen.value,
      agreement: agreementValue.agreement
    }
    if(chosen.agreed){
      // need to choose the right agree
      const match = getMatchingAgreed(chosen.agreed, agreementValue)
      evaluatedValue.value = match.finalValue
      evaluatedValue.agreement = match.finalAgreement
    }
    return Promise.resolve(evaluatedValue)
  }

  normalize(){
    const norm = Generator.prototype.normalize.call(this)
    norm.generator = 'list'
    return norm
  }

}


function rawValueToList(value) {
  value = value.trim()
  return value.split('\n').map(line => {
    const split = line.lastIndexOf('(')

    if (line.length >= 4 && (split > -1 && line[line.length - 1]) || line[0] === '[') {
      let string = line
      let config = '(**)'
      if (split > -1) {
        string = line.substring(0, split)
        config = line.substring(split)
      }

      const agreement = parseAgreement(config)
      const agreed = makeAgreement(string, agreement)
      return {
        value: agreed ? sample(Object.values(agreed).filter(a => typeof a === 'string')) : string,
        agreement,
        agreed
      }
    }

    return {
      value: line,
      agreement: parseAgreement('(**)')
    }
  })
}

function parseAgreement(str) {
  str = str.substring(1, str.length - 1)
  let gender, number;
  if (str.length === 2) {
    [gender, number] = str.split('')
  }

  if (str.length === 1) {
    if (str === 'f' || str === 'm') {
      return { m: str === 'm', f: str === 'f', s: true, p: true }
    }
    if (str === 's' || str === 'p') {
      return { m: true, f: true, s: str === 's', p: str === 'p' }
    }
  }

  return {
    m: gender === 'm' || gender === '*',
    f: gender === 'f' || gender === '*',
    s: number === 's' || number === '*',
    p: number === 'p' || number === '*'
  }
}

function makeAgreement(str, agreement) {
  if (str[0] === '[') {
    str = str.substring(1, str.length - 1)
    const words = str.split(',').map(w => w.trim())
    if (words.length === 4) {
      return {
        ms: words[0],
        fs: words[1],
        mp: words[2],
        fp: words[3]
      }
    }

    if (words.length === 2) {
      if (!agreement.m) {
        return {
          ms: null,
          fs: words[0],
          mp: null,
          fp: words[1]
        }
      }
    }
  }
}


function onlyAgreeable(agreement, value){
  const filter = agreement.finalAgreement || agreement.agreement
  const subject = value.agreement
  // au moins en avoir un qui match dans chaque paire
  return (filter.f === subject.f || filter.m === subject.m) && (filter.s === subject.s || filter.p === subject.p) 
}

function getMatchingAgreed(agreed, agreementValue){
  const agreement = agreementValue.finalAgreement || agreementValue.agreement
  const finalAgreement = {m:false,f:false,s:false,p:false}
  for(let bigram in agreed){
    if(!agreed[bigram]) continue
    const [g,n] = bigram.split('')
    if(agreement[g] && agreement[n]){
      finalAgreement[g] = true
      finalAgreement[n] = true
      return {
        finalValue: agreed[bigram],
        finalAgreement
      }
    }
  }
  throw new Error('could not find a matching agreed', agreed, agreementValue)
}