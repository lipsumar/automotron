const codes = {
  AGREEMENT_CONTAINER_NOT_EVALUATED: {
    message: 'can’t get agreement from unevaluated container',
    extendedMessage: 'The container in red is connected to a container that is not yet evaluated, so there can’t be an agreemnt with it'
  }
}

export default class GraphRuntimeError extends Error {
  constructor(code, node){
    if(codes[code]){
      super(codes[code].message)
      this.extendedMessage = codes[code].extendedMessage
    } else {
      super(code)
    }
    this.node = node
  }
}

