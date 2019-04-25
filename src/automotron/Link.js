export default class Link{
  constructor(opts){
    this.type = opts.type || 'main'
    this.from = opts.from
    this.to = opts.to
  }
}