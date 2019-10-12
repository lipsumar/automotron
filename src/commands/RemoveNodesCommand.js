import BaseCommand from "./BaseCommand";
import functions from './functions'

export default class RemoveNodesCommand extends BaseCommand {
  execute() {
    const nodes = this.opts.nodes.map(uiNode => uiNode.node)
    this.removedNodes = nodes
    this.removedLinks = functions.getLinksOfNodes(nodes, this.graph)
    functions.removeNodes(nodes, this)

    this.ui.stage.draw()
  }

  undo() {
    functions.addNodesAndLinks({
      nodes: this.removedNodes,
      links: this.removedLinks.map(link => link.normalize())
    }, this)

    this.ui.stage.draw()

  }
}