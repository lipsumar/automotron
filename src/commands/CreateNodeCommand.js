import BaseCommand from './BaseCommand'

const methodMap = {
  container: 'createContainer',
  generator: 'createGenerator',
  operator: 'createOperator'
}

export default class CreateNodeCommand extends BaseCommand {
  execute(){
    const node = this.graph[methodMap[this.opts.type]](this.opts)
    this.ui[methodMap[this.opts.type]](node)
    this.opts.id = node.id // store created id so it's the same in following redo
    this.ui.nodeLayer.draw()
    this.node = node
  }

  undo(){
    this.graph.removeNode(this.node.id)
    this.ui.removeNode(this.node.id)
    this.ui.nodeLayer.draw()
  }
}