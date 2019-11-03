import Konva from 'konva'
import OutletUI from './OutletUI';
import BaseNodeUI from './BaseNodeUI';

export default class NumberGeneratorNodeUI extends BaseNodeUI{
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
    this.value = opts.value;
    this.build()
    this.resize()
  }

  setValue(value){
    this.value = value
    if(this.value){
      this.text.text('Number ['+this.value+']')
    }else{
      this.text.text('Number Generator')
    }
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

    this.text = new Konva.Text({
      x: 4,
      y: 8,
      text: 'Number Generator',
      fontSize: 18,
      fill: '#fff',
      width: 150,
      align: 'center',
    })
  
    this.outlet = new OutletUI(this, 'bottom', {toInlet:'generator'})
    this.outlet.on('connect', uiNode => {
      this.emit('connect', {uiNode, inlet:'generator', outlet: 'outlet'})
    })


    this.group.add(this.rect)
    //this.group.add(headerRect)
    this.group.add(this.text)
    //this.group.add(this.text)
    
  }


  getOutlet(){
    return this.outlet
  }
  
  resize(){
    // this.text.text(this.value)
    // this.rect.height(25 + this.text.height())
    // this.outlet.reposition()
  }
}

