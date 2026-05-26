import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '../services/auth.service'
import type { AuthUser, LoginRequest, OAuthLoginRequest, RegisterRequest } from '../types/auth'
import { UserPlan } from '../types/auth'

const ACCESS_TOKEN_KEY  = 'brew_access_token'
const REFRESH_TOKEN_KEY = 'brew_refresh_token'
const USER_KEY          = 'brew_user'

export const useAuthStore = defineStore('auth', () => {
  // ── State ──────────────────────────────────────────────────────────────────
  const user         = ref<AuthUser | null>(loadUser())
  const accessToken  = ref<string | null>(localStorage.getItem(ACCESS_TOKEN_KEY))
  const refreshToken = ref<string | null>(localStorage.getItem(REFRESH_TOKEN_KEY))

  // ── Getters ────────────────────────────────────────────────────────────────
  const isAuthenticated = computed(() => !!accessToken.value && !!user.value)
  const isPro           = computed(() => user.value?.plan === UserPlan.Pro)

  // ── Actions ────────────────────────────────────────────────────────────────
  async function login(credentials: LoginRequest) {
    const result = await authService.login(credentials)
    _persist(result)
  }

  async function register(data: RegisterRequest) {
    const result = await authService.register(data)
    _persist(result)
  }

  async function oauthLogin(data: OAuthLoginRequest) {
    const result = await authService.oauthLogin(data)
    _persist(result)
  }

  async function refresh() {
    if (!refreshToken.value) throw new Error('Sem refresh token.')
    const result = await authService.refresh(refreshToken.value)
    _persist(result)
  }

  async function logout() {
    if (refreshToken.value) {
      await authService.logout(refreshToken.value).catch(() => undefined)
    }
    _clear()
  }

  // ── Helpers ────────────────────────────────────────────────────────────────
  function _persist(result: { accessToken: string; refreshToken: string; userId: string; email: string; name: string; plan: string }) {
    accessToken.value  = result.accessToken
    refreshToken.value = result.refreshToken
    user.value = {
      userId: result.userId,
      email:  result.email,
      name:   result.name,
      avatarUrl: null, 
      plan:   result.plan as UserPlan,
    }
    localStorage.setItem(ACCESS_TOKEN_KEY,  result.accessToken)
    localStorage.setItem(REFRESH_TOKEN_KEY, result.refreshToken)
    localStorage.setItem(USER_KEY, JSON.stringify(user.value))
  }

  function _clear() {
    user.value         = null
    accessToken.value  = null
    refreshToken.value = null
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }

  return { user, accessToken, isAuthenticated, isPro, login, register, oauthLogin, refresh, logout }
})

function loadUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}
