import { ref } from 'vue'
import { authService } from '@/services/auth.service'
import { useAuthStore } from '@/stores/authStore'

// ── Tipagens globais (carregadas via script tag) ───────────────────────────
declare const google: {
  accounts: {
    id: {
      initialize: (config: object) => void
      renderButton: (el: HTMLElement, opts: object) => void
      prompt: () => void
    }
  }
}
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string

// ── Loader de scripts externos ────────────────────────────────────────────
function loadScript(src: string, id: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.getElementById(id)) { resolve(); return }
    const s = document.createElement('script')
    s.id    = id
    s.src   = src
    s.defer = true
    s.onload  = () => resolve()
    s.onerror = () => reject(new Error(`Falha ao carregar ${src}`))
    document.head.appendChild(s)
  })
}

// ── Google: inicializa uma única vez ──────────────────────────────────────
let googleInitialized = false

async function ensureGoogleInitialized() {
  if (!GOOGLE_CLIENT_ID) return false
  await loadScript('https://accounts.google.com/gsi/client', 'gsi-script')
  if (!googleInitialized) {
    google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback:  ({ credential }: { credential: string }) => {
        const authStore = useAuthStore()
        loginWithOAuthInternal(authStore, credential)
      },
      ux_mode: 'popup',
    })
    googleInitialized = true
  }
  return true
}

// ── Composable ─────────────────────────────────────────────────────────────
export function useOAuth() {
  const loading  = ref(false)
  const error    = ref('')
  const authStore = useAuthStore()

  // ── Google ────────────────────────────────────────────────────────────────
  async function initGoogle(buttonEl: HTMLElement) {
    const ok = await ensureGoogleInitialized()
    if (!ok) return
    google.accounts.id.renderButton(buttonEl, {
      type:  'standard',
      theme: 'outline',
      size:  'large',
      text:  'continue_with',
      shape: 'rectangular',
      width: 320,
    })
  }

  async function googleOneTap() {
    const ok = await ensureGoogleInitialized()
    if (!ok) return
    google.accounts.id.prompt()
  }

  // ── Envio para o backend ──────────────────────────────────────────────────
  async function loginWithOAuth(provider: 'google' | 'apple', idToken: string) {
    loading.value = true
    error.value   = ''
    try {
      await authStore.oauthLogin({ provider, idToken })
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { error?: string } } })?.response?.data?.error
      error.value = msg ?? `Falha ao entrar com ${provider}.`
    } finally {
      loading.value = false
    }
  }

  return { loading, error, initGoogle, googleOneTap, loginWithOAuth }
}

// Função interna usada pelo callback do Google (fora do composable)
async function loginWithOAuthInternal(
  authStore: ReturnType<typeof useAuthStore>,
  credential: string
) {
  try {
    await authStore.oauthLogin({ provider: 'google', idToken: credential })
    // Extrai foto do JWT do Google como fallback caso o backend não retorne
    if (!authStore.user?.avatarUrl) {
      try {
        const payload = JSON.parse(atob(credential.split('.')[1]!)) as { picture?: string }
        if (payload.picture) authStore.setAvatarUrl(payload.picture)
      } catch { /* ignore */ }
    }
  } catch {
    // erro já tratado pelo interceptor do apiClient
  }
}
