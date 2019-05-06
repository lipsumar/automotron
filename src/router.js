import Vue from 'vue'
import VueRouter from 'vue-router'
import Help from './components/Help.vue'
import Homepage from './components/Homepage.vue'
import Editor from './components/Editor.vue'
import graphStoreService from './services/GraphStoreService'

Vue.use(VueRouter)

export default new VueRouter({
  mode: 'history',
  routes: [
    {
      path: '/',
      component: Homepage
    },
    {
      path: '/help',
      component: Help
    },
    {
      path: '/generator/new',
      redirect: () => {
        return `/generator/${graphStoreService.getFreeId()}`
      }
    },
    {
      path: '/generator/:generatorId',
      component: Editor,
      props: true
    }
  ]
})
