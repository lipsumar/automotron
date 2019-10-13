import Konva from 'konva'
import OutletUI from './OutletUI'
import InletUI from './InletUI'
import BaseNodeUI from './BaseNodeUI';

const padding = 8
const outletWidth = 6
const generatorOutletHeight = 6

export default class LogicNodeUI extends BaseNodeUI {
  constructor(opts){
    super()
    this.stage = opts.stage
    this.layer = opts.layer
    this.pos = opts.pos
    //this.automotronNode = opts.automotronNode
    this.value = opts.value
    this.hasOutlet = {
      top: false,
      bottom: false,
      left: true,
      right: true
    }
    this.defaultStroke = this.stroke;
    this.build()
  }

  build(){
    BaseNodeUI.prototype.build.call(this)

    this.text = new Konva.Text({
      x: outletWidth + padding,
      y: generatorOutletHeight + padding,
      text: this.value,
      width: 500 - padding * 2,
      fontSize: 20,
      fontFamily: 'SFMono-Regular,Consolas,Liberation Mono,Menlo,monospace',
      fill: '#7cabc5',
      lineHeight: 1.4
    });


    this.rect = new Konva.Rect({
      x: outletWidth,
      y: generatorOutletHeight,
      width: Math.max(30, this.text.getTextWidth()) + padding * 2,
      height: this.text.height() + padding * 2,
      fill: '#1e1e1e',
      stroke: this.stroke,
      strokeWidth: 2
    });

    this.group.add(this.rect)
    this.group.add(this.text)

    this.inlet = new InletUI(this, 'left', {
      offset:{
        x: 0,
        y: 5
      }
    })

    this.outlet = new OutletUI(this, 'right', {
      offset:{
        x: 0,
        y: 5
      }
    })
    this.outlet.on('connect', uiNode => {
      this.emit('connect', {uiNode, outlet:'outlet', inlet: 'inlet'})
    })
  }

  setValue(value){
    this.value = value
    this.resize()
  }

  getInlet(){
    return this.inlet
  }
  getOutlet(){
    return this.outlet;
  }

  resize() {
    this.text.width(999)

    this.text.text(this.value)
    const measuredWidth = this.text.getTextWidth()
    this.text.width(Math.min(measuredWidth, 500))

    this.rect.width(Math.max(30, this.text.getTextWidth()) + padding * 2)
    this.rect.height(this.text.height() + padding * 2)
  

    this.group.width(this.rect.width())
    this.group.height(this.rect.height())


    this.inlet.reposition()
    this.outlet.reposition()

    this.emit('move')
  }

}