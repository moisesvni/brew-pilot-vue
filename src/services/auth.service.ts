import apiClient from './apiClient'
import type { AuthResult, LoginRequest, OAuthLoginRequest, RegisterRequest } from '../types/auth.types'

export const authService = {
  register: (data: RegisterRequest) =>
    apiClient.post<AuthResult>('/auth/register', data).then(r => r.data),

  login: (data: LoginRequest) =>
    apiClient.post<AuthResult>('/auth/login', data).then(r => r.data),

  oauthLogin: (data: OAuthLoginRequest) =>
    apiClient.post<AuthResult>('/auth/oauth', data).then(r => r.data),

  refresh: (refreshToken: string) =>
    apiClient.post<AuthResult>('/auth/refresh', { refreshToken }).then(r => r.data),

  logout: (refreshToken: string) =>
    apiClient.post('/auth/logout', { refreshToken }),
}
