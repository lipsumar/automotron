import CreateContainerCommand from "./CreateContainerCommand";
import {EventEmitter} from 'events'
import MoveNodeCommand from "./MoveNodeCommand";
import CreateLinkCommand from "./CreateLinkCommand";
import RemoveLinkCommand from "./RemoveLinkCommand";
import SetNodeValueCommand from "./SetNodeValueCommand";
import CreateNodeCommand from "./CreateNodeCommand";


const commandMap = {
  createContainer: CreateContainerCommand,
  move: MoveNodeCommand,
  createLink: CreateLinkCommand,
  removeLink: RemoveLinkCommand,
  setNodeValue: SetNodeValueCommand,
  createNode: CreateNodeCommand
}

export default class UndoManager extends EventEmitter{
  constructor(graph, ui){
    super()
    this.undoStack = []
    this.redoStack = []
    this.graph = graph
    this.ui = ui
  }

  execute(key, opts){
    console.log(key, opts)
    if(!commandMap[key]){
      throw new Error(`Unsupported command: "${key}"`)
    }

    const command = new commandMap[key](this.graph, this.ui, opts)
    command.execute()
    this.redoStack = []
    this.undoStack.push(command)

    this.emit('action')
  }

  undo(){
    const command = this.undoStack.pop()
    command.undo()
    this.redoStack.push(command)
    this.emit('action')
  }

  redo(){
    const command = this.redoStack.pop()
    command.redo()
    this.undoStack.push(command)
    this.emit('action')
  }

  hasUndo(){
    return this.undoStack.length > 0
  }

  hasRedo(){
    return this.redoStack.length > 0
  }
}