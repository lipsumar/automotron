import Konva from 'konva'
import ContainerNodeUI from './ContainerNodeUI';
import ListNodeUI from './ListNodeUI'
import LinkUI from './LinkUI'
import SplitNodeUI from './SplitNodeUI';
import { EventEmitter } from 'events';
import LoopNodeUI from './LoopNodeUI';
import MacroNodeUI from './MacroNodeUI';
import ProxyNodeUI from './ProxyNodeUI';
import TagNodeUI from './TagNodeUI';
import LogicNodeUI from './LogicNodeUI.js';

export default class BoardUI extends EventEmitter {
  constructor(opts) {
    super()
    this.moving = false
    this.editing = false
    this.readOnly = opts.readOnly
    this.buildStage(opts)
    this.buildBackgroundLayer()
    this.buildLinkLayer()
    this.buildNodeLayer()

    this.graph = opts.graph

    this.nodesById = {}
    this.linkByIds = {}
    this.buildGraph(this.graph)

    this.stage.draw()

    document.addEventListener('copy', this.onCopy.bind(this))
    document.addEventListener('paste', this.onPaste.bind(this))
    document.addEventListener('keyup', this.onKeyup.bind(this)) 
  }

  buildGraph(graph) {


    graph.nodes.forEach(node => {
      if (node.type === 'container') {
        this.createContainer(node)
      } else if (node.type === 'generator') {
        this.createGenerator(node)
      } else if (node.type === 'operator') {
        this.createOperator(node)
      }

    })

    graph.links.forEach(link => {
      this.createLink(link)
    })
  }

  createContainer(node) {
    console.log('create containerUI for', node)
    const container = new ContainerNodeUI({
      stage: this.stage,
      layer: this.nodeLayer,
      value: node.value.value,
      pos: node.pos,
      stroke: this.graph.startContainer.id === node.id ? 'green' : '#999'
    })
    
    this.setupNode(container, node)
  }

  createGenerator(node) {
    console.log('create generatorUI for', node)
    let generator;
    if(node.generator === 'list'){
      generator = new ListNodeUI({
        stage: this.stage,
        layer: this.nodeLayer,
        value: node.rawValue,
        pos: node.pos,
      })
    } else if(node.generator==='macro'){
      generator = new MacroNodeUI({
        stage: this.stage,
        layer: this.nodeLayer,
        value: node.rawValue,
        pos: node.pos,
      })
    } else if (node.generator === 'proxy'){
      generator = new ProxyNodeUI({
        stage: this.stage,
        layer: this.nodeLayer,
        value: node.rawValue,
        pos: node.pos,
      })
    }
    
    this.setupNode(generator, node)
  }

  createOperator(node) {
    console.log('create operatorUI for', node)
    let operator;
    if(node.operator === 'split'){
      operator = new SplitNodeUI({
        stage: this.stage,
        layer: this.nodeLayer,
        pos: node.pos,
        value: node.value,
        //automotronNode: amtSplit
      })
    } else if(node.operator==='loop'){
      operator = new LoopNodeUI({
        stage: this.stage,
        layer: this.nodeLayer,
        pos: node.pos,
        value: node.value
      })
    } else if(node.operator === 'tag'){
      operator = new TagNodeUI({
        stage: this.stage,
        layer: this.nodeLayer,
        pos: node.pos,
        value: node.value
      })
    } else if(node.operator === 'logic'){
      operator = new LogicNodeUI({
        stage: this.stage,
        layer: this.nodeLayer,
        pos: node.pos,
        value: node.value
      })
    }
    
    this.setupNode(operator, node)
  }

  setupNode(uiNode, node){
    uiNode.node = node
    uiNode.on('move-start', () => {
      this.moving = true
    })
    uiNode.on('move-end', () => {
      this.moving = false
      let nodeMoved = [{
        nodeId: node.id,
        pos: uiNode.pos
      }];
      if(uiNode.selected){
        nodeMoved = this.getSelectedNodes().map(uin => {
          return {
            nodeId: uin.node.id,
            pos: uin.pos
          }
        })
      }

      this.undoManager.execute('move', {
        moves: nodeMoved
      })
      
      // reset group drag stuff
      this.getNodes().forEach(node => {
        node.posBeforeMove = null
      })
      uiNode.movedWith = null
    })
    uiNode.on('connect', payload => {
      this.undoManager.execute('createLink', {
        from: {
          nodeId: node.id,
          outlet: payload.outlet,
        },
        to: {
          nodeId: payload.uiNode.node.id,
          inlet: payload.inlet
        }
      })
    })
    uiNode.on('click', (payload) => {
      this.undoManager.execute('select', {
        nodeId: node.id,
        shift: payload.shift
      })
    })

    uiNode.on('move', (originatesFromUser) => {
      if(originatesFromUser && uiNode.selected){
        const moveDelta = {
          x: uiNode.pos.x - uiNode.dragStartedAt.x,
          y: uiNode.pos.y - uiNode.dragStartedAt.y,
        }
        // move other selected nodes
        const otherNodes = this.getSelectedNodes().filter(n => n.node.id !== node.id)
        otherNodes.forEach(otherNode => {
          if(!otherNode.posBeforeMove){
            otherNode.posBeforeMove = {...otherNode.pos}
          }
          const otherPos = {
            x: otherNode.posBeforeMove.x + moveDelta.x,
            y: otherNode.posBeforeMove.y + moveDelta.y
          }
          otherNode.move(otherPos)
        })
      }
    })

    uiNode.on('createContainer', pos => {
      this.undoManager.execute('createLinkedContainer', {
        pos: {
          x: pos.x,
          y: pos.y - 30
        },
        from: {
          nodeId: node.id,
          outlet: 'outlet',
        }
      })
    })

    if(this.readOnly){
      console.log('undrag')
      uiNode.group.draggable(false)
    }

    this.nodeLayer.add(uiNode.group)
    this.nodesById[node.id] = uiNode
  }

