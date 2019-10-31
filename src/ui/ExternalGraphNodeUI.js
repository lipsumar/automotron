import Konva from 'konva'
import OutletUI from './OutletUI';
import BaseNodeUI from './BaseNodeUI';



export default class ExternalGraphNodeUI extends BaseNodeUI{
  constructor(opts){
    super()
    this.pos = opts.pos
    this.stage = opts.stage
    this.layer = opts.layer
    this.value = opts.value
    this.defaultStroke = '#6a0080';
    
    this.hasOutlet = {
      bottom: true
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
      x: 0,
      y: 0,
      width: 100,
      height: 40,
      fill: '#9c27b0',
      stroke: this.defaultStroke
    })

    this.text = new Konva.Text({
      x: 0,
      y: 12,
      width: 100,
      text: this.value || '<id>',
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

  }

  getOutlet(){
    return this.outlet
  }
}