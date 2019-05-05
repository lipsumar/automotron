import BaseCommand from "./BaseCommand";

export default class SetNodeValueCommand extends BaseCommand {
  execute(){
    this.previousValue = this.ui.getNode(this.opts.nodeId).value
    this.setValue(this.opts.value)
  }

  undo(){
    this.setValue(this.previousValue)
  }

  setValue(value){
    this.graph.getNode(this.opts.nodeId).setValue(value)
    this.ui.getNode(this.opts.nodeId).setValue(value)
    this.ui.stage.draw()
  }
}