import Konva from 'konva'
import ContainerNodeUI from './ContainerNodeUI';
import GeneratorNodeUI from './GeneratorNodeUI'
import LinkUI from './LinkUI'
import SplitNodeUI from './SplitNodeUI';

export default class BoardUI {
  constructor(opts) {
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

    this.graph.nodes.forEach(node => {
      if (node.type === 'container') {
        this.createContainer(node)
      } else if (node.type === 'generator') {
        this.createGenerator(node)
      } else if(node.type === 'operator'){
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
      //automotronNode: ac,
      stroke: this.graph.startContainer.id === node.id ? 'green' : '#999'
    })
    this.nodeLayer.add(container.group)
    this.nodesById[node.id] = container
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
    this.nodeLayer.add(generator.group)
    this.nodesById[node.id] = generator
  }

  createOperator(node){
    console.log('create operatorUI for', node)
    const operator = new SplitNodeUI({
      stage: this.stage,
      layer: this.nodeLayer,
      pos: node.pos,
      //automotronNode: amtSplit
    })
    this.nodeLayer.add(operator.group)
    this.nodesById[node.id] = operator
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
      bendy: false, //opts.bendy,
      color: 'black' //opts.color
    })
    this.linkLayer.add(linkUI.line)
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
}