import Konva from 'konva'
import ContainerNode from './nodes/ContainerNode';
import GeneratorNode from './nodes/GeneratorNode'
import Link from './Link'
import Automotron from './automotron/Automotron'
import SplitNode from './nodes/SplitNode'

const automotron = new Automotron()

const width = window.innerWidth;
const height = window.innerHeight;

const stage = new Konva.Stage({
  container: 'container',
  width: width,
  height: height,
  draggable: true
});

const bgLayer = new Konva.Layer();
stage.add(bgLayer)

const linkLayer = new Konva.Layer();
stage.add(linkLayer)

const layer = new Konva.Layer();
stage.add(layer);


bgLayer.add(
  new Konva.Circle({
    x: stage.width() / 2,
    y: stage.height() / 2,
    radius: 50,
    fill: '#ccc'
  })
);
bgLayer.draw()


const containerNode1 = createContainer('AUTO', {
  pos: {
    x: stage.width() / 2 - 350,
    y: stage.height() / 2
  },
  stroke: 'green'
})
automotron.setStartContainer(containerNode1.automotronNode)
const containerNode2 = createContainer('', {
  pos: {
    x: stage.width() / 2 - 150,
    y: stage.height() / 2
  }
})

const containerNode3 = createContainer('TRON', {
  pos: {
    x: stage.width() / 2 + 250,
    y: stage.height() / 2
  }
})

const generatorNode1 = createGenerator('list', 'MO\nTO\nNO\nDO\nFLO\nMO\nTRO', {
  pos: {
    x: stage.width() / 2 - 150,
    y: stage.height() / 2 - 200
  }
})

const splitNode1 = createSwitch({
  pos:{
    x: stage.width() / 2 + 130,
    y: stage.height() / 2
  }
})


//createLink(generatorNode1, containerNode1, {toInlet: 'generator', color:'#6a0080'})
createLink(generatorNode1, containerNode2, {toInlet: 'generator', color:'#6a0080'})
createLink(containerNode1, containerNode2, {color:'black'})
createLink(containerNode2, splitNode1, {color:'black'})
createLink(splitNode1, containerNode3, {color:'black', fromOutlet:'split-a'})
createLink(splitNode1, containerNode2, {color:'black', fromOutlet:'split-b'})


document.querySelector('button.play').addEventListener('click', () => {
  automotron.play().then(sequence => {
    // eslint-disable-next-line no-console
    console.log('sequence =>', sequence)
    const text = sequence.map(i => i.value).join(' ')
    // eslint-disable-next-line no-console
    console.log('=>', text)

    document.querySelector('.output__body').innerHTML = text
  })
})


function createContainer(text, opts) {
  const ac = automotron.createContainer({
    value: text
  })
  const container = new ContainerNode({
    stage,
    layer,
    value: text,
    pos: opts.pos,
    automotronNode: ac,
    stroke: opts.stroke
  })
  layer.add(container.group)
  layer.draw()
  container.on('connect', payload => {
    createLink(container, payload.container, {
      toInlet:payload.inlet, 
      fromOutlet: payload.outlet,
      bendy: payload.bendy,
      color: payload.outlet==='agreement' ? 'green' : 'black'
    })
  })

  return container
}

function createLink(containerA, containerB, opts) {
  if(opts.toInlet === 'generator'){
    containerB.setIsGenerated(true)
  }

  const link = new Link({
    layer: linkLayer,
    from: containerA,
    to: containerB,
    toInlet: opts.toInlet,
    fromOutlet: opts.fromOutlet,
    bendy: opts.bendy,
    color: opts.color
  })
  linkLayer.add(link.line)
  //containerA.addLink(link)

  link.on('destroy', () => {
    automotron.removeLink(containerA.automotronNode, containerB.automotronNode)
  })

  linkLayer.draw()

  if(opts.fromOutlet === 'agreement'){
    automotron.createAgreementLink(containerA.automotronNode, containerB.automotronNode)
  }else{
    automotron.createLink(containerA.automotronNode, containerB.automotronNode, {
      fromOutlet: opts.fromOutlet,
      toInlet: opts.toInlet
    })
  }
  

  return link
}

