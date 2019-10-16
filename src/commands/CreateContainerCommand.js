import BaseCommand from './BaseCommand'
import functions from './functions'

export default class createContainer extends BaseCommand{

  execute(){
    const node = functions.createContainer(this.opts, this)
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