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

    <div id="buttons" v-if="graphObj">
      <button @click="$router.push('/')">&lt;&lt;</button>
      <button @click="run">run</button>
      <button @click="newGraph()" v-if="user">new</button>
      <template v-if="user && (user._id===graphObj.userId || !graphObj.userId)">
        <button @click="save()">save</button>
        <label style="margin-right:0.3em" v-if="user && user._id===graphObj.userId">
          <input type="checkbox" v-model="autosaveEnabled"> autosave
        </label>
      </template>
      <button @click="fork()" v-if="user && typeof graphObj.userId != 'undefined' && user._id!==graphObj.userId">fork</button>
      <button @click="undo" :disabled="!hasUndo" v-if="user">←</button>
      <button @click="redo" :disabled="!hasRedo" v-if="user">→</button>
      <router-link to="/login" v-if="!user">Login</router-link>
    </div>

    <div id="output" :class="{open:outputOpen}">
      <div class="output__handle" @click="outputOpen = !outputOpen">
        <label>output</label>
      </div>
      <div class="output__body">
        <p v-html="outputText.split('\\n').join('<br>')" style="display:none"></p>
        <!-- <hr/> -->
        <div class="graph-error" v-if="graphRuntimeError">
          <div class="graph-error__message">Error: {{graphRuntimeError.message}}</div>
          <div class="graph-error__extended-message">
            {{graphRuntimeError.extendedMessage}}
          </div>
        </div>
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
import debounce from 'lodash.debounce';
import GraphRuntimeError from '../automotron/errors/GraphRuntimeError';
import axios from 'axios';

export default {
  props: {
    graphObj: {
      type: Object,
      required: true
    }
  },
  mounted() {
    console.log("Mounted UI", this.graphObj.graphData);
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
        { type: "generator", generator: "external-graph" },
        { type: "generator", generator: "dynamic-list" },
        { type: "operator", operator: "split" },
        { type: "operator", operator: "loop" },
        { type: "operator", operator: "tag" },
        { type: "operator", operator: "logic" },
      ],
      outputOpen: true,
      autosaveEnabled: false,
      graphRuntimeError: null,
    };
  },
  methods: {
    build() {
      this.graph = new AutomotronGraph(this.graphObj.graphData.graph, {
        apiBaseUrl: window.location.href.includes('localhost') ? 'http://localhost:3000' : '',
        axios
      });
      this.board = new AutomotronBoardUI({
        el: this.$refs.container,
        graph: this.graph,
        width: window.innerWidth,
        height: window.innerHeight,
        readOnly: this.user ? false : true,
      });
      this.board.on('setEditValue', () => {
        this.submitNodeEdit()
      })
      console.log('==>',this.graphObj)
      if(this.graphObj.graphData.board){
        this.board.stage.position(this.graphObj.graphData.board.stage.pos)
        this.board.stage.scale(this.graphObj.graphData.board.stage.scale)
        this.board.stage.draw()
      }
    
      this.undoManager = new UndoManager(this.graph, this.board);
      this.debouncedSave = debounce(this.save.bind(this), 4000);
      this.undoManager.on("action", () => {
        this.hasUndo = this.undoManager.hasUndo();
        this.hasRedo = this.undoManager.hasRedo();
        if(this.autosaveEnabled){
          this.debouncedSave();
        }
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
      this.board.on('clickNothing', () => {
        this.contextMenu = null;
      })
      this.run()
    },
    run() {
      this.board.clearErrors()
      this.graphRuntimeError = null
      this.graph.run()
        .then(sequence => {
          console.log('OUTPUT SEQUENCE', sequence)
          this.outputText = sequence.map(i => i.value).join(" ");
        })
        .catch(err => {
          if(err instanceof GraphRuntimeError){
            this.board.setError(err, err.node.id)
            this.graphRuntimeError = err;
            return
          }
          throw err;
        })
    },
    save(){
      this.$emit('save', {
        graph: this.graph.normalize(), 
        board: this.board.getState()
      })
    },
    fork(){
      this.$emit('fork', {
        graph: this.graph.normalize(), 
        board: this.board.getState()
      })
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
    newGraph(){
      window.location.href='/graph'
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