function createGenerator(type, value, opts){
  const ag = automotron.createGenerator({type})
  
  
  const generator = new GeneratorNode({
    stage,
    layer,
    pos: opts.pos,
    automotronNode: ag
  })
  generator.setValue(value)
  layer.add(generator.group)
  layer.draw()

  generator.on('connect', payload => {
    createLink(generator, payload.container, {toInlet:'generator', color:'#6a0080'})
  })

  return generator
}

function createSwitch(opts){
  const amtSplit = automotron.createOperator('split')
  const split = new SplitNode({
    stage,
    layer,
    pos: opts.pos,
    automotronNode: amtSplit
  })
  layer.add(split.group)
  layer.draw()

  split.on('connect', payload => {
    createLink(split, payload.container, {fromOutlet:payload.outlet, color:'black'})
  })
  return split
}



layer.draw();


stage.on('dblclick', e => {
  e.evt.preventDefault()

  let current = e.target
  while (!(current instanceof Konva.Stage)) {
    current = current.getParent()
    if (current._isAutomotronNode) {
      editContainer(current._automotronNode)
      
      return
    }
  }


  const transform = stage.getAbsoluteTransform().copy()
  transform.invert()
  const point = transform.point(stage.getPointerPosition())

  createContainer('...', { pos: point })
})


var createAtPoint = null;
stage.on('contentContextmenu', (e) => {
  e.evt.preventDefault();
})
stage.on('click', e => {
  if (e.evt.button === 2 || e.evt.ctrlKey) {
    // right click

    const transform = stage.getAbsoluteTransform().copy()
    transform.invert()
    const point = transform.point(stage.getPointerPosition())

    createAtPoint = point
    openNodeMenu({x:e.evt.clientX, y:e.evt.clientY})
    //createGenerator('list', '', {pos: point})
  }
})


const nodeMenu = document.querySelector('#node-menu')
nodeMenu.querySelectorAll('.node-menu__item').forEach(el => {
  el.addEventListener('click', e => {
    nodeMenu.style.display = 'none'
    const type = e.target.innerHTML
    switch(type){
      case 'list':
        createGenerator('list', '', {pos: createAtPoint})
        break;
      case 'split':
        createSwitch({pos: createAtPoint})
    }
  })
})
function openNodeMenu(pos){
  nodeMenu.style.display = 'block'
  nodeMenu.style.top = `${pos.y}px`
  nodeMenu.style.left = `${pos.x}px`
}


const outputEl = document.querySelector('#output')
document.querySelector('.output__handle').addEventListener('click', () => {
  outputEl.classList.toggle('open')
})



function editContainer(container) {
  // at first lets find position of text node relative to the stage:
  var textPosition = container.text.getAbsolutePosition();

  // then lets find position of stage container on the page:
  var stageBox = stage.container().getBoundingClientRect();

  // so position of textarea will be the sum of positions above:
  var areaPosition = {
    x: stageBox.left + textPosition.x,
    y: stageBox.top + textPosition.y
  };

  // create textarea and style it
  var textarea = document.createElement('textarea');
  document.body.appendChild(textarea);

  textarea.value = container.value
  textarea.style.position = 'absolute';
  textarea.style.top = areaPosition.y + 'px';
  textarea.style.left = areaPosition.x + 'px';
  textarea.style.width = container.rect.width() + 'px'
  textarea.style.height = container.rect.height() + 'px'

  textarea.focus();

  textarea.addEventListener('keydown', function (e) {
    // hide on enter
    if (e.keyCode === 13 && e.metaKey) {
      container.setValue(textarea.value);
      layer.draw();
      document.body.removeChild(textarea);
    }
  });
}




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
