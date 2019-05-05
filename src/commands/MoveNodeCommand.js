import BaseCommand from "./BaseCommand";

export default class MoveNodeCommand extends BaseCommand{
  execute(){
    console.log('move node', this.opts.nodeId)
    const node = this.graph.getNode(this.opts.nodeId)
    this.oldPos = node.pos
    console.log(`move from`,this.oldPos,` to `,this.opts.pos)
    node.pos = this.opts.pos
    this.node = node
    //this.ui.getNode(this.node.id).group.position(this.node.pos)
    this.ui.getNode(this.node.id).move(this.node.pos)
    this.ui.stage.draw()
  }

  undo(){
    this.node.pos = this.oldPos
    //this.ui.getNode(this.node.id).group.position(this.node.pos)
    this.ui.getNode(this.node.id).move(this.node.pos)
    
    this.ui.stage.draw()
  }
}