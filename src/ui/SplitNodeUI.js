import Konva from 'konva'
import OutletUI from './OutletUI'
import InletUI from './InletUI'
import BaseNodeUI from './BaseNodeUI';

export default class SplitNodeUI extends BaseNodeUI {
  constructor(opts){
    super()
    this.stage = opts.stage
    this.layer = opts.layer
    this.pos = opts.pos
    this.automotronNode = opts.automotronNode
    this.value = opts.value
    this.hasOutlet = {
      top: false,
      bottom: false,
      left: true,
      right: true
    }
    this.defaultStroke = '#3f51b5'
    this.build()
  }

  build(){
    BaseNodeUI.prototype.build.call(this)

    this.rect = new Konva.Rect({
      x: 6,
      y: 0,
      width: 50,
      height: 120,
      fill: '#3f51b5'
    })

    this.pcRect = new Konva.Rect({
      x: 6,
      y: 0,
      width: 50,
      height: this.getPcHeight(),
      fill: '#002984'
    })

    this.group.add(this.rect)
    this.group.add(this.pcRect)

    this.inlet = new InletUI(this, 'left')

    this.outletA = new OutletUI(this, 'right', {
      offset:{
        x: 0,
        y: -25
      }
    })
    this.outletA.on('connect', uiNode => {
      this.emit('connect', {uiNode, outlet:'split-a', inlet: 'inlet'})
    })

    this.outletB = new OutletUI(this, 'right', {
      offset:{
        x: 0,
        y: 25
      }
    })
    this.outletB.on('connect', uiNode => {
      this.emit('connect', {uiNode, outlet:'split-b', inlet:'inlet'})
    })
    
  }

  getPcHeight(){
    return 120 - this.value * 1.2;
  }

  setValue(value){
    this.value = parseInt(value, 10);
    this.pcRect.height(this.getPcHeight())
    this.emit('move');
  }

  getInlet(){
    return this.inlet
  }
  getOutlet(outlet){
    switch(outlet){
      case 'split-a':
        return this.outletA;
      case 'split-b':
        return this.outletB
    }
  }

}