import Konva from 'konva'
import {EventEmitter} from 'events'

const padding = 10
const outletWidth = 6

export default class ContainerNode extends EventEmitter {
  constructor(opts) {
    super()
    this.stage = opts.stage
    this.layer = opts.layer
    this.value = opts.value
    this.pos = opts.pos
    this.outletDragCurrentlyOnInlet = null
    this.outletLinks = []
    this.automotronNode = opts.automotronNode
    this.build()
    
  }

  build() {
    this.group = new Konva.Group({
      draggable: true,
      x: this.pos.x,
      y: this.pos.y
    });
    this.group._isAutomotronNode = true
    this.group._automotronNode = this

    this.group.on('dragmove', () => {
      this.emit('move')
    })

    this.text = new Konva.Text({
      x: outletWidth + padding,
      y: padding,
      text: this.value,
      width: 500 - padding * 2,
      fontSize: 30,
      fontFamily: 'Avenir',
      fill: 'black'
    });
    

    this.rect = new Konva.Rect({
      x: outletWidth,
      y: 0,
      width: Math.max(30, this.text.getTextWidth()) + padding * 2,
      height: this.text.height() + padding * 2,
      fill: 'white',
      stroke: '#999',
      strokeWidth: 2
    });
    
    this.group.add(this.rect)
    this.group.add(this.text)

    this.outlet = new Konva.Rect({
      x: outletWidth + this.rect.width(),
      y: this.rect.height() / 2 - 5,
      width: outletWidth,
      height: 10,
      fill: '#999'
    })
    this.group.add(this.outlet)


    this.outletHandle = new Konva.Rect({
      x: outletWidth + this.rect.width(),
      y: this.rect.height() / 2 - 5,
      width: outletWidth,
      height: 10,
      fill: 'transparent',
      draggable: true
    })
    this.group.add(this.outletHandle)

    this.outletHandle.on('dragstart', () => {
      this.outletLine = new Konva.Line({
        points: [
          this.group.x() + outletWidth + this.group.width(), this.group.y() + this.group.height() / 2,
          this.group.x() + outletWidth + this.group.width(), this.group.y() + this.group.height() / 2
        ],
        stroke: 'black'
      })
      this.layer.add(this.outletLine)
    })

    this.outletHandle.on('dragmove', () => {
      const transform = this.stage.getAbsoluteTransform().copy()
      transform.invert()
      const to = transform.point(this.stage.getPointerPosition())

      const ori = {
        x: this.group.x() + outletWidth + this.group.width(),
        y: this.group.y() + this.group.height() / 2
      }
      
      this.outletLine.points([
        ori.x, ori.y,
        to.x, to.y
      ])

      // test for collision with a target
      const movingRect = {
        x: to.x,
        y: to.y,
        width: outletWidth,
        height: 10
      }
      let onContainer = null
      this.layer.children.filter(c => c._isAutomotronNode && c._id!==this.group._id).forEach(g => {
        const container = g._automotronNode
        const inlet = container.inlet
        const targetRect = {
          x: g.x(),
          y: g.y() + g.height() / 2,
          width: outletWidth,
          height: 10
        }

        if(haveIntersection(movingRect, targetRect)){
          inlet.fill('green')
          onContainer = container
        } else {
          inlet.fill('#999')
        }
        inlet.draw()
      })

      this.outletDragCurrentlyOnInlet = onContainer
      
    })

    this.outletHandle.on('dragend', () => {
      this.outletHandle.x(outletWidth + this.rect.width())
      this.outletHandle.y(this.rect.height() / 2 - 5)
      this.group.getParent().draw()

      if(this.outletDragCurrentlyOnInlet){
        this.emit('connect', this.outletDragCurrentlyOnInlet)
      }
      this.outletLine.destroy()
      this.layer.draw()
    })


    this.inlet = new Konva.Rect({
      x: 0,
      y: this.rect.height() / 2 - 5,
      width: outletWidth,
      height: 10,
      fill: '#999'
    })
    this.inlet._isAutomotronInlet = true
    this.group.add(this.inlet)


    this.resize()
  }

  setValue(value) {
    this.value = value
    this.automotronNode.setValue(value)
    this.resize()
  }

  getOutletAttachPos(){
    return {
      x: outletWidth + this.group.x() + this.group.width(),
      y: this.group.y() + this.group.height() / 2
    }
  }

  getInletAttachPos(){
    return {
      x: this.group.x(),
      y: this.group.y() + this.group.height() / 2
    }
  }

  addLink(link){
    this.outletLinks.push(link)
  }

  resize(){
    this.text.width(999)

    this.text.text(this.value)
    const measuredWidth = this.text.getTextWidth()
    this.text.width(Math.min(measuredWidth, 500))


    this.rect.width(Math.max(30, this.text.getTextWidth()) + padding * 2)
    this.rect.height(this.text.height() + padding * 2)
    const w = this.rect.width()
    this.group.width(w)
    this.group.height(this.rect.height())

    this.outlet.x(outletWidth + this.rect.width())
    this.outlet.y(this.rect.height() / 2 - 5)
    this.outletHandle.x(outletWidth + this.rect.width())
    this.outletHandle.y(this.rect.height() / 2 - 5)
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