import Konva from 'konva'
import OutletUI from './OutletUI'
import InletUI from './InletUI'
import BaseNodeUI from './BaseNodeUI';

const padding = 10
const outletWidth = 6
const generatorOutletHeight = 6

export default class MetaNodeUI extends BaseNodeUI {
  constructor(opts) {
    super()
    this.stage = opts.stage
    this.layer = opts.layer
    this.value = opts.value
    this.pos = opts.pos
    this.outletLinks = []
    
    //this.nodeId = opts.nodeId
    
    this.hasOutlet = {
      top: false,
      bottom: false,
      left: true,
      right: true
    }
    this.stroke = opts.stroke || '#000'
    this.defaultStroke = this.stroke;
    this.build()

  }

  build() {
    BaseNodeUI.prototype.build.call(this)

    this.text = new Konva.Text({
      x: outletWidth + padding,
      y: generatorOutletHeight + padding,
      text: this.value,
      width: 500 - padding * 2,
      fontSize: 30,
      fontFamily: 'Avenir',
      fill: 'black'
    });


    this.rect = new Konva.Rect({
      x: outletWidth,
      y: generatorOutletHeight,
      width: Math.max(30, this.text.getTextWidth()) + padding * 2,
      height: this.text.height() + padding * 2,
      fill: 'rgba(255, 255, 255, 0.8)',
      stroke: this.stroke,
      strokeWidth: 3
    });

    this.group.add(this.rect)
    this.group.add(this.text)

    this.group.on('dblclick', e => {
      e.cancelBubble = true;
      console.log('>>>>>>>>>>>>>>> META!! <<<<<<<<<<<<<')
      this.emit('enter')
    })

    this.outlet = new OutletUI(this, 'right')
    this.outlet.on('connect', uiNode => {
      this.emit('connect', {uiNode, inlet: 'inlet', outlet: 'outlet'})
    })


    this.inlet = new InletUI(this, 'left')

    this.resize()
  }

  setValue(value) {
    this.value = value
    //this.automotronNode.setValue(value)
    this.resize()
  }

  getOutletAttachPos() {
    return {
      x: this.outlet.absX(),
      y: this.outlet.absY() 
    }
  }

  getInletAttachPos() {
    return {
      x: this.inlet.absX(),
      y: this.inlet.absY() 
    }
  }

  getInlet(){
    return this.inlet
  }

  getOutlet(){
    return this.outlet
  }

  addLink(link) {
    this.outletLinks.push(link)
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

