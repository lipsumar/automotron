import Vue from 'vue'
import Vuex from 'vuex'
import graphStoreService from './services/GraphStoreService';
import emptyGraph from './data/emptyGraph.json'
import api from './api'

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
      error: false,
      id: null,
    },
    generatorList:{
      loading: false,
      error: false,
      data: null
    },
    user: null
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
    saveEditorGraphSuccess(state, id){
      state.saveEditorGraph.loading = false
      state.saveEditorGraph.error = false
      state.saveEditorGraph.id = id
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
    },
    loggedIn(state, payload){
      state.user = payload
    }
  },
  actions:{
    loadEditorGraph(ctx, payload){
      ctx.commit('editorGraphStartFetch')
      api.getGraph(payload.id).then(graph => {
        ctx.commit('editorGraphDoneFetch', {graph})
      }).catch(error => {
        ctx.commit('editorGraphDoneFetch', {error})
      })
    },
    saveEditorGraph(ctx, payload){
      ctx.commit('saveEditorGraphStart')
      api.saveGraph(payload.id, payload.graphData, payload.graphData.name).then(graph => {
        ctx.commit('saveEditorGraphSuccess', graph._id)
      })
    },
    fetchGeneratorList(ctx){
      ctx.commit('generatorListStartFetch');
      api.getGraphList().then(graphs => {
        ctx.commit('generatorListDoneFetch', {
          data: graphs
        })
      })      
    },
    newEditorGraph(ctx){
      ctx.commit('editorGraphDoneFetch', {
        graph: {graphData: emptyGraph}
      })
    }
  }
})