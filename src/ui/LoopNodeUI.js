import Konva from 'konva'
import OutletUI from './OutletUI'
import InletUI from './InletUI'
import BaseNodeUI from './BaseNodeUI';

export default class LoopNodeUI extends BaseNodeUI {
  constructor(opts){
    super()
    this.stage = opts.stage
    this.layer = opts.layer
    this.pos = opts.pos
    this.value = opts.value
    this.automotronNode = opts.automotronNode
    this.hasOutlet = {
      top: false,
      bottom: true,
      left: true,
      right: true
    }
    this.build()
  }

  setValue(value){
    this.value = value
    this.text.text(this.value)
  }

  build(){
    BaseNodeUI.prototype.build.call(this)

    this.rect = new Konva.Rect({
      x: 6,
      y: 0,
      width: 50,
      height: 50,
      fill: '#3f51b5'
    })

    this.group.add(this.rect)

    this.text = new Konva.Text({
      x: 6,
      y: 16,
      text: this.value,
      fontSize: 20,
      fill: '#fff',
      width:50,
      align: 'center'
    })
    this.group.add(this.text)

    this.inlet = new InletUI(this, 'left')
    this.outlet = new OutletUI(this, 'right')
    this.thenOutlet = new OutletUI(this, 'bottom')

    this.outlet.on('connect', uiNode => {
      this.emit('connect', {uiNode, outlet:'outlet', inlet:'inlet'})
    })

    this.thenOutlet.on('connect', uiNode => {
      this.emit('connect', {uiNode, outlet:'then', inlet:'inlet'})
    })

  }

  getInlet(){
    return this.inlet
  }
  getOutlet(outlet){
    switch(outlet){
      case 'outlet':
        return this.outlet
      case 'then':
        return this.thenOutlet
    }
  }

}