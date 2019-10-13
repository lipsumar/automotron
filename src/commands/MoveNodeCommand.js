import BaseCommand from "./BaseCommand";

export default class MoveNodeCommand extends BaseCommand{
  execute(){
    this.oldPos = []
    this.nodes = []
    this.opts.moves.forEach(move => {
      const node = this.graph.getNode(move.nodeId)
      this.oldPos.push(node.pos)
      node.pos = move.pos
      this.nodes.push(node)
      this.ui.getNode(node.id).move(node.pos)
    })
    this.ui.stage.draw()
  }

  undo(){
    this.nodes.forEach((node,i) => {
      node.pos = this.oldPos[i]
      this.ui.getNode(node.id).move(node.pos)
    }) 
    this.ui.stage.draw()
  }
}