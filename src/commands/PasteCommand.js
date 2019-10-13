import BaseCommand from './BaseCommand'
import clonedeep from 'lodash.clonedeep'
import functions from './functions';


export default class PasteCommand extends BaseCommand {
  execute(){
    const data = this.prepareData(this.opts.data)
    this.pastedGraph = data
    functions.addNodesAndLinks(data, this)
    this.addedNodes = data.nodes
    this.ui.stage.draw()
  }

  undo(){
    functions.removeNodes(this.addedNodes, this)
    this.ui.stage.draw()
  }

  prepareData(data){
    // modify ids to avoid collision with existing ids
    if(!this.idMap){
      this.idMap = {}
      this.nodes = data.nodes.map(node => {
        node = clonedeep(node)
        if(this.graph.getNode(node.id)){
          const newId = this.graph.getNewNodeId()
          this.idMap[node.id] = newId
        }
        return node
      })
    }
    
    this.nodes.forEach(node => {
      if(this.idMap[node.id]){
        node.id = this.idMap[node.id]
      }
    })
    const links = data.links.map(link => {
      link = clonedeep(link)
      if(typeof this.idMap[link.from.nodeId] !== 'undefined'){
        link.from.nodeId = this.idMap[link.from.nodeId]
      }
      if(typeof this.idMap[link.to.nodeId] !== 'undefined'){
        link.to.nodeId = this.idMap[link.to.nodeId]
      }
      return link
    })

    // update pos
    let topLeftNode = this.nodes[0];
    this.nodes.forEach(node => {
      if(node.pos.x < topLeftNode.pos.x && node.pos.y < topLeftNode.pos.y){
        topLeftNode = node
      }
    })

    if(!this.atPoint){
      const transform = this.ui.stage.getAbsoluteTransform().copy()
      transform.invert()
      const point = transform.point(this.ui.stage.getPointerPosition())
      this.atPoint = point
    }

    
    const delta = {
      x: this.atPoint.x - topLeftNode.pos.x,
      y: this.atPoint.y - topLeftNode.pos.y
    }

    this.nodes.forEach(node => {
      node.pos = {
        x: node.pos.x + delta.x,
        y: node.pos.y + delta.y
      }
    })
    
    return { nodes: this.nodes, links }
  }
}