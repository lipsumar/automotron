import Vue from 'vue'
import VueRouter from 'vue-router'
import AutomotronUI from './components/AutomotronUI.vue'
import Help from './components/Help.vue'
import defaultGraph from './data/defaultGraph.json'

Vue.use(VueRouter)

export default new VueRouter({
  mode: 'history',
  routes: [
    {
      path: '/',
      component: AutomotronUI,
      props: {
        state: defaultGraph
      }
    },
    {
      path: '/help',
      component: Help
    }
  ]
})
