import BaseCommand from "./BaseCommand";
import functions from "./functions";

export default class RemoveLinkCommand extends BaseCommand {
  execute() {
    const link = this.opts.link
    const from = link.from
    const to = link.to
    functions.removeLink({
      from:{ 
        nodeId: from.id,
        outlet: link.fromOutlet
      },
      to: { 
        nodeId: to.id,
        inlet: link.toInlet 
      },
      type: link.type
    }, this)
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