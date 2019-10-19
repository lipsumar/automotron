<template>
  <div class="editor">
    <div v-if="loading">Loading...</div>
    <div v-else-if="error">Error: {{error}}</div>
    <div v-else>
      <AutomotronUI :graphObj="graph" @save="save" @fork="fork"></AutomotronUI>
    </div>
    <dialogs-wrapper transition-name="fade"></dialogs-wrapper>
  </div>
</template>

<script>
import AutomotronUI from './AutomotronUI'
import Prompt from './Prompt'
import { create } from 'vue-modal-dialogs'
import graphStoreService from '../services/GraphStoreService';

const prompt = create(Prompt, 'title', 'content')

export default {
  props: ['graphId'],
  data: function(){
    return {
      graphName: null
    }
  },
  created(){
    if(this.graphId) {
      this.$store.dispatch('loadEditorGraph', {id: this.graphId});
    }else {
      this.$store.dispatch('newEditorGraph');
    }
    
  },
  computed:{
    loading(){
      return this.$store.state.editorGraph.loading
    },
    error(){
      return this.$store.state.editorGraph.error
    },
    graph(){
      return this.$store.state.editorGraph.data
    },
    newGraphId(){
      return this.$store.state.saveEditorGraph.id
    },
    name(){
      const graph = this.graph
      return graph.name || this.graphName
    }
  },
  methods:{
    save(graph){
      graph.name = this.name
      Promise.resolve()
        .then(() => {
          if(!graph.name){
            return prompt('Save new graph', 'Please give a name to your graph')
          }
          return graph.name
        })
        .then(name => {
          if(name === false) return
          this.graphName = name
          graph.name = name
          this.$store.dispatch('saveEditorGraph', {
            graphData: graph, 
            id: this.graphId
          })
        })
    },
    fork(graph){
      prompt('Fork graph', 'Please give a name to this graph').then(name => {
        if(name===false) return
        graph.name = name
        this.$store.dispatch('saveEditorGraph', {
          graphData: graph,
        })
      })
    }
  }, 
  components:{
    AutomotronUI
  },
  watch:{
    newGraphId(newValue, oldValue){
      console.log({newValue, oldValue, curGraphId: this.graphId})
      if(!this.graphId){
        this.graphId = newValue;
        this.$router.replace('/graph/'+this.graphId)
      }
      if(this.graphId !== newValue){
        // fork just saved
        this.$router.replace('/graph/'+newValue)
        window.location.reload()
      }
    }
  }
}
</script>

<style>

</style>
