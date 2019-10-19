import Vue from 'vue'
import VueRouter from 'vue-router'
import Help from './components/Help.vue'
import Homepage from './components/Homepage.vue'
import Editor from './components/Editor.vue'
import Login from './components/Login.vue'
import Register from './components/Register.vue'
import Admin from './components/Admin.vue'
import AdminUser from './components/AdminUser.vue'
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
      path: '/login',
      component: Login
    },
    {
      path: '/register',
      component: Register
    },
    {
      path: '/graph',
      component: Editor,
      props: true
    },
    {
      path: '/graph/:graphId',
      component: Editor,
      props: true
    },
    {
      path: '/@:username/:graphId',
      component: Editor,
      props: true
    },
    {
      path: '/admin',
      component: Admin
    },
    {
      path: '/admin/user/:userId',
      component: AdminUser,
      props: true
    }
  ]
})
