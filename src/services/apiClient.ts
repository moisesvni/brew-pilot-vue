import axios from 'axios'
import { Notify } from 'quasar'

// ---------------------------------------------------------------------------
// Notificações globais — pode ser usado em qualquer lugar do app
// ---------------------------------------------------------------------------

export const notifyError = (message: string, type: 'error' | 'warning' = 'error') => {
  Notify.create({
    progress: true,
    message,
    color: type === 'error' ? 'negative' : 'warning',
    textColor: 'white',
    position: 'top-right',
    icon: type === 'error' ? 'mdi-alert-circle' : 'mdi-information',
    html: true,
  })
}

// ---------------------------------------------------------------------------
// Instância axios compartilhada por todos os serviços
// ---------------------------------------------------------------------------

const apiBaseURL = import.meta.env.VITE_API_URL ?? import.meta.env.VITE_BASE_URL ?? '/api'

function resolveTimeout(): number {
  const rawTimeout = import.meta.env.VITE_API_TIMEOUT_MS
  if (rawTimeout !== undefined && rawTimeout !== '') {
    const parsed = Number(rawTimeout)
    if (Number.isFinite(parsed) && parsed >= 0) return parsed
  }

  return import.meta.env.DEV ? 0 : 60000
}

const apiClient = axios.create({
  baseURL: apiBaseURL,
  timeout: resolveTimeout(),
})

// Injeta o access token em cada requisição
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('brew_access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Trata respostas de erro: renova token em 401, notifica os demais
apiClient.interceptors.response.use(
  res => res,
  async error => {
    const original = error.config
    const status: number | undefined = error.response?.status
    const serverMessage: string | undefined = error.response?.data?.message

    // 401 — tenta renovar token antes de notificar
    if (status === 401 && !original._retry) {
      original._retry = true
      const refreshToken = localStorage.getItem('brew_refresh_token')
      if (refreshToken) {
        try {
          const { data } = await axios.post(
            `${apiBaseURL}/auth/refresh`,
            { refreshToken },
            { timeout: resolveTimeout() }
          )
          localStorage.setItem('brew_access_token', data.accessToken)
          localStorage.setItem('brew_refresh_token', data.refreshToken)
          original.headers.Authorization = `Bearer ${data.accessToken}`
          return apiClient(original)
        } catch {
          // refresh falhou — limpa sessão e redireciona
          localStorage.removeItem('brew_access_token')
          localStorage.removeItem('brew_refresh_token')
          localStorage.removeItem('brew_user')
          window.location.hash = '/login'
          return Promise.reject(error)
        }
      }
      notifyError('Sessão expirada. Faça login novamente.')
    } else if (status === 400) {
      notifyError(serverMessage ?? 'Requisição inválida.', 'warning')
    } else if (status === 403) {
      notifyError('Acesso negado.')
    } else if (status !== undefined && status >= 500) {
      notifyError('Erro no servidor. Tente novamente mais tarde.')
    } else if (error.code === 'ECONNABORTED') {
      notifyError('Tempo limite da requisição excedido. Tente novamente em instantes.', 'warning')
    } else if (status === undefined) {
      notifyError(`Falha de conexão: ${error.message}`)
    }

    return Promise.reject(error)
  }
)

export default apiClient
