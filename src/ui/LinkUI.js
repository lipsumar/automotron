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
    this.link = opts.link

    this.line = new Konva.Line({
      stroke: opts.color,
      tension: this.bendy ? 0.6 : 0,
      dash: [4, 4]
    })
    if(!opts.readOnly){
      this.line.on('mouseenter', () => {
        this.line.strokeWidth(5)
        this.line.draw()
      })
      this.line.on('mouseleave', () => {
        this.line.strokeWidth(2)
        this.layer.draw()
      })
      this.line.on('click', e => {
        if (e.evt.button === 2 || e.evt.ctrlKey) { // right click
          console.log('rigth click line')
          e.cancelBubble = true
          this.emit('toggleSeparator')
        }
      })
      this.link.on('setSeparator', this.reposition.bind(this))
    }
    
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
        this.line.strokeWidth(3)
      }

      if(fromOutlet.side==='bottom'){
        points.push(from.x, from.y+10)
        //this.line.dash([5, 5])
        this.line.stroke('#aaa')
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

      if(toInlet.side==='top'){
        points.push(to.x, to.y-5)
      }
      
    }


    points.push(to.x, to.y)
    this.line.points(points)

    this.line.dashEnabled(this.link.separator === '')

    this.layer.draw()
  }
}