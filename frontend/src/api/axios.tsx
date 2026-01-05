import axios from 'axios'

const url = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:3333'

export const api = axios.create({
  baseURL: url,
  withCredentials: true,
})
