import Konva from 'konva'
import {EventEmitter} from 'events'

const padding = 10
const outletWidth = 6
const generatorOutletHeight = 6

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
    this.isGenerated = false
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
      y: generatorOutletHeight + padding,
      text: this.value,
      width: 500 - padding * 2,
      fontSize: 30,
      fontFamily: 'Avenir',
      fill: 'black'
    });
    

    this.rect = new Konva.Rect({
      x: outletWidth,
      y: generatorOutletHeight,
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
      y: generatorOutletHeight+ this.rect.height() / 2 - 5,
      width: outletWidth,
      height: 10,
      fill: '#999'
    })
    this.group.add(this.outlet)


    this.outletHandle = new Konva.Rect({
      x: outletWidth + this.rect.width(),
      y: generatorOutletHeight+this.rect.height() / 2 - 5,
      width: outletWidth,
      height: 10,
      fill: 'transparent',
      draggable: true
    })
    this.group.add(this.outletHandle)

    this.outletHandle.on('dragstart', () => {
      this.outletLine = new Konva.Line({
        points: [
          this.group.x() + outletWidth + this.group.width(), this.group.y()+generatorOutletHeight + this.group.height() / 2,
          this.group.x() + outletWidth + this.group.width(), this.group.y()+generatorOutletHeight + this.group.height() / 2
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
        y: this.group.y() +generatorOutletHeight+ this.group.height() / 2
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
      this.layer.children
        .filter(c => c._isAutomotronNode && c._id!==this.group._id && c._automotronNode instanceof ContainerNode)
        .forEach(g => {
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
      this.outletHandle.y(generatorOutletHeight+this.rect.height() / 2 - 5)
      this.group.getParent().draw()

      if(this.outletDragCurrentlyOnInlet){
        this.emit('connect', this.outletDragCurrentlyOnInlet)
      }
      this.outletLine.destroy()
      this.layer.draw()
    })


    this.inlet = new Konva.Rect({
      x: 0,
      y: generatorOutletHeight+this.rect.height() / 2 - 5,
      width: outletWidth,
      height: 10,
      fill: '#999'
    })
    this.inlet._isAutomotronInlet = true
    this.group.add(this.inlet)


    this.generatorInlet = new Konva.Rect({
      x: this.rect.width() / 2 - 5,
      y: 0,
      width: 10,
      height: 6,
      fill: '#9c27b0'
    })
    this.group.add(this.generatorInlet)

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
      y: generatorOutletHeight+this.group.y() + this.group.height() / 2
    }
  }

  getInletAttachPos(inlet = 'inlet'){
    if(inlet=== 'inlet'){
      return {
        x: this.group.x(),
        y: generatorOutletHeight+this.group.y() + this.group.height() / 2
      }
    } else if (inlet === 'generator'){
      return {
        x: outletWidth+this.group.x() + this.rect.width()/2,
        y: this.group.y()
      }
    }
    
  }

  addLink(link){
    this.outletLinks.push(link)
  }

  setIsGenerated(gen){
    this.isGenerated = gen
    this.value = null
    this.resize()
  }

  resize(){

    if(this.isGenerated){
      this.text.text('')
      this.text.width(200)
      this.rect.width(200)
    }else{
      this.text.width(999)

      this.text.text(this.value)
      const measuredWidth = this.text.getTextWidth()
      this.text.width(Math.min(measuredWidth, 500))
  
      this.rect.width(Math.max(30, this.text.getTextWidth()) + padding * 2)
      this.rect.height(this.text.height() + padding * 2)
    }


    this.group.width(this.rect.width())
    this.group.height(this.rect.height())

    this.outlet.x(outletWidth + this.rect.width())
    this.outlet.y(generatorOutletHeight+this.rect.height() / 2 - 5)
    this.outletHandle.x(outletWidth + this.rect.width())
    this.outletHandle.y(generatorOutletHeight+this.rect.height() / 2 - 5)
    this.generatorInlet.x(outletWidth + this.rect.width()/2-5)
    this.generatorInlet.y(0)
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