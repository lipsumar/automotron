import BaseCommand from "./BaseCommand";

export default class RemoveLinkCommand extends BaseCommand {
  execute() {
    const link = this.opts.link
    const from = link.from
    const to = link.to
    this.graph.removeLink(from, to)
    const uiLink = this.ui.getLink({ nodeId: from.id, outlet: link.fromOutlet }, { nodeId: to.id, inlet: link.toInlet })
    this.ui.removeLink(uiLink)
    this.ui.stage.draw()
  }

  undo() {
    const from = this.opts.link.from
    const to = this.opts.link.to

    let link;
    if(this.opts.link.fromOutlet === 'agreement'){
      link = this.graph.createAgreementLink(from, to)
    } else {
      link = link = this.graph.createLink(from, to, {
        fromOutlet: this.opts.link.fromOutlet,
        toInlet: this.opts.link.toInlet
      })
    }


    this.ui.createLink(link)
    this.ui.stage.draw()

    this.opts.link = link
  }
}