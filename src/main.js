import Vue from 'vue'
import router from './router'
import store from './store'
import App from './components/app.vue'
import Toasted from 'vue-toasted';
import * as ModalDialogs from 'vue-modal-dialogs'

Vue.use(Toasted, {
  position: 'top-center',
  duration: 1300
})

Vue.use(ModalDialogs)

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})