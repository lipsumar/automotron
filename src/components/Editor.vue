<template>
  <div class="editor">
    <div v-if="loading">Loading...</div>
    <div v-else-if="error">Error: {{error}}</div>
    <div v-else>
      <AutomotronUI :state="graph" @save="save"></AutomotronUI>
    </div>
    <dialogs-wrapper transition-name="fade"></dialogs-wrapper>
  </div>
</template>

<script>
import AutomotronUI from './AutomotronUI'
import Prompt from './Prompt'
import { create } from 'vue-modal-dialogs'

const prompt = create(Prompt, 'title', 'content')

export default {
  props: ['generatorId'],
  data: function(){
    return {
      generatorName: null
    }
  },
  created(){
    this.$store.dispatch('loadEditorGraph', {id: this.generatorId})
    this.unsubscribe = this.$store.subscribe((mutation, state) => {
      if(mutation.type==='saveEditorGraphSuccess'){
        this.$toasted.show('saved', {icon: 'check'})
      }
    })
  },
  destroyed(){
    this.unsubscribe()
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
    name(){
      const graph = this.graph
      return graph.name || this.generatorName
    }
  },
  methods:{
    save(graph){
      graph.name = this.name
      Promise.resolve()
        .then(() => {
          if(!graph.name){
            return prompt('Save new generator', 'Please give a name to your generator')
          }
          return graph.name
        })
        .then(name => {
          if(name === false) return
          this.generatorName = name
          graph.name = name
          this.$store.dispatch('saveEditorGraph', {
            graph, 
            id: this.generatorId
          })
        })
    }
  }, 
  components:{
    AutomotronUI
  }
}
</script>

<style>

</style>
