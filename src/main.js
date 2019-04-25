import Konva from 'konva'
import ContainerNode from './nodes/Container';
import Link from './Link'
import Automotron from './automotron/Automotron'

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


const ac = createContainer('Lorem', {
  pos:{
    x: stage.width() / 2 - 100,
    y: stage.height() / 2
  }
})
automotron.setStartContainer(ac)
createContainer('ipsum', {
  pos: {
    x: stage.width() / 2 + 50,
    y: stage.height() / 2
  }
})


document.querySelector('button.play').addEventListener('click', () => {
  automotron.play().then(text => {
    console.log('=>', text)
  })
})


function createContainer(text, opts){
  const ac = automotron.createContainer({
    value: text
  })
  const container = new ContainerNode({
    stage,
    layer,
    value: text,
    pos: opts.pos,
    automotronNode: ac
  })
  layer.add(container.group)
  layer.draw()
  container.on('connect', connectContainer => {
    createLink(container, connectContainer)
  })

  
  //container._automotronContainer = ac
  return ac
}

function createLink(containerA, containerB){
  const link = new Link({
    layer: linkLayer,
    from: containerA,
    to: containerB
  })
  linkLayer.add(link.line)
  containerA.addLink(link)
  linkLayer.draw()

  link.on('destroy', () => {
    automotron.removeLink(containerA.automotronNode, containerB.automotronNode)
  })
  
  automotron.createLink(containerA.automotronNode, containerB.automotronNode)
  
  return link
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

  createContainer('...', {pos: point})
})






function editContainer(container){
  // at first lets find position of text node relative to the stage:
  var textPosition = container.rect.getAbsolutePosition();

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

  textarea.focus();

  textarea.addEventListener('keydown', function(e) {
    // hide on enter
    if (e.keyCode === 13) {
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
