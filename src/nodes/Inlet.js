import Konva from 'konva'
import BaseLet from './BaseLet';

export default class Inlet{
  constructor(node, side, opts = {}){
    this.node = node
    this.side = side
    this.offset = opts.offset || {x: 0, y:0}
    Object.assign(this, BaseLet)
    this.build()
  }

  build(){
    this.rect = new Konva.Rect({
      x: this.x(),
      y: this.y(),
      width: this.width(),
      height: this.height(),
      fill: '#BBB'
    })

    this.node.group.add(this.rect)
  }
}
