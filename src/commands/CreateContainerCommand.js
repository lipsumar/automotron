import BaseCommand from './BaseCommand'

export default class createContainer extends BaseCommand{

  execute(){
    const node = this.graph.createContainer(this.opts)
    this.ui.createContainer(node)
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