  createLink(link) {
    console.log('create linkUI for', link)

    const fromNodeUI = this.nodesById[link.from.id]
    const toNodeUI = this.nodesById[link.to.id]

    if (link.toInlet === 'generator') {
      toNodeUI.setIsGenerated(true)
    }

    const linkUI = new LinkUI({
      layer: this.linkLayer,
      from: fromNodeUI,
      to: toNodeUI,
      toInlet: link.toInlet,
      fromOutlet: link.fromOutlet,
      bendy: link.type === 'agreement',
      color: link.type === 'agreement' ? 'green' : 'black',
      readOnly: this.readOnly
    })
    if(!this.readOnly){
      linkUI.on('dblclick', () => {
        this.undoManager.execute('removeLink', { link })
      })
    }
    
    this.linkLayer.add(linkUI.line)
    this.linkByIds[`${link.from.id}:${link.fromOutlet}-${link.to.id}:${link.toInlet}`] = linkUI
    return linkUI
  }

  removeNode(id) {
    this.nodesById[id].group.destroy()
    delete this.nodesById[id]
  }

  getNode(id) {
    return this.nodesById[id]
  }

  getNodes(){
    return Object.keys(this.nodesById).map(nodeId => this.nodesById[nodeId])
  }

  getSelectedNodes(){
    return this.getNodes().filter(node => node.selected)
  }

  getLink(from, to) {
    return this.linkByIds[`${from.nodeId}:${from.outlet}-${to.nodeId}:${to.inlet}`]
  }

  removeLink(linkUI) {
    if(linkUI.toInlet === "generator"){
      linkUI.to.setIsGenerated(false)
    }
    
    linkUI.line.destroy()
  }

