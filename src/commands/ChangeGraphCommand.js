import BaseCommand from "./BaseCommand";

export default class ChangeGraphCommand extends BaseCommand{
  execute(){
    const node = this.opts.node//this.rootGraph.getNodeAtPath(this.opts.nodePath)
    console.log('change to', node)
    this.changeGraph(node.graph || node)
    this.ui.stage.draw()
  }

  changeGraph(graph){
    this.ui.destroyGraph()
    this.ui.graph = graph
    this.ui.buildGraph(graph)
  }

  undo(){
    
    this.ui.stage.draw()
  }
}


