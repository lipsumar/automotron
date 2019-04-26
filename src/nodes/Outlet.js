import Konva from 'konva'
import {EventEmitter} from 'events'
import ContainerNode from './ContainerNode'
import BaseLet from './BaseLet';
import SplitNode from './SplitNode';


export default class Outlet extends EventEmitter{
  constructor(node, side, opts = {}){
    super()
    this.node = node
    this.side = side
    this.outletLine = null
    this.outletDragCurrentlyOnInlet
    this.offset = opts.offset || {x: 0, y:0}
    this.toInlet = opts.toInlet || 'inlet'
    this.bendy = opts.bendy || false
    Object.assign(this, BaseLet)
    this.build()
    
  }

  build(){
    this.rect = new Konva.Rect({
      x: this.x(false),
      y: this.y(false),
      width: this.width(),
      height: this.height(),
      fill: '#999'
    })

    this.rectHandle = new Konva.Rect({
      x: this.x(false),
      y: this.y(false),
      width: this.width(),
      height: this.height(),
      fill: 'transparent',
      draggable: true
    })

    this.rectHandle.on('dragstart', () => {
      this.outletLine = new Konva.Line({
        points: [
          this.absX(), this.absY(),
          this.absX(), this.absY()
        ],
        stroke: 'black',
        tension: 0.6
      })
      this.node.layer.add(this.outletLine)
    })

    this.rectHandle.on('dragmove', () => {
      const transform = this.node.stage.getAbsoluteTransform().copy()
      transform.invert()
      const to = transform.point(this.node.stage.getPointerPosition())

      const ori = {
        x: this.absX(),
        y: this.absY()
      }

      const points = [ori.x, ori.y,]
      if(this.bendy){
        points.push((ori.x+to.x)/2, ((ori.y+to.y)/2)+18)
      }
      points.push(to.x, to.y)
      
      this.outletLine.points(points)



      // test for collision with a target
      const movingRect = {
        x: to.x,
        y: to.y,
        width: this.width(),
        height: this.height()
      }
      let onContainer = null
      this.node.layer.children
        .filter(c => c._isAutomotronNode && c._id !== this.node.group._id && (c._automotronNode instanceof ContainerNode || c._automotronNode instanceof SplitNode))
        .forEach(g => {
          const container = g._automotronNode
          const inlet = container.getInlet(this.toInlet)
          const targetRect = {
            x: inlet.absX(),
            y: inlet.absY(),
            width: inlet.width(),
            height: inlet.height()
          }

          if (haveIntersection(movingRect, targetRect)) {
            inlet.rect.fill('green')
            onContainer = container
          } else {
            inlet.rect.fill('#999')
          }
          inlet.rect.draw()
        })

      this.outletDragCurrentlyOnInlet = onContainer
    })

    this.rectHandle.on('dragend', () => {
      this.rectHandle.x(this.x())
      this.rectHandle.y(this.y())
      
      if(this.outletDragCurrentlyOnInlet){
        this.emit('connect', this.outletDragCurrentlyOnInlet)
      }

      this.outletLine.destroy()
      this.node.layer.draw()
    })

    this.node.group.add(this.rect)
    this.node.group.add(this.rectHandle)
  }

}


function haveIntersection(r1, r2) {
  return !(
    r2.x > r1.x + r1.width ||
    r2.x + r2.width < r1.x ||
    r2.y > r1.y + r1.height ||
    r2.y + r2.height < r1.y
  );
}