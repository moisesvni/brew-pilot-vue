import axios from 'axios'

/**
 * Instância axios compartilhada por todos os serviços.
 * Injeta automaticamente o Bearer token e tenta renovar em 401.
 */
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  timeout: 10000,
})

// Injeta o access token em cada requisição
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('brew_access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Renova o access token automaticamente em caso de 401
apiClient.interceptors.response.use(
  res => res,
  async error => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      const refreshToken = localStorage.getItem('brew_refresh_token')
      if (refreshToken) {
        try {
          const { data } = await axios.post(
            `${import.meta.env.VITE_API_URL ?? '/api'}/auth/refresh`,
            { refreshToken }
          )
          localStorage.setItem('brew_access_token',  data.accessToken)
          localStorage.setItem('brew_refresh_token', data.refreshToken)
          original.headers.Authorization = `Bearer ${data.accessToken}`
          return apiClient(original)
        } catch {
          localStorage.removeItem('brew_access_token')
          localStorage.removeItem('brew_refresh_token')
          localStorage.removeItem('brew_user')
          window.location.hash = '/login'
        }
      }
    }
    return Promise.reject(error)
  }
)

export default apiClient
