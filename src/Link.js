import Konva from 'konva'
import {EventEmitter} from 'events'

export default class Link extends EventEmitter{
  constructor(opts){
    super()
    this.from = opts.from
    this.to = opts.to
    this.layer = opts.layer

    this.line = new Konva.Line({
      stroke: 'blue'
    })
    this.reposition()

    this.line.on('dblclick', () => {
      this.emit('destroy')
      this.line.destroy()
      this.layer.draw()
    })

    opts.from.on('move', () => {
      this.reposition()
    })
    opts.to.on('move', () => {
      this.reposition()
    })
  }

  reposition(){
    const from = this.from.getOutletAttachPos()
    const to = this.to.getInletAttachPos()

    this.line.points([
      from.x, from.y,
      to.x, to.y
    ])
    this.layer.draw()
  }
}