import Konva from 'konva'
import {EventEmitter} from 'events'
import Outlet from './Outlet';



export default class GeneratorNode extends EventEmitter{
  constructor(opts){
    super()
    this.pos = opts.pos
    this.stage = opts.stage
    this.layer = opts.layer
    this.value = ''
    this.outletDragCurrentlyOnInlet = null
    this.automotronNode = opts.automotronNode
    this.hasOutlet = {
      bottom: true
    }
    this.build()
  }

  setValue(value){
    value = value.trim()
    this.value = value
    this.automotronNode.setValue(value)
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
  
    this.outlet = new Outlet(this, 'bottom', {toInlet:'generator'})
    this.outlet.on('connect', container => {
      this.emit('connect', {container, toInlet:'generator'})
    })

    this.group.add(this.rect)
    this.group.add(headerRect)
    this.group.add(headerText)
    this.group.add(this.text)
    
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
    this.outlet.reposition()
  }
}

