import Konva from 'konva'
import OutletUI from './OutletUI';
import BaseNodeUI from './BaseNodeUI';



export default class ListNodeUI extends BaseNodeUI{
  constructor(opts){
    super()
    this.pos = opts.pos
    this.stage = opts.stage
    this.layer = opts.layer
    this.value = opts.value
    this.outletDragCurrentlyOnInlet = null
    this.automotronNode = opts.automotronNode
    this.hasOutlet = {
      bottom: true
    }
    this.defaultStroke = '#6a0080';
    this.build()
    this.resize()
  }

  setValue(value){
    value = value.trim()
    this.value = value
    //this.automotronNode.setValue(value)
    this.resize()
  }

  build(){
    BaseNodeUI.prototype.build.call(this)

    this.rect = new Konva.Rect({
      x: 0,
      y: 0,
      width: 200,
      height: 60,
      fill: '#d05ce3',
      stroke: this.defaultStroke
    })

    this.text = new Konva.Text({
      x: 4,
      y: 25,
      width: 200,
      text: this.value,
      fontSize: 18
    })

    const headerRect = new Konva.Rect({
      x: 0,
      y: 0,
      width: 200,
      height: 25,
      fill: '#9c27b0'
    })
    const headerText = new Konva.Text({
      x: 4,
      y: 4,
      text: 'List',
      fontSize: 18,
      fill: '#fff'
    })
  
    this.outlet = new OutletUI(this, 'bottom', {toInlet:'generator'})
    this.outlet.on('connect', uiNode => {
      this.emit('connect', {uiNode, inlet:'generator', outlet: 'outlet'})
    })


    this.settingsText = new Konva.Text({
      x: headerRect.width() - 20,
      y: 8,
      width: 22,
      height: 22,
      text: '⚙️',
      fontSize: 15
    })

    this.settingsText.on('click', e => {
      e.cancelBubble = true
      this.emit('settings')
    })

    this.group.add(this.rect)
    this.group.add(headerRect)
    this.group.add(headerText)
    this.group.add(this.text)
    this.group.add(this.settingsText)
    
  }

  getOutletAttachPos(){
    return {
      x: this.group.x() + this.rect.width() / 2,
      y: this.group.y() + this.rect.height()
    }
  }

  getOutlet(){
    return this.outlet
  }
  
  resize(){
    this.text.text(this.value)
    this.rect.height(25 + this.text.height())
    this.outlet.reposition()
  }

  getSettingsConfig(){
    return [
      {
        id: 'nonRepeat',
        type: 'checkbox',
        text: 'non repeat',
        value: this.node.settings.nonRepeat
      }
    ]
  }
}

