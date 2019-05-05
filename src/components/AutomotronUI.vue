<template>
  <div class="automotron-ui">
    <div ref="container"></div>
    <div id="node-menu">
      <div class="node-menu__item">list</div>
      <div class="node-menu__item">split</div>
    </div>
    <button class="play" @click="run">run</button>
    <div id="output" class="open">
      <div class="output__handle">
        <label>output</label>
      </div>
      <div class="output__body">{{outputText}}</div>
    </div>
  </div>
</template>

<script>
import AutomotronBoardUI from '../ui/BoardUI.js'
import AutomotronGraph from '../automotron/Graph.js'

export default {
  props:{
    state: {
      type: Object,
      required: true
    }
  },
  mounted(){
    console.log('Mounted UI', this.state)
    this.graph = new AutomotronGraph(this.state)
    this.board = new AutomotronBoardUI({
      el: this.$refs.container,
      graph: this.graph,
      width: window.innerWidth,
      height: window.innerHeight
    })
  },
  data: function(){
    return {
      outputText: ''
    }
  },
  methods:{
    run(){
      this.graph.run().then(sequence => {
        this.outputText = sequence.map(i => i.value).join(' ')
      })
    }
  }
}
</script>
