import Vue from 'vue'
import router from './router'
import store from './store'
import App from './components/app.vue'
import Toasted from 'vue-toasted';
import * as ModalDialogs from 'vue-modal-dialogs'
import api from './api';
import * as Sentry from '@sentry/browser';
import * as Integrations from '@sentry/integrations';

if(!window.location.href.includes('localhost')){
  Sentry.init({
    dsn: 'https://e1207784b6474d309aedf4e7f6b52fa2@sentry.io/1794011',
    integrations: [new Integrations.Vue({Vue, attachProps: true, logErrors: true})],
  });
}


Vue.use(Toasted, {
  position: 'top-center',
  duration: 1300
})

Vue.use(ModalDialogs)

Vue.prototype.$api = api;

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})