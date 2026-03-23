import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'

const TOKEN_KEY = 'token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function removeToken() {
  localStorage.removeItem(TOKEN_KEY)
}

const apiClient = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

apiClient.interceptors.request.use(
  config => {
    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

apiClient.interceptors.response.use(
  response => {
    return response.data
  },
  error => {
    let message = '网络错误，请稍后重试'
    
    if (error.response) {
      const detail = error.response.data?.detail
      if (error.response.status === 401) {
        removeToken()
        window.location.href = '/login'
        message = '登录已过期，请重新登录'
      } else if (typeof detail === 'string') {
        message = detail
      } else if (Array.isArray(detail)) {
        message = detail.map(d => d.msg).join(', ')
      } else {
        message = `请求失败 (${error.response.status})`
      }
    } else if (error.request) {
      message = '无法连接到服务器，请检查后端是否启动'
    }
    
    ElMessage.error(message)
    return Promise.reject(error)
  }
)

export default {
  login(username, password) {
    return apiClient.post('/login', { username, password })
  },

  getItems(params) {
    return apiClient.get('/items', { params })
  },

  getItem(id) {
    return apiClient.get(`/items/${id}`)
  },

  createItem(data) {
    return apiClient.post('/items', data)
  },

  updateItem(id, data) {
    return apiClient.put(`/items/${id}`, data)
  },

  deleteItem(id) {
    return apiClient.delete(`/items/${id}`)
  },

  getStats() {
    return apiClient.get('/items/stats')
  }
}
