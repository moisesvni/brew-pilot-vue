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
declare const AppleID: {
  auth: {
    init: (config: object) => void
    signIn: () => Promise<{ authorization: { id_token: string } }>
  }
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string
const APPLE_CLIENT_ID  = import.meta.env.VITE_APPLE_CLIENT_ID  as string
const APPLE_REDIRECT   = import.meta.env.VITE_APPLE_REDIRECT_URI ?? window.location.origin

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

// ── Composable ─────────────────────────────────────────────────────────────
export function useOAuth() {
  const loading  = ref(false)
  const error    = ref('')
  const authStore = useAuthStore()

  // ── Google ────────────────────────────────────────────────────────────────
  async function initGoogle(buttonEl: HTMLElement) {
    await loadScript('https://accounts.google.com/gsi/client', 'gsi-script')
    google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback:  ({ credential }: { credential: string }) => loginWithOAuth('google', credential),
      ux_mode:   'popup',
    })
    google.accounts.id.renderButton(buttonEl, {
      type:  'standard',
      theme: 'outline',
      size:  'large',
      text:  'continue_with',
      shape: 'rectangular',
      width: '100%',
    })
  }

  async function googleOneTap() {
    await loadScript('https://accounts.google.com/gsi/client', 'gsi-script')
    google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback:  ({ credential }: { credential: string }) => loginWithOAuth('google', credential),
    })
    google.accounts.id.prompt()
  }

  // ── Apple ─────────────────────────────────────────────────────────────────
  async function loginWithApple() {
    await loadScript(
      'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js',
      'apple-script'
    )
    AppleID.auth.init({
      clientId:    APPLE_CLIENT_ID,
      scope:       'name email',
      redirectURI: APPLE_REDIRECT,
      usePopup:    true,
    })
    loading.value = true
    error.value   = ''
    try {
      const res = await AppleID.auth.signIn()
      await loginWithOAuth('apple', res.authorization.id_token)
    } catch (e: unknown) {
      if ((e as { error?: string })?.error !== 'popup_closed_by_user') {
        error.value = 'Falha ao entrar com Apple.'
      }
    } finally {
      loading.value = false
    }
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

  return { loading, error, initGoogle, googleOneTap, loginWithApple, loginWithOAuth }
}
