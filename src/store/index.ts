import axios, { AxiosRequestConfig } from 'axios'
import { createStore, Commit } from 'vuex'
import { arrToObj, objToArr } from '../helper'

export interface Resptype<P = unknown>{
  code: number;
  msg: string;
  data:P;
}

export interface ImageProps {
  _id?: string;
  url?: string;
  createdAt?: string;
  fitUrl?: string;
}
export interface ColumnProps {
  _id: string;
  title: string;
  avatar?: ImageProps;
  description: string;
}

export interface UserProps{
  isLogin:boolean;
  nickName?: string;
  _id?: string;
  column?: string;
  email?:string;
  avatar?: ImageProps;
  description?: string;
}

export interface PostProps {
  _id?: string;
  title: string;
  excerpt?: string;
  content?: string;
  image?: ImageProps | string;
  createdAt?: string;
  column: string;
  author?: string | UserProps;
  isHTML?: boolean;
}

interface ListProps<P> {
  [id: string]: P;
}

export interface GlobalErrProps{
  status:boolean;
  message?:string;
}

export interface GlobalColumnsProps {
  data: ListProps<ColumnProps>;
  currentPage: number;
  total?: number;
}
export interface GlobalPostsProps {
  data: ListProps<PostProps>;
  loadedColumns: ListProps<{total?: number; currentPage?: number}>;
}

export interface GlobalDataProps{
  error: GlobalErrProps;
  token: string;
  loading: boolean;
  columns: GlobalColumnsProps;
  posts: GlobalPostsProps;
  user: UserProps;
}

const asyncAndCommit = async (url: string, mutationName: string,
  commit: Commit, config: AxiosRequestConfig = { method: 'get' }, extraData?: any) => {
  const { data } = await axios(url, config)
  if (extraData) {
    commit(mutationName, { data, extraData })
  } else {
    commit(mutationName, data)
  }
  return data
}

const store = createStore<GlobalDataProps>({
  state: {
    error: { status: false },
    token: localStorage.getItem('token') || '',
    loading: false,
    columns: { data: {}, currentPage: 0 },
    posts: { data: {}, loadedColumns: {} },
    user: { isLogin: false }
  },
  mutations: {
    createPost (state, newPost) {
      state.posts.data[newPost._id] = newPost
    },
    fetchColumns (state, rawData) {
      const { data } = state.columns
      const { list, count, currentPage } = rawData.data
      state.columns = {
        data: { ...data, ...arrToObj(list) },
        total: count,
        currentPage: currentPage * 1
      }
    },
    fetchColumn (state, rawData) {
      state.columns.data[rawData.data._id] = rawData.data
    },
    updateColumn (state, { data }) {
      state.columns.data[data._id] = data
    },
    fetchPosts (state, { data: rawData, extraData }) {
      const { data, loadedColumns } = state.posts
      const { list, count, currentPage } = rawData.data
      const listData = list as PostProps[]
      state.posts.data = { ...data, ...arrToObj(listData) }
      loadedColumns[extraData] = {
        total: count,
        currentPage
      }
    },
    fetchPost (state, rawData) {
      state.posts.data[rawData.data._id] = rawData.data
    },
    deletePost (state, { data }) {
      delete state.posts.data[data._id]
    },
    updatePost (state, { data }) {
      state.posts.data[data._id] = data
    },
    setLoading (state, status) {
      state.loading = status
    },
    setError (state, e: GlobalErrProps) {
      state.error = e
    },
    fetchCurrentUser (state, rawData) {
      state.user = { isLogin: true, ...rawData.data }
    },
    login (state, rawData) {
      const { token } = rawData.data
      state.token = token
      localStorage.setItem('token', token)
      axios.defaults.headers.common.Authorization = `Bearer ${token}`
    },
    updateUser (state, { data }) {
      state.user = { isLogin: true, ...data }
    },
    logout (state) {
      state.token = ''
      state.user = { isLogin: false }
      localStorage.removeItem('token')
      delete axios.defaults.headers.common.Authorization
    }
  },
  actions: {
    fetchColumns ({ state, commit }, params = {}) {
      const { currentPage = 1, pageSize = 6 } = params
      if (state.columns.currentPage < currentPage) {
        return asyncAndCommit(`/columns?currentPage=${currentPage}&pageSize=${pageSize}`, 'fetchColumns', commit)
      }
    },
    fetchColumn ({ state, commit }, cid) {
      if (!state.columns.data[cid]) {
        return asyncAndCommit(`/columns/${cid}`, 'fetchColumn', commit)
      }
    },
    fetchPosts ({ commit, state }, params = {}) {
      const { cid, currentPage = 1, pageSize = 5 } = params
      const { loadedColumns } = state.posts
      const loadedCurentPage = (loadedColumns[cid] && loadedColumns[cid].currentPage) || 0
      if (!Object.keys(loadedColumns).includes(cid) || loadedCurentPage < currentPage) {
        return asyncAndCommit(`/columns/${cid}/posts?currentPage=${currentPage}&pageSize=${pageSize}`,
          'fetchPosts', commit, { method: 'get' }, cid)
      }
    },
    fetchPost ({ state, commit }, id) {
      const currentPost = state.posts.data[id]
      if (!currentPost || !currentPost.content) {
        return asyncAndCommit(`/posts/${id}`, 'fetchPost', commit)
      } else {
        return Promise.resolve({ data: currentPost })
      }
    },
    updatePost ({ commit }, { id, payload }) {
      return asyncAndCommit(`/posts/${id}`, 'updatePost', commit, {
        method: 'patch',
        data: payload
      })
    },
    fetchCurrentUser ({ commit }) {
      return asyncAndCommit('/user/current', 'fetchCurrentUser', commit)
    },
    login ({ commit }, payload) {
      return asyncAndCommit('/user/login', 'login', commit, { method: 'post', data: payload })
    },
    createPost ({ commit }, payload) {
      return asyncAndCommit('/posts', 'createPost', commit, { method: 'post', data: payload })
    },
    deletePost ({ commit }, id) {
      return asyncAndCommit(`/posts/${id}`, 'deletePost', commit, { method: 'delete' })
    },
    updateColumn ({ commit }, { id, payload }) {
      return asyncAndCommit(`/columns/${id}`, 'updateColumn', commit, { method: 'patch', data: payload })
    },
    updateUser ({ commit }, { id, payload }) {
      return asyncAndCommit(`/user/${id}`, 'updateUser', commit, { method: 'patch', data: payload })
    },
    async loginAndFetch ({ dispatch }, loginData) {
      await dispatch('login', loginData)
      return await dispatch('fetchCurrentUser')
    }
  },
  getters: {
    getColumns: (state) => {
      return objToArr(state.columns.data)
    },
    getColumnById: (state) => (id: string) => {
      return state.columns.data[id]
    },
    getPostsByCid: (state) => (cid: string) => {
      return objToArr(state.posts.data).filter(post => post.column === cid)
    },
    getCurrentPost: (state) => (id: string) => {
      return state.posts.data[id]
    },
    getPostsCountByCid: (state) => (cid: string) => {
      if (state.posts.loadedColumns[cid]) {
        return state.posts.loadedColumns[cid].total
      } else {
        return 0
      }
    },
    getPostsCurrentPageByCid: (state) => (cid: string) => {
      if (state.posts.loadedColumns[cid]) {
        return state.posts.loadedColumns[cid].currentPage
      } else {
        return 0
      }
    }
  }
})

export default store
