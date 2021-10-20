import { createRouter, createWebHistory } from 'vue-router'
import store from '@/store'
import axios from 'axios'

const routerHistory = createWebHistory()

const router = createRouter({
  history: routerHistory,
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import(/* webpackChunkName:'Home' */'@/views/Home.vue')
    },
    {
      path: '/login',
      name: 'login',
      component: () => import(/* webpackChunkName:'Login' */'@/views/Login.vue'),
      meta: { redireactAlreadyLogin: true }
    },
    {
      path: '/signup',
      name: 'signup',
      component: () => import(/* webpackChunkName:'SignUp' */'@/views/SignUp.vue'),
      meta: { redireactAlreadyLogin: true }
    },
    {
      path: '/posts/:id',
      name: 'post',
      component: () => import(/* webpackChunkName:'PostDatail' */'@/views/PostDetail.vue')
    },
    {
      path: '/column/:id',
      name: 'columnDetail',
      component: () => import(/* webpackChunkName:'ColumnDetail' */'@/views/ColumnDetail.vue')
    },
    {
      path: '/create',
      name: 'CreatePost',
      component: () => import(/* webpackChunkName:'CreatePost' */'@/views/CreatePost.vue'),
      meta: { requiredLogin: true }
    },
    {
      path: '/edit',
      name: 'edit',
      component: () => import(/* webpackChunkName:'CreatePost' */'@/views/EditProfile.vue'),
      meta: { requiredLogin: true }
    }
  ]
})
router.beforeEach((to, from, next) => {
  const { user, token } = store.state
  const { requiredLogin, redirectAlreadyLogin } = to.meta
  if (!user.isLogin) {
    if (token) {
      axios.defaults.headers.common.Authorization = `Bearer ${token}`
      store.dispatch('fetchCurrentUser').then(() => {
        if (redirectAlreadyLogin) {
          next('/')
        } else {
          next()
        }
      }).catch(e => {
        console.error(e)
        localStorage.removeItem('token')
        next('login')
      })
    } else {
      if (requiredLogin) {
        next('login')
      } else {
        next()
      }
    }
  } else {
    if (redirectAlreadyLogin) {
      next('/')
    } else {
      next()
    }
  }
})

export default router
