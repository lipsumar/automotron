import Konva from 'konva'
import {EventEmitter} from 'events'

export default class Link extends EventEmitter{
  constructor(opts){
    super()
    this.from = opts.from
    this.to = opts.to
    this.layer = opts.layer
    this.toInlet = opts.toInlet
    this.fromOutlet = opts.fromOutlet
    this.bendy = opts.bendy
    
    this.line = new Konva.Line({
      stroke: opts.color,
      tension: this.bendy ? 0.6 : 0
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
    const from = this.from.getOutlet(this.fromOutlet).absPos() // this.from.getOutletAttachPos(this.fromOutlet)
    const to = this.to.getInlet(this.toInlet).absPos()// this.to.getInletAttachPos(this.toInlet)

    const points = [from.x, from.y]
    if(this.bendy){
      points.push((from.x+to.x)/2, ((from.y+to.y)/2) + 18)
    }
    points.push(to.x, to.y)
    this.line.points(points)

    this.layer.draw()
  }
}