import Vue from 'vue'
import Vuex from 'vuex'
import graphStoreService from './services/GraphStoreService';
import emptyGraph from './data/emptyGraph.json'

Vue.use(Vuex)

export default new Vuex.Store({
  state:{
    editorGraph: {
      loading: false,
      error: false,
      data: null
    },
    saveEditorGraph:{
      loading: false,
      error: false
    },
    generatorList:{
      loading: false,
      error: false,
      data: null
    }
  },
  mutations:{
    editorGraphStartFetch(state){
      state.editorGraph.loading = true
      state.editorGraph.error = false
      state.editorGraph.data = null
    },
    editorGraphDoneFetch(state, payload){
      state.editorGraph.loading = false
      state.editorGraph.error = payload.error || false
      state.editorGraph.data = payload.graph || null
    },
    saveEditorGraphStart(state){
      state.saveEditorGraph.loading = true
      state.saveEditorGraph.error = false
    },
    saveEditorGraphSuccess(state){
      state.saveEditorGraph.loading = false
      state.saveEditorGraph.error = false
    },
    generatorListStartFetch(state){
      state.generatorList.loading = true
      state.generatorList.error = false
      state.generatorList.data = null
    },
    generatorListDoneFetch(state, payload){
      state.generatorList.loading = false
      state.generatorList.error = payload.error || false
      state.generatorList.data = payload.data || null
    }
  },
  actions:{
    loadEditorGraph(ctx, payload){
      ctx.commit('editorGraphStartFetch')
      graphStoreService.fetchGraph(payload.id).then(graph => {
        if(!graph){
          graph = {graph: emptyGraph}
        }
        ctx.commit('editorGraphDoneFetch', {graph})
      })
    },
    saveEditorGraph(ctx, payload){
      ctx.commit('saveEditorGraphStart')
      graphStoreService.saveGraph(payload.id, payload.graph).then(() => {
        ctx.commit('saveEditorGraphSuccess')
      })
    },
    fetchGeneratorList(ctx){
      //ctx.commit('generatorListStartFetch')
      ctx.commit('generatorListDoneFetch', {
        data: graphStoreService.getList()
      })
    }
  }
})