import BaseCommand from "./BaseCommand";

export default class SetNodeSettingsCommand extends BaseCommand {
  execute(){
    this.previousSettings = {...this.graph.getNode(this.opts.nodeId).settings}
    this.setSettings(this.opts.settings)
  }

  undo(){
    this.setSettings(this.previousSettings)
  }

  setSettings(settings){
    this.graph.getNode(this.opts.nodeId).setSettings(settings)
    this.ui.stage.draw()
  }
}