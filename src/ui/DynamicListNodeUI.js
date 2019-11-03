import Konva from 'konva'
import OutletUI from './OutletUI';
import BaseNodeUI from './BaseNodeUI';



export default class DynamicListNodeUI extends BaseNodeUI{
  constructor(opts){
    super()
    this.pos = opts.pos
    this.stage = opts.stage
    this.layer = opts.layer
    this.hasOutlet = {
      top: true,
      bottom: true,
    }
    this.defaultStroke = '#6a0080';
    this.build()
    this.resize()
  }

  build(){
    BaseNodeUI.prototype.build.call(this)

    this.rect = new Konva.Rect({
      x: 0,
      y: 6,
      width: 150,
      height: 40,
      fill: '#9c27b0',
      stroke: this.defaultStroke
    })

    // this.text = new Konva.Text({
    //   x: 4,
    //   y: 25,
    //   width: 200,
    //   text: this.value,
    //   fontSize: 18
    // })

    // const headerRect = new Konva.Rect({
    //   x: 0,
    //   y: 0,
    //   width: 200,
    //   height: 35,
    //   fill: '#9c27b0'
    // })
    const headerText = new Konva.Text({
      x: 4,
      y: 18,
      text: 'Dynamic List',
      fontSize: 18,
      fill: '#fff',
      width: 150,
      align: 'center',
    })
  
    this.outlet = new OutletUI(this, 'bottom', {toInlet:'generator'})
    this.outlet.on('connect', uiNode => {
      this.emit('connect', {uiNode, inlet:'generator', outlet: 'outlet'})
    })

    this.ingressOutlet = new OutletUI(this, 'top', {toInlet: 'self'})
    this.ingressOutlet.on('connect', uiNode => {
      this.emit('connect', {uiNode, inlet:'self', outlet:'ingress'})
    })


    this.group.add(this.rect)
    //this.group.add(headerRect)
    this.group.add(headerText)
    //this.group.add(this.text)
    
  }

  getOutletAttachPos(outlet = 'outlet'){
    switch(outlet){
      case 'outlet':
        return {
          x: this.group.x() + this.rect.width() / 2,
          y: this.group.y() + this.rect.height()
        }
      case 'ingress':
        return {
          x: this.group.x() + this.rect.width() / 2,
          y: this.group.y() 
        }
    }
    
  }

  getOutlet(outlet = 'outlet'){
    switch(outlet){
      case 'outlet':
        return this.outlet
      case 'ingress':
        return this.ingressOutlet
    }
  }
  
  resize(){
    // this.text.text(this.value)
    // this.rect.height(25 + this.text.height())
    // this.outlet.reposition()
  }
}

