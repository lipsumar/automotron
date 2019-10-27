import { EventEmitter } from 'events'
import Konva from 'konva'

export default class BaseNodeUI extends EventEmitter{

  build(){
    this.selected = false;
    this.group = new Konva.Group({
      draggable: true,
      x: this.pos.x,
      y: this.pos.y
    });
    this.group._isAutomotronNode = true
    this.group._automotronNode = this

    this.group.on('dragstart', e => {
      if(e.target._id !== this.group._id) return
      this.dragStartedAt = this.group.position()
      this.emit('move-start');
    })

    this.group.on('dragmove', (e) => {
      if(e.target._id !== this.group._id) return
      this.pos = this.group.position()
      this.emit('move', true) // true == user is moving this node
    })

    this.group.on('dragend', (e) => {
      if(e.target._id !== this.group._id) return
      this.emit('move-end')
    })

    this.group.on('click', (e) => {
      e.cancelBubble = true;
      this.emit('click', {shift: e.evt.shiftKey});
    })
  }

  setSelected(selected){
    this.selected = selected;
    if(this.selected){
      this.rect.stroke('#a7c4f7');
      this.rect.strokeWidth(4);
    }else {
      this.rect.stroke(this.defaultStroke)
      this.rect.strokeWidth(this.defaultStrokeWidth || 2);
    }
  }

  setError(err){
    if(err){
      this.rect.stroke('#f00');
      this.rect.strokeWidth(4);
    }else{
      this.rect.stroke(this.defaultStroke)
      this.rect.strokeWidth(this.defaultStrokeWidth || 2);
    }
  }

  move(pos){
    this.pos = pos
    this.group.position(pos)
    this.emit('move')
  }
}