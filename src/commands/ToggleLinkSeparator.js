import BaseCommand from './BaseCommand'


export default class ToggleLinkSeparatorCommand extends BaseCommand {
  execute(){
    this.prevSeparator = this.opts.separator
    this.opts.link.setSeparator(this.opts.link.separator === '' ? ' ' : '')
    this.ui.stage.draw();
  }

  undo(){
    this.opts.link.setSeparator(this.prevSeparator)
    this.ui.stage.draw();
  }
}