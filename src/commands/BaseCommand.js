import { EventEmitter } from "events";

export default class BaseCommand extends EventEmitter{
  constructor(graph, ui, opts){
    super()
    this.graph = graph
    this.ui = ui
    this.opts = opts
  }

  redo(){
    this.execute()
  }
}