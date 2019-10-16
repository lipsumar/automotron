import BaseCommand from './BaseCommand'
import functions from './functions'

export default class createLinkedContainer extends BaseCommand{

  execute(){
    // 1.  create container
    const node = functions.createContainer(this.opts, this)
    this.opts.id = node.id // store created id so it's the same in following redo
    this.ui.nodeLayer.draw()
    this.node = node

    // 2. create link
    this.linkOpts = {
      from: this.opts.from,
      to: {
        nodeId: this.node.id,
        inlet: 'inlet'
      }
    }
    functions.createLink(this.linkOpts, this)
    this.ui.stage.draw()
  }

  undo(){
    // 1. remove link
    functions.removeLink(this.linkOpts, this)

    // 2. remove node
    this.graph.removeNode(this.node.id)
    this.ui.removeNode(this.node.id)
    
    this.ui.stage.draw()
  }
}