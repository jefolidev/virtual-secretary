import axios from 'axios'

const url = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:3333'

export const api = axios.create({
  baseURL: url,
  withCredentials: true, // Para cookies
})

let isRedirecting = false

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
  }
)
