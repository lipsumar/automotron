import BaseCommand from './BaseCommand'
import clonedeep from 'lodash.clonedeep'

const methodMap = {
  container: 'createContainer',
  generator: 'createGenerator',
  operator: 'createOperator'
}

export default class PasteCommand extends BaseCommand {
  execute(){

    const data = this.prepareData(this.opts.data)
    this.pastedGraph = data

    this.graph.buildState(data)

    // links & nodes can not be passed directly to ui.buildGrah
    // we first need to get them from the graph
    const links = data.links.map(normalizedLink => {
      return this.graph.links.find(link => 
        link.from.id === normalizedLink.from.nodeId && 
        link.to.id === normalizedLink.to.nodeId && 
        link.fromOutlet == normalizedLink.from.outlet && 
        link.toInlet == normalizedLink.to.inlet
      )
    })
    const nodes = data.nodes.map(node => this.graph.getNode(node.id))

    this.ui.buildGraph({
      nodes,
      links
    })
    this.ui.stage.draw()
  }

  undo(){
    // this.graph.removeNode(this.node.id)
    // this.ui.removeNode(this.node.id)
    // this.ui.nodeLayer.draw()
  }

  prepareData(data){
    // modify ids to avoid collision with existing ids
    const idMap = {}
    const nodes = data.nodes.map(node => {
      node = clonedeep(node)
      if(this.graph.getNode(node.id)){
        const newId = this.graph.getNewNodeId()
        idMap[node.id] = newId
        node.id = newId
      }
      return node
    })
    const links = data.links.map(link => {
      link = clonedeep(link)
      if(typeof idMap[link.from.nodeId] !== 'undefined'){
        link.from.nodeId = idMap[link.from.nodeId]
      }
      if(typeof idMap[link.to.nodeId] !== 'undefined'){
        link.to.nodeId = idMap[link.to.nodeId]
      }
      return link
    })

    // update pos
    let topLeftNode = nodes[0];
    nodes.forEach(node => {
      if(node.pos.x < topLeftNode.pos.x && node.pos.y < topLeftNode.pos.y){
        topLeftNode = node
      }
    })
    const transform = this.ui.stage.getAbsoluteTransform().copy()
    transform.invert()
    const point = transform.point(this.ui.stage.getPointerPosition())
    
    const delta = {
      x: point.x - topLeftNode.pos.x,
      y: point.y - topLeftNode.pos.y
    }

    nodes.forEach(node => {
      node.pos = {
        x: node.pos.x + delta.x,
        y: node.pos.y + delta.y
      }
    })
    
    return { nodes, links }
  }
}