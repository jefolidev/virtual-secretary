import axios from 'axios'

const url = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:3333'

export const api = axios.create({
  baseURL: url,
  withCredentials: true,
})

// Interceptor para adicionar token nas requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para tratar respostas com erro 401 (token expirado)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido - limpar e redirecionar para login
      localStorage.removeItem('auth_token')
      // Recarregar página para resetar estado da aplicação
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
