import Konva from 'konva'
import OutletUI from './OutletUI';
import BaseNodeUI from './BaseNodeUI';



export default class ProxyNodeUI extends BaseNodeUI{
  constructor(opts){
    super()
    this.pos = opts.pos
    this.stage = opts.stage
    this.layer = opts.layer
    
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
      stroke: '#6a0080'
    })

    this.text = new Konva.Text({
      x: 0,
      y: 12,
      width: 70,
      text: 'Proxy',
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

    this.containerOutlet = new OutletUI(this, 'right', {toInlet:'inlet'})
    this.containerOutlet.on('connect', uiNode => {
      this.emit('connect', {uiNode, inlet:'inlet', outlet:'container'})
    })
  }

  getOutlet(outlet){
    switch(outlet){
      case 'outlet': return this.outlet
      case 'container': return this.containerOutlet
    }
    
  }
}