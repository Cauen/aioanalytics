import Vue from 'vue'
import Router from 'vue-router'
import Users from './views/Users.vue'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: Users
    },
    {
      path: '/users',
      name: 'users',
      component: () => import(/* webpackChunkName: "about" */ './views/Users.vue')
    },
    {
      path: '/user/:id',
      name: 'user',
      component: () => import('./views/User.vue')
    }
  ]
})
