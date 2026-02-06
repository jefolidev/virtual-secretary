import axios from 'axios'

const url = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:3333'

export const api = axios.create({
  baseURL: url,
  withCredentials: true, // Para cookies
})

let isRedirecting = false

// Interceptor para adicionar token nas requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    console.log('=== Axios Interceptor ===')
    console.log('Request URL:', config.url)
    console.log('Token from localStorage:', token)

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      console.log('✅ Authorization header set:', config.headers.Authorization)
    } else {
      console.log('⚠️ No token found in localStorage')
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
