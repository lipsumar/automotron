import Konva from 'konva'
import OutletUI from './OutletUI'
import InletUI from './InletUI'
import BaseNodeUI from './BaseNodeUI';

const padding = 10
const outletWidth = 6
const generatorOutletHeight = 6

export default class TemplateContainerNodeUI extends BaseNodeUI {
  constructor(opts) {
    super()
    this.stage = opts.stage
    this.layer = opts.layer
    this.value = opts.value
    this.pos = opts.pos
    this.outletLinks = []
    this.nodeId = opts.nodeId
    this.hasOutlet = {
      top: false,
      bottom: false,
      left: true,
      right: true
    }
    this.stroke = opts.stroke || '#999'
    this.defaultStroke = this.stroke;
    this.build()

  }

  build() {
    BaseNodeUI.prototype.build.call(this)

    this.text = new Konva.Text({
      x: outletWidth + padding,
      y: generatorOutletHeight + padding,
      text: this.value,
      width: 1000 - padding * 2,
      fontSize: 30,
      fontFamily: 'Avenir',
      fill: 'black',
    });


    this.rect = new Konva.Rect({
      x: outletWidth,
      y: generatorOutletHeight,
      width: Math.max(30, this.text.getTextWidth()) + padding * 2,
      height: Math.max(this.text.height() + padding * 2, 200),
      fill: 'rgba(255, 255, 255, 0.8)',
      stroke: this.stroke,
      strokeWidth: 2,
      dashEnabled: true,
      dash: [4, 4]
    });

    this.group.add(this.rect)
    this.group.add(this.text)


    this.outlet = new OutletUI(this, 'right')
    this.outlet.on('connect', uiNode => {
      this.emit('connect', {uiNode, inlet: 'inlet', outlet: 'outlet'})
    })
    this.outlet.on('dropped', to => {
      this.emit('createContainer', to)
    })

    this.outletLabels = new OutletUI(this, 'right', {
      offset: {
        x: 0,
        y: -50
      }
    })
    this.outletLabels.on('connect', uiNode => {
      this.emit('connect', {uiNode, inlet: 'inlet', outlet: 'labels'})
    })


    this.inlet = new InletUI(this, 'left')

    this.selfInlet = new InletUI(this, 'center', {color:'rgba(0, 0, 0, 0)'});

    

    this.resize()
  }

  setValue(value) {
    this.value = value
    this.resize()
  }

  getInlet(inlet = 'inlet'){
    switch(inlet){
      case 'inlet':
        return this.inlet
      case 'self':
        return this.selfInlet
    }
  }

  getOutlet(outlet){
    return outlet==='labels' ? this.outletLabels : this.outlet
  }

  addLink(link) {
    this.outletLinks.push(link)
  }

  resize() {

    this.text.width(999)

    this.text.text(this.value)
    const measuredWidth = this.text.getTextWidth()
    this.text.width(Math.min(measuredWidth, 1000))

    this.rect.width(Math.max(30, this.text.getTextWidth()) + padding * 2)
    this.rect.height(Math.max(this.text.height() + padding * 2, 200))
  

    this.group.width(this.rect.width())
    this.group.height(this.rect.height())


    this.inlet.reposition()
    this.outlet.reposition()
    this.outletLabels.reposition()

    this.emit('move')
  }
  
}

