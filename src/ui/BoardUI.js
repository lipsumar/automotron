import Konva from 'konva'
import ContainerNodeUI from './ContainerNodeUI';
import GeneratorNodeUI from './GeneratorNodeUI'
import LinkUI from './LinkUI'
import SplitNodeUI from './SplitNodeUI';
import { EventEmitter } from 'events';
import LoopNodeUI from './LoopNodeUI';

export default class BoardUI extends EventEmitter {
  constructor(opts) {
    super()
    this.buildStage(opts)
    this.buildBackgroundLayer()
    this.buildLinkLayer()
    this.buildNodeLayer()

    this.graph = opts.graph

    this.buildGraph()

    this.stage.draw()
  }

  buildGraph() {
    this.nodesById = {}
    this.linkByIds = {}

    this.graph.nodes.forEach(node => {
      if (node.type === 'container') {
        this.createContainer(node)
      } else if (node.type === 'generator') {
        this.createGenerator(node)
      } else if (node.type === 'operator') {
        this.createOperator(node)
      }

    })

    this.graph.links.forEach(link => {
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
    const generator = new GeneratorNodeUI({
      stage: this.stage,
      layer: this.nodeLayer,
      value: node.rawValue,
      pos: node.pos,
      //automotronNode: ag
    })
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
        //automotronNode: amtSplit
      })
    } else if(node.operator==='loop'){
      operator = new LoopNodeUI({
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
    uiNode.on('move-end', () => {
      this.undoManager.execute('move', {
        nodeId: node.id,
        pos: uiNode.pos
      })
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
      color: link.type === 'agreement' ? 'green' : 'black'
    })
    linkUI.on('dblclick', () => {
      this.undoManager.execute('removeLink', { link })
    })
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

    var scaleBy = 1.01;
    stage.on('wheel', e => {
      e.evt.preventDefault();
      var oldScale = stage.scaleX();

      var mousePointTo = {
        x: stage.getPointerPosition().x / oldScale - stage.x() / oldScale,
        y: stage.getPointerPosition().y / oldScale - stage.y() / oldScale
      };

      var newScale =
        e.evt.deltaY > 0 ? oldScale * scaleBy : oldScale / scaleBy;
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
        pos: point,
        value: '...'
      })
    })


    stage.on('contentContextmenu', (e) => {
      e.evt.preventDefault();
    })
    stage.on('click', e => {
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
}