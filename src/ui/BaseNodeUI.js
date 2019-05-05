import { EventEmitter } from 'events'
import Konva from 'konva'

export default class BaseNodeUI extends EventEmitter{

  build(){
    this.group = new Konva.Group({
      draggable: true,
      x: this.pos.x,
      y: this.pos.y
    });
    this.group._isAutomotronNode = true
    this.group._automotronNode = this

    this.group.on('dragmove', (e) => {
      if(e.target._id !== this.group._id) return
      this.pos = this.group.position()
      this.emit('move')
    })

    this.group.on('dragend', (e) => {
      if(e.target._id !== this.group._id) return
      this.emit('move-end')
    })
  }

  move(pos){
    this.pos = pos
    this.group.position(pos)
    this.emit('move')
  }
}