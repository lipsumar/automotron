import Konva from 'konva'
import { EventEmitter } from 'events'
import Outlet from './Outlet'
import Inlet from './Inlet'

export default class SplitNode extends EventEmitter {
  constructor(opts){
    super()
    this.stage = opts.stage
    this.layer = opts.layer
    this.pos = opts.pos
    this.automotronNode = opts.automotronNode
    this.hasOutlet = {
      top: false,
      bottom: false,
      left: true,
      right: true
    }
    this.build()
  }

  build(){
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


    this.rect = new Konva.Rect({
      x: 6,
      y: 0,
      width: 50,
      height: 120,
      fill: '#3f51b5'
    })

    this.pcRect = new Konva.Rect({
      x: 6,
      y: 0,
      width: 50,
      height: 60,
      fill: '#002984'
    })

    this.group.add(this.rect)
    this.group.add(this.pcRect)

    this.inlet = new Inlet(this, 'left')

    this.outletA = new Outlet(this, 'right', {
      offset:{
        x: 0,
        y: -25
      }
    })
    this.outletA.on('connect', container => {
      this.emit('connect', {container, outlet:'split-a'})
    })

    this.outletB = new Outlet(this, 'right', {
      offset:{
        x: 0,
        y: 25
      }
    })
    this.outletB.on('connect', container => {
      this.emit('connect', {container, outlet:'split-b'})
    })
    
  }

  getInlet(){
    return this.inlet
  }
  getOutlet(outlet){
    switch(outlet){
      case 'split-a':
        return this.outletA;
      case 'split-b':
        return this.outletB
    }
  }

}