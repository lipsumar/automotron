import BaseCommand from "./BaseCommand";

export default class SelectNodeCommand extends BaseCommand {
  constructor(graph, ui, opts){
    super(graph, ui, opts);
    this.addToStack = false;
  }
  execute(){
    if(this.opts.nodeId === null){
      // unselect
      this.ui.getNodes().filter(node => node.selected).forEach(node => {
        node.setSelected(false);
      })
    } else {
      // first, un-select all others selected
      if(!this.opts.shift){
        this.ui.getNodes().filter(node => node.selected).forEach(node => {
          node.setSelected(false);
        })
      }

      const uiNode = this.ui.getNode(this.opts.nodeId);
      uiNode.setSelected(!uiNode.selected);
    }
    
    this.ui.stage.draw();
  }

  undo(){
    // no undo as this command is not part of the undo stack
  }
}