  buildStage(opts) {
    let drawingSelectZone = false

    const stage = new Konva.Stage({
      container: opts.el,
      width: opts.width,
      height: opts.height,
      draggable: true
    });

    stage.setPosition({
      x: opts.width / 2 - 200,
      y: opts.height / 2
    })

    var scaleBy = 1.05;
    stage.on('wheel', e => {
      e.evt.preventDefault();
      var oldScale = stage.scaleX();

      var mousePointTo = {
        x: stage.getPointerPosition().x / oldScale - stage.x() / oldScale,
        y: stage.getPointerPosition().y / oldScale - stage.y() / oldScale
      };

      var newScale =
        e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
      stage.scale({ x: newScale, y: newScale });

      var newPos = {
        x:
          -(mousePointTo.x - stage.getPointerPosition().x / newScale) *
          newScale,
        y:
          -(mousePointTo.y - stage.getPointerPosition().y / newScale) *
          newScale
      };
      stage.position(newPos);
      stage.batchDraw();
    });

    stage.on('dblclick', e => {
      if(this.readOnly) return
      e.evt.preventDefault()

      let current = e.target
      while (!(current instanceof Konva.Stage)) {
        current = current.getParent()
        if (current._isAutomotronNode) {
          //editContainer(current._automotronNode)

          // at first lets find position of text node relative to the stage:
          var textPosition = current._automotronNode.rect.getAbsolutePosition();
          // then lets find position of stage container on the page:
          var stageBox = stage.container().getBoundingClientRect();
          // so position of textarea will be the sum of positions above:
          var pos = {
            x: stageBox.left + textPosition.x,
            y: stageBox.top + textPosition.y
          };
          const node = current._automotronNode.node
          this.editing = true
          this.emit('editNode', {
            pos,
            width: current._automotronNode.rect.width(),
            height: current._automotronNode.rect.height(),
            nodeId: node.id,
            value: current._automotronNode.value
          })
          return
        }
      }


      const transform = stage.getAbsoluteTransform().copy()
      transform.invert()
      const point = transform.point(stage.getPointerPosition())

      //createContainer('...', { pos: point })
      this.undoManager.execute('createContainer', {
        pos: {
          x: point.x - 30,
          y: point.y - 30,
        },
        value: '...'
      })
    })


    stage.on('contentContextmenu', (e) => {
      e.evt.preventDefault();
    })
    stage.on('click', e => {
      if(this.readOnly) return
      if (e.evt.button === 2 || e.evt.ctrlKey) { // right click

        const transform = stage.getAbsoluteTransform().copy()
        transform.invert()
        const point = transform.point(stage.getPointerPosition())

        //createAtPoint = point
        //openNodeMenu({ x: e.evt.clientX, y: e.evt.clientY })
        this.emit('contextmenu', {
          pos: { x: e.evt.clientX, y: e.evt.clientY },
          createAtPoint: point
        })
        
      } else { // normal click
        if(this.editing){
          this.emit('setEditValue');
        }
        //this.undoManager.execute('select', {nodeId: null})
      }
    })

    
    stage.on('mousedown', e => {
      if(e.evt.shiftKey){
        const transform = stage.getAbsoluteTransform().copy()
        transform.invert()
        const point = transform.point(stage.getPointerPosition())
        
        drawingSelectZone = new Konva.Rect({
          x: point.x,
          y: point.y,
          width: 0,
          height: 0,
          fill: 'rgba(167,196,247, 0.3)'
        })
        this.nodeLayer.add(drawingSelectZone)

        stage.draggable(false);
      }
    })
    stage.on('mouseup', () => {
      if(drawingSelectZone){
        stage.draggable(true)
        drawingSelectZone.destroy()
        drawingSelectZone = false
        stage.draw()
      } else {
        if(!this.moving){
          this.undoManager.execute('select', {nodeId: null})
        }
        
      }
    })
    stage.on('mousemove', e => {
      if(drawingSelectZone){
        const transform = stage.getAbsoluteTransform().copy()
        transform.invert()
        const point = transform.point(stage.getPointerPosition())

        drawingSelectZone.width(
          point.x - drawingSelectZone.x()
        )
        drawingSelectZone.height(
          point.y - drawingSelectZone.y()
        )

        const sel = drawingSelectZone.getClientRect()

        this.getNodes().forEach(uiNode => {
          if(intersect(sel,uiNode.rect.getClientRect())){
            uiNode.setSelected(true)
          }else{
            uiNode.setSelected(false)
          }
        })
        stage.draw()
      }
    })


    this.stage = stage
  }

  buildBackgroundLayer() {
    const bgLayer = new Konva.Layer();
    this.stage.add(bgLayer)
    bgLayer.add(
      new Konva.Circle({
        x: 0,//this.stage.width() / 2,
        y: 0, //this.stage.height() / 2,
        radius: 50,
        fill: '#ccc'
      })
    );
  }

  buildLinkLayer() {
    this.linkLayer = new Konva.Layer();
    this.stage.add(this.linkLayer)
  }

  buildNodeLayer() {
    this.nodeLayer = new Konva.Layer();
    this.stage.add(this.nodeLayer)
  }

  setUndoManager(undoManager) {
    this.undoManager = undoManager
  }

  getState(){
    return {
      stage: {
        pos: this.stage.position(),
        scale: this.stage.scale()
      }
    }
  }

  onCopy(e){
    if(this.editing) return
    const uiNodes = this.getSelectedNodes();
    const nodes = uiNodes.map(uiNode => uiNode.node.normalize())
    const nodeIds = nodes.map(n => n.id)
    const links = this.graph.links.reduce((acc, link) => {
      if(nodeIds.includes(link.from.id) && nodeIds.includes(link.to.id)){
        acc.push(link.normalize())
      }
      return acc
    }, []) 
    const data = { nodes, links }
    console.log('-> COPY', data)
    e.clipboardData.setData('text/plain', JSON.stringify(data));
    e.preventDefault();
  }

  onPaste(e){
    if(this.editing) return
    const paste = (event.clipboardData || window.clipboardData).getData('text');
    let data = null;
    try{
      data = JSON.parse(paste);
    }catch(err){
      console.log('parse error', err)
    }

    if(data && data.nodes && data.links){
      console.log('-> PASTE', data)
      this.undoManager.execute('paste', { data })
    } else {
      alert('can’t paste this')
    }
    
  }

  onKeyup(e){
    if(this.editing) return
    if(e.key === 'Backspace'){
      this.undoManager.execute('removeNodes', {nodes:this.getSelectedNodes()})
    }
  }
}

function intersect(r1, r2) {
  return !(
    r2.x > r1.x + r1.width ||
    r2.x + r2.width < r1.x ||
    r2.y > r1.y + r1.height ||
    r2.y + r2.height < r1.y
  );
}