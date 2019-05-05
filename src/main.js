import Vue from 'vue'
import router from './router'
import App from './components/app.vue'

new Vue({
  el: '#app',
  router,
  render: h => h(App)
})