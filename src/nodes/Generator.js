import Konva from 'konva'
import ContainerNode from './Container';
import {EventEmitter} from 'events'

const outletHeight = 5

export default class Generator extends EventEmitter{
  constructor(opts){
    super()
    this.pos = opts.pos
    this.stage = opts.stage
    this.layer = opts.layer
    this.value = ''
    this.outletDragCurrentlyOnInlet = null
    this.automotronNode = opts.automotronNode
    this.build()
  }

  setValue(value){
    value = value.trim()
    this.value = value
    this.automotronNode.setValue(value.split('\n'))
    this.resize()
  }

  build(){
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

    this.rect = new Konva.Rect({
      x: 0,
      y: 0,
      width: 200,
      height: 60,
      fill: '#d05ce3',
      stroke: '#6a0080'
    })

    this.text = new Konva.Text({
      x: 4,
      y: 25,
      width: 200,
      text: this.value,
      fontSize: 18
    })

    const headerRect = new Konva.Rect({
      x: 0,
      y: 0,
      width: 200,
      height: 25,
      fill: '#9c27b0'
    })
    const headerText = new Konva.Text({
      x: 4,
      y: 4,
      text: 'List',
      fontSize: 18,
      fill: '#fff'
    })
  
    this.outlet = new Konva.Rect({
      x: this.rect.width() / 2 - 5,
      y: this.rect.height()+1,
      fill: '#9c27b0',
      width: 10,
      height: outletHeight
    })
    this.outletHandle = new Konva.Rect({
      x: this.rect.width() / 2 - 5,
      y: this.rect.height()+1,
      fill: 'transparent',
      width: 10,
      height: outletHeight,
      draggable: true
    })

    this.outletHandle.on('dragstart', () => {
      this.outletLine = new Konva.Line({
        points: [
          this.group.x() + this.group.width()/2-5, this.group.y() + this.group.height(),
          this.group.x() + this.group.width()/2-5, this.group.y() + this.group.height(),
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
        x: this.group.x() + (this.rect.width()/2),
        y: this.group.y() + this.rect.height(),
      }
      
      this.outletLine.points([
        ori.x, ori.y,
        to.x, to.y
      ])


      // test for collision with a target
      const movingRect = {
        x: to.x,
        y: to.y,
        width: 10,
        height: outletHeight
      }
      let onContainer = null
      this.layer.children
        .filter(c => c._isAutomotronNode && c._id!==this.group._id && c._automotronNode instanceof ContainerNode)
        .forEach(g => {
          const container = g._automotronNode
          const inlet = container.generatorInlet
          const targetRect = {
            x: g.x() + g.width() /2,
            y: g.y(),
            width: 10,
            height: 6
          }

          if(haveIntersection(movingRect, targetRect)){
            inlet.fill('green')
            onContainer = container
          } else {
            inlet.fill('#9c27b0')
          }
          inlet.draw()
        })

      this.outletDragCurrentlyOnInlet = onContainer
    })

    this.outletHandle.on('dragend', () => {
      this.outletHandle.x(this.rect.width()/2 - 5)
      this.outletHandle.y(this.rect.height())
      this.layer.draw()

      if(this.outletDragCurrentlyOnInlet){
        this.emit('connect', this.outletDragCurrentlyOnInlet)
      }
      this.outletLine.destroy()
      this.layer.draw()
    })

    this.group.add(this.rect)
    this.group.add(headerRect)
    this.group.add(headerText)
    this.group.add(this.text)
    this.group.add(this.outlet)
    this.group.add(this.outletHandle)
  }

  addLink(){

  }

  getOutletAttachPos(){
    return {
      x: this.group.x() + this.rect.width() / 2,
      y: this.group.y() + this.rect.height()
    }
  }

  resize(){
    this.text.text(this.value)
    this.rect.height(25 + this.text.height())
    this.outlet.x(this.rect.width() / 2 - 5)
    this.outlet.y(this.rect.height()+1)
    this.outletHandle.x(this.rect.width() / 2 - 5)
    this.outletHandle.y(this.rect.height()+1)
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