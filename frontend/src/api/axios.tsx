import { authToken } from '@/auth/auth-token'
import axios from 'axios'

const environment = import.meta.env.VITE_ENVIRONMENT || 'development'
const isDevelopment = environment === 'development'

const url = isDevelopment
  ? 'http://localhost:3333'
  : import.meta.env.VITE_BACKEND_API_URL

export const api = axios.create({
  baseURL: url,
  withCredentials: !isDevelopment, // Para cookies
})

let isRedirecting = false

// Interceptor para adicionar token nas requisições
api.interceptors.request.use(
  (config) => {
    const token = authToken.get()

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    } else {
      console.error('⚠️ No token found in localStorage')
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !isRedirecting) {
      isRedirecting = true
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
      setTimeout(() => {
        isRedirecting = false
      }, 1000)
    }
    return Promise.reject(error)
  },
)
