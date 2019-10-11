import Konva from 'konva'
import OutletUI from './OutletUI';
import BaseNodeUI from './BaseNodeUI';



export default class MacroNodeUI extends BaseNodeUI{
  constructor(opts){
    super()
    this.pos = opts.pos
    this.stage = opts.stage
    this.layer = opts.layer
    
    this.defaultStroke = '#6a0080';
    
    this.hasOutlet = {
      bottom: true,
      right: true
    }
    this.build()
  }

  

  build(){
    BaseNodeUI.prototype.build.call(this)

    this.rect = new Konva.Rect({
      x: 0,
      y: 0,
      width: 70,
      height: 40,
      fill: '#9c27b0',
      stroke: this.defaultStroke
    })

    this.text = new Konva.Text({
      x: 0,
      y: 12,
      width: 70,
      text: 'Macro',
      fontSize: 20,
      fill: '#fff',
      align:'center'
    })

    this.group.add(this.rect)
    this.group.add(this.text)


    this.outlet = new OutletUI(this, 'bottom', {toInlet:'generator'})
    this.outlet.on('connect', uiNode => {
      this.emit('connect', {uiNode, inlet:'generator', outlet: 'outlet'})
    })

    this.graphOutlet = new OutletUI(this, 'right', {toInlet:'inlet'})
    this.graphOutlet.on('connect', uiNode => {
      this.emit('connect', {uiNode, inlet:'inlet', outlet:'graph'})
    })
  }

  getOutlet(outlet){
    switch(outlet){
      case 'outlet': return this.outlet
      case 'graph': return this.graphOutlet
    }
    
  }
}