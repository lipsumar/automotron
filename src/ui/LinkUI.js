import Konva from 'konva'
import {EventEmitter} from 'events'

export default class LinkUI extends EventEmitter{
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
    this.line.on('mouseenter', () => {
      this.line.strokeWidth(5)
      this.line.draw()
    })
    this.line.on('mouseleave', () => {
      this.line.strokeWidth(2)
      this.layer.draw()
    })
    this.reposition()

    this.line.on('dblclick', () => {
      this.emit('dblclick')
    })

    opts.from.on('move', () => {
      this.reposition()
    })
    opts.to.on('move', () => {
      this.reposition()
    })
  }

  reposition(){
    const from = this.from.getOutlet(this.fromOutlet).absPos() 
    const to = this.to.getInlet(this.toInlet).absPos()

    const points = [from.x, from.y]
    if(this.bendy){
      points.push((from.x+to.x)/2, ((from.y+to.y)/2) + 18)
    } else {
      const fromOutlet = this.from.getOutlet(this.fromOutlet)
      const toInlet = this.to.getInlet(this.toInlet)

      if(fromOutlet.side==='right'){
        points.push(from.x+10, from.y)
      }

      if(fromOutlet.side==='bottom'){
        points.push(from.x, from.y+10)
      }
      
      if(fromOutlet.side === 'right' && toInlet.side === 'left' && from.x>to.x){
        if(from.y < to.y){
          points.push(from.x+10, from.y+30)
          points.push(to.x-5, to.y-30)
        } else {
          points.push(from.x+10, from.y-30)
          points.push(to.x-5, to.y+30)
        }
      }

      
      if(toInlet.side==='left'){
        points.push(to.x-5, to.y)
      }
      
    }


    points.push(to.x, to.y)
    this.line.points(points)

    this.layer.draw()
  }
}