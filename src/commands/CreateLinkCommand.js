import BaseCommand from "./BaseCommand";

export default class CreateLinkCommand extends BaseCommand {

  execute() {
    const { from, to } = this.getNodes()
    let link;
    if(this.opts.from.outlet === 'agreement'){
      link = this.graph.createAgreementLink(from, to)
    } else {
      link = this.graph.createLink(from, to, {
        fromOutlet: this.opts.from.outlet,
        toInlet: this.opts.to.inlet
      })
    }

    this.ui.createLink(link)
    this.link = link
    this.ui.stage.draw()
  }

  undo() {
    const { from, to } = this.getNodes()
    this.graph.removeLink(from, to)
    const linkUI = this.ui.getLink({ nodeId: from.id, outlet: this.opts.from.outlet }, { nodeId: to.id, inlet: this.opts.to.inlet })
    this.ui.removeLink(linkUI)
    this.ui.stage.draw()
  }

  getNodes() {
    return {
      from: this.graph.getNode(this.opts.from.nodeId),
      to: this.graph.getNode(this.opts.to.nodeId)
    }
  }
}