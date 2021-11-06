import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index'
import store from './store/index'
import axios from 'axios'

axios.defaults.baseURL = 'http://apis.imooc.com/api'

axios.interceptors.request.use(config => {
  store.commit('setLoading', true)
  const icode = '90E8E6B777DAC04B'
  config.params = { ...config.params, icode }
  if (config.data instanceof FormData) {
    config.data.append('icode', icode)
  } else {
    config.data = { ...config.data, icode }
  }
  return config
})

axios.interceptors.response.use(config => {
  store.commit('setLoading', false)
  return config
}, e => {
  const { error } = e.response.data
  console.log('error', error)
  store.commit('setError', { status: true, message: error })
  store.commit('setLoading', false)
  return Promise.reject(e.response.data)
})
const app = createApp(App)
app.use(router)
app.use(store)
app.mount('#app')
