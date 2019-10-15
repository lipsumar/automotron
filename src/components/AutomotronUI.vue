<template>
  <div class="automotron-ui">
    <div ref="container"></div>
    <div
      id="node-menu"
      v-if="contextMenu"
      :style="{top:`${contextMenu.pos.y}px`, left:`${contextMenu.pos.x}px`}"
    >
      <div
        class="node-menu__item"
        v-for="(op,i) in contextMenuOptions"
        :key="`op-${i}`"
        @click="contextMenuChoice(op)"
      >{{op.type}}: {{op.generator || op.operator || ''}}</div>
    </div>

    <div
      id="node-editor"
      v-if="nodeEdit"
      :style="{top:`${nodeEdit.pos.y}px`, left:`${nodeEdit.pos.x}px`}"
    >
      <textarea
        v-model="nodeEditValue"
        @keyup.ctrl.enter="submitNodeEdit"
        @keyup.alt.enter="submitNodeEdit"
        @keydown.meta.enter="submitNodeEdit"
        :style="{width: `${Math.max(nodeEdit.width, 150)}px`,height: `${nodeEdit.height}px`}"
        ref="textarea"
      ></textarea>
    </div>

    <div id="buttons" v-if="user">
      <button @click="$router.push('/')">&lt;&lt;</button>
      <button @click="run">run</button>
      <button @click="$router.push('/generator/new')">new</button>
      <button @click="$emit('save', {graph: graph.normalize(), board: board.getState()})">save</button>
      <button @click="undo" :disabled="!hasUndo">←</button>
      <button @click="redo" :disabled="!hasRedo">→</button>
      <div class="meta-node-stack">
        <!-- <div class="meta-node-stack__item">
          <a href="#" @click.prevent="goToMetaNode(rootNode)">Root</a>
        </div> -->
        <div class="meta-node-stack__item"
          v-for="(node, idx) in metaNodeStack"
          :key="node.id"
        >
          <template v-if="idx>0">&nbsp;&gt;</template>
          <a href="#" @click.prevent="goToMetaNode(node)">
            <template v-if="idx===0">Root</template>
            <template v-else>
              {{typeof node.value === 'string' ? node.value : node.value.value}}
            </template>
          </a>
        </div>
        
      </div>
    </div>

    <div id="output" :class="{open:outputOpen}">
      <div class="output__handle" @click="outputOpen = !outputOpen">
        <label>output</label>
      </div>
      <div class="output__body">
        <p v-html="outputText.split('\\n').join('<br>')"></p>
        <hr/>
        <p v-html="outputTextFixed.split('\\n').join('<br>')"></p>
      </div>
    </div>
  </div>
</template>

<script>
import AutomotronBoardUI from "../ui/BoardUI.js";
import AutomotronGraph from "../automotron/Graph.js";
import eventBus from "../eventBus.js";
import UndoManager from "../commands/UndoManager.js";
import frenchFixer from "../services/FrenchFixer"

export default {
  props: {
    state: {
      type: Object,
      required: true
    }
  },
  mounted() {
    console.log("Mounted UI", this.state);
    this.build();
  },
  data: function() {
    return {
      outputText: "",
      hasUndo: false,
      hasRedo: false,
      nodeEdit: null,
      nodeEditValue: "",
      contextMenu: null,
      contextMenuOptions: [
        { type: "generator", generator: "list" },
        { type: "generator", generator: "macro" },
        { type: "generator", generator: "proxy" },
        { type: "operator", operator: "split" },
        { type: "operator", operator: "loop" },
        { type: "operator", operator: "tag" },
        { type: "operator", operator: "logic" },
        { type: "meta"},
      ],
      outputOpen: true,
      metaNodeStack: [],
    };
  },
  methods: {
    build() {
      this.graph = new AutomotronGraph(this.state.graph);
      this.board = new AutomotronBoardUI({
        el: this.$refs.container,
        graph: this.graph,
        width: window.innerWidth,
        height: window.innerHeight
      });
      if(this.state.board){
        this.board.stage.position(this.state.board.stage.pos)
        this.board.stage.scale(this.state.board.stage.scale)
        this.board.stage.draw()
      }
    
      this.undoManager = new UndoManager(this.graph, this.board);
      this.undoManager.on("action", () => {
        this.hasUndo = this.undoManager.hasUndo();
        this.hasRedo = this.undoManager.hasRedo();
      });
      this.board.setUndoManager(this.undoManager);
      this.board.on("editNode", payload => {
        this.nodeEdit = payload;
        this.nodeEditValue = payload.value;
        this.$nextTick(() => {
          this.$refs.textarea.focus()
        })
      });
      this.board.on("contextmenu", payload => {
        this.contextMenu = payload;
      });

      this.metaNodeStack = this.graph.getEachNodeAtPath('/')
      this.board.on('nodePathChanged', nodePath => {
        const nodes = this.graph.getEachNodeAtPath(nodePath)
        
        const lastNode = nodes[nodes.length - 1]
        this.undoManager.execute('changeGraph', {node: lastNode})
        this.undoManager.graph = lastNode.graph || lastNode
        this.metaNodeStack = nodes
      })
    },
    run() {
      this.graph.run().then(sequence => {
        console.log('OUTPUT SEQUENCE', sequence)
        this.outputText = sequence.map(i => i.value).join(" ");
      });
    },
    undo() {
      this.undoManager.undo();
    },
    redo() {
      this.undoManager.redo();
    },
    submitNodeEdit() {
      this.undoManager.execute("setNodeValue", {
        nodeId: this.nodeEdit.nodeId,
        value: this.nodeEditValue
      });
      this.nodeEdit = null;
      this.board.editing = false
    },
    contextMenuChoice(option) {
      this.undoManager.execute("createNode", {
        ...option,
        pos: this.contextMenu.createAtPoint,
        //value: '...',
        //rawValue: '...'
      });
      this.contextMenu = null
    },
    goToMetaNode(node){
      this.undoManager.execute('changeGraph', {node})
      this.undoManager.graph = node.graph || node
      this.metaNodeStack = this.graph.getEachNodeAtPath(this.graph.getNodePath(node))
    }
  },
  computed:{
    outputTextFixed(){
      return frenchFixer(this.outputText)
    },
    user(){
      return this.$store.state.user
    }
  },
  watch: {
    state(state) {
      this.build();
    }
  }
};
</script>
