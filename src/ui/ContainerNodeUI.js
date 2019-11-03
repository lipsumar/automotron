import Konva from 'konva'
import OutletUI from './OutletUI'
import InletUI from './InletUI'
import BaseNodeUI from './BaseNodeUI';

const padding = 10
const outletWidth = 6
const generatorOutletHeight = 6

export default class ContainerNodeUI extends BaseNodeUI {
  constructor(opts) {
    super()
    this.stage = opts.stage
    this.layer = opts.layer
    this.value = opts.value
    this.pos = opts.pos
    this.outletDragCurrentlyOnInlet = null
    this.outletLinks = []
    //this.automotronNode = opts.automotronNode
    this.nodeId = opts.nodeId
    this.isGenerated = false
    this.hasOutlet = {
      top: true,
      bottom: true,
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
      strokeWidth: 2
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


    this.inlet = new InletUI(this, 'left')

    this.selfInlet = new InletUI(this, 'center', {color:'rgba(0, 0, 0, 0)'});

    this.generatorInlet = new InletUI(this, 'top')


    this.agreementOutlet = new OutletUI(this, 'bottom', {
      offset:{
        x: -15,
        y: 0
      },
      toInlet: 'agreement',
      bendy: true
    })
    this.agreementOutlet.on('connect', uiNode => {
      this.emit('connect', {uiNode, inlet: 'agreement', outlet: 'agreement', bendy: true})
    })

    this.agreementInlet = new InletUI(this, 'bottom', {
      offset:{
        x: 15,
        y: 0
      }
    })

    this.resize()
  }

  setValue(value) {
    this.value = value
    //this.automotronNode.setValue(value)
    this.resize()
  }

  getOutletAttachPos(outlet = 'outlet') {
    if(outlet === 'outlet'){
      return {
        x: this.outlet.absX(),
        y: this.outlet.absY() 
      }
    } else if (outlet==='agreement'){
      return {
        x: this.agreementOutlet.absX(),
        y: this.agreementOutlet.absY() + 5
      }
    }
    
  }

  getInletAttachPos(inlet = 'inlet') {
    if (inlet === 'inlet') {
      return {
        x: this.inlet.absX(),
        y: this.inlet.absY() 
      }
    } else if (inlet === 'generator') {
      return {
        x: this.generatorInlet.absX(),
        y: this.generatorInlet.absY() 
      }
    } else if (inlet === 'agreement') {
      return {
        x: this.agreementInlet.absX(),
        y: this.agreementInlet.absY() + 5
      }
    } else if (inlet === 'self') {
      console.log('uh?')
      return {
        x: 200,
        y: 200
      }
    }

  }

  getInlet(inlet = 'inlet'){
    switch(inlet){
      case 'inlet':
        return this.inlet
      case 'generator':
        return this.generatorInlet
      case 'agreement':
        return this.agreementInlet
      case 'self':
        return this.selfInlet
    }
  }

  getOutlet(outlet = 'outlet'){
    switch(outlet){
      case 'outlet':
        return this.outlet
      case 'agreement':
        return this.agreementOutlet
    }
    
  }

  addLink(link) {
    this.outletLinks.push(link)
  }

  setIsGenerated(gen) {
    this.isGenerated = gen
    this.value = null
    this.resize()
  }

  resize() {

    if (this.isGenerated) {
      this.text.text('')
      this.text.width(200)
      this.rect.width(200)
    } else {
      this.text.width(999)

      this.text.text(this.value)
      const measuredWidth = this.text.getTextWidth()
      this.text.width(Math.min(measuredWidth, 500))

      this.rect.width(Math.max(30, this.text.getTextWidth()) + padding * 2)
      this.rect.height(this.text.height() + padding * 2)
    }


    this.group.width(this.rect.width())
    this.group.height(this.rect.height())


    this.inlet.reposition()
    this.outlet.reposition()
    this.generatorInlet.reposition()
    this.agreementInlet.reposition()
    this.agreementOutlet.reposition()

    this.emit('move')
  }
  
}

