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
      >{{op.type}}: {{op.generator || op.operator}}</div>
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

    <div id="buttons">
      <button @click="$router.push('/')">&lt;&lt;</button>
      <button @click="run">run</button>
      <button @click="$router.push('/generator/new')">new</button>
      <button @click="$emit('save', {graph: graph.normalize(), board: board.getState()})">save</button>
      <button @click="undo" :disabled="!hasUndo">←</button>
      <button @click="redo" :disabled="!hasRedo">→</button>
    </div>

    <div id="output" :class="{open:outputOpen}">
      <div class="output__handle" @click="outputOpen = !outputOpen">
        <label>output</label>
      </div>
      <div class="output__body" v-html="outputText.split('\\n').join('<br>')"></div>
    </div>
  </div>
</template>

<script>
import AutomotronBoardUI from "../ui/BoardUI.js";
import AutomotronGraph from "../automotron/Graph.js";
import eventBus from "../eventBus.js";
import UndoManager from "../commands/UndoManager.js";

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
      ],
      outputOpen: true
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
    },
    contextMenuChoice(option) {
      this.undoManager.execute("createNode", {
        ...option,
        pos: this.contextMenu.createAtPoint,
        value: '...',
        rawValue: '...'
      });
      this.contextMenu = null
    }
  },
  watch: {
    state(state) {
      this.build();
    }
  }
};
</script>
