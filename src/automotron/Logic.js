import Operator from './Operator';

export default class Logic extends Operator{
  constructor(opts){
    super(opts)
    this.type = 'operator'
    this.operator = 'logic'
    this.value = opts.value || '// javascript'
  }

  setValue(value){
    this.value = value
  }

  evaluateNextOutlet(sequence){
    this.lastTag = null
    const lastTagNode = [...sequence].reverse().find(item => item.operator == 'tag')
    if(lastTagNode){
      this.lastTag = lastTagNode.tag
    }
    return { nextOutlet: 'outlet' }
  }

  getExecutableCode(){
    const lastTag = typeof this.lastTag === 'string' ? `"${this.lastTag.replace('"','\\"')}"` : 'null'
    return `
    function rand(min, max) {
      min = Math.ceil(min);
      max = Math.floor(max);
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    const lastTag = () => ${lastTag};
    (() => {${this.value}})()`
  }

  pickNextLink(links){
    let nextTag = null
    try{
      nextTag = eval(this.getExecutableCode())
    }catch(err){
      console.error(`Error in logic node: ${err.message}`)
      throw err
    }
    
    console.log({nextTag, links})

    const nextLink = links.find(link => link.to.value === nextTag)
    if(!nextLink){
      console.error(`Error in logic: no link to "${nextTag}" found`)
      throw new Error('next tag not found')
    }
    return nextLink
  }

  normalize(){
    const norm = Operator.prototype.normalize.call(this)
    norm.operator = 'logic'
    return norm
  }
}