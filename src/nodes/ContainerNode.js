import Konva from 'konva'
import { EventEmitter } from 'events'
import Outlet from './Outlet'
import Inlet from './Inlet'

const padding = 10
const outletWidth = 6
const generatorOutletHeight = 6

export default class ContainerNode extends EventEmitter {
  constructor(opts) {
    super()
    this.stage = opts.stage
    this.layer = opts.layer
    this.value = opts.value
    this.pos = opts.pos
    this.outletDragCurrentlyOnInlet = null
    this.outletLinks = []
    this.automotronNode = opts.automotronNode
    this.isGenerated = false
    this.hasOutlet = {
      top: true,
      bottom: true,
      left: true,
      right: true
    }
    this.build()

  }

  build() {
    this.group = new Konva.Group({
      draggable: true,
      x: this.pos.x,
      y: this.pos.y
    });
    this.group._isAutomotronNode = true
    this.group._automotronNode = this

    this.group.on('dragmove', () => {
      this.emit('move')
    })

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
      stroke: '#999',
      strokeWidth: 2
    });

    this.group.add(this.rect)
    this.group.add(this.text)


    this.outlet = new Outlet(this, 'right')
    this.outlet.on('connect', container => {
      this.emit('connect', {container, inlet: 'inlet', outlet: 'outlet'})
    })


    this.inlet = new Inlet(this, 'left')


    this.generatorInlet = new Inlet(this, 'top')


    this.agreementOutlet = new Outlet(this, 'bottom', {
      offset:{
        x: -15,
        y: 0
      },
      toInlet: 'agreement',
      bendy: true
    })
    this.agreementOutlet.on('connect', container => {
      this.emit('connect', {container, inlet: 'agreement', outlet: 'agreement', bendy: true})
    })

    this.agreementInlet = new Inlet(this, 'bottom', {
      offset:{
        x: 15,
        y: 0
      }
    })

    this.resize()
  }

  setValue(value) {
    this.value = value
    this.automotronNode.setValue(value)
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
    }
  }

  getOutlet(){
    return this.outlet
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

