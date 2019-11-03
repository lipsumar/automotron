import Konva from 'konva'
import BaseLetUI from './BaseLetUI';

export default class InletUI{
  constructor(node, side, opts = {}){
    this.node = node
    this.side = side
    this.offset = opts.offset || {x: 0, y:0}
    this.color = opts.color || '#BBB'
    Object.assign(this, BaseLetUI)
    this.build()
  }

  build(){
    this.rect = new Konva.Rect({
      x: this.x(false),
      y: this.y(false),
      width: this.width(),
      height: this.height(),
      fill: this.color
    })

    this.node.group.add(this.rect)
  }
}
