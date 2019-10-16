import BaseCommand from "./BaseCommand";
import functions from './functions'

export default class CreateLinkCommand extends BaseCommand {

  execute() {
    functions.createLink(this.opts, this)
    this.ui.stage.draw()
  }

  undo() {
    functions.removeLink(this.opts, this)
    this.ui.stage.draw()
  }

}