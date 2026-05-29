<template>
  <div class="lp-root" :style="{ backgroundImage: `url(${bg})` }">
    <!-- Logo topo-esquerda -->
    <div class="lp-header">
      <div class="lp-brand row items-center no-wrap">
        <div class="lp-icon" />
        <div class="q-ml-xl">
            <img :src="logoImg" alt="BrewPilot" class="lp-brand-logo" />
        </div>
      </div>
    </div>
    <!-- Card de login centralizado -->
    <div class="lp-center">
      <q-card class="lp-card" dark>
        <!-- Identidade no topo do card -->
        <q-card-section class="text-center q-pb-sm q-pt-md">
          <img :src="logoLoginImg" alt="BrewPilot" class="lp-card-logo" />
        </q-card-section>
        <!-- Formulário (email + senha + entrar) -->
        <q-card-section class="q-pt-sm q-pb-xs">
          <q-form @submit.prevent="handleLogin" class="q-gutter-sm">
            <q-input
              v-model="form.email"
              label="E-mail"
              type="email"
              outlined
              dense
              dark
              label-color="grey-5"
              :rules="[v => !!v || 'E-mail obrigatório']"
            />
            <q-input
              v-model="form.password"
              label="Senha"
              :type="showPwd ? 'text' : 'password'"
              outlined
              dense
              dark
              label-color="grey-5"
              :rules="[v => !!v || 'Senha obrigatória']"
            >
              <template #append>
                <q-icon
                  :name="showPwd ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  color="grey-5"
                  @click="showPwd = !showPwd"
                />
              </template>
            </q-input>

            <q-banner v-if="errorMsg" rounded class="bg-negative text-white q-py-xs">
              {{ errorMsg }}
            </q-banner>

            <q-btn
              label="ENTRAR"
              type="submit"
              color="primary"
              text-color="dark"
              class="full-width"
              :loading="loading"
              unelevated
              no-caps
            />
          </q-form>
        </q-card-section>

        <!-- Divisor -->
        <q-card-section class="q-py-xs">
          <div class="row items-center">
            <q-separator dark class="col" />
            <span class="text-caption text-grey-6 q-px-sm">ou</span>
            <q-separator dark class="col" />
          </div>
        </q-card-section>

        <!-- Ícones sociais lado a lado -->
        <q-card-section class="text-center q-py-sm">
          <!-- div oculto para o SDK do Google inicializar -->
          <div ref="googleBtnEl" style="display:none" />

          <div class="row justify-center q-gutter-md">
            <q-btn
              round
              outline
              size="md"
              color="grey-5"
              :loading="oauthLoading"
              @click="loginWithGoogle"
            >
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                width="22" height="22" alt="Google"
                style="display:block"
              />
            </q-btn>

          </div>

          <q-banner v-if="oauthError" rounded class="bg-negative text-white q-py-xs q-mt-sm">
            {{ oauthError }}
          </q-banner>
        </q-card-section>

        <!-- Rodapé -->
        <q-card-section class="text-center q-pt-xs q-pb-md">
          <span class="text-grey-5 text-caption">Não tem conta? </span>
          <router-link to="/register" class="lp-register-link">Cadastre-se</router-link>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useOAuth } from '@/composables/useOAuth'
import bgDeskImg   from '@/assets/back-desk.png'
import bgMobileImg from '@/assets/back-mobile.png'
import logoImg      from '@/assets/logo-brew-right-full.png'
import logoLoginImg from '@/assets/logo-brew-right-only-label.png'

const router    = useRouter()
const route     = useRoute()
const authStore = useAuthStore()

const { loading: oauthLoading, error: oauthError, initGoogle, googleOneTap } = useOAuth()

const form     = ref({ email: '', password: '' })
const showPwd  = ref(false)
const loading  = ref(false)
const errorMsg = ref('')

const googleBtnEl = ref<HTMLElement>()

// Background responsivo via import (garante que o Vite processa o asset)
const isMobile = ref(window.innerWidth < 600)
function onResize() { isMobile.value = window.innerWidth < 600 }
onMounted(() => {
  window.addEventListener('resize', onResize)
  if (googleBtnEl.value) initGoogle(googleBtnEl.value)
})
onUnmounted(() => window.removeEventListener('resize', onResize))
const bg = computed(() => isMobile.value ? bgMobileImg : bgDeskImg)

// Aciona o popup do Google (SDK já inicializado via initGoogle)
async function loginWithGoogle() {
  await googleOneTap()
}

watch(() => authStore.isAuthenticated, async (val) => {
  if (val) {
    const redirect = (route.query.redirect as string) ?? '/'
    await router.push(redirect)
  }
})

async function handleLogin() {
  loading.value  = true
  errorMsg.value = ''
  try {
    await authStore.login(form.value)
    const redirect = (route.query.redirect as string) ?? '/'
    await router.push(redirect)
  } catch (e: unknown) {
    const msg = (e as { response?: { data?: { error?: string } } })?.response?.data?.error
    errorMsg.value = msg ?? 'E-mail ou senha inválidos.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* ── Root / Background ────────────────────────────────────────────────────── */
.lp-root {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
}

.lp-root::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.32);
  pointer-events: none;
}

/* ── Header / Logo ────────────────────────────────────────────────────────── */
.lp-header {
  position: absolute;
  z-index: 1;
  padding: 80px 84px;
  /* impede que o header cause overflow horizontal no documento */
  max-width: 100vw;
  box-sizing: border-box;
  overflow: hidden;
}

.lp-brand {
  cursor: default;
  user-select: none;
}

.lp-icon {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background-size: 145%;
  background-position: center 4%;
  flex-shrink: 0;
}

.lp-brand-logo {
  width: 100%;
  max-width: 680px;
  height: auto;
}

.lp-brew  { color: #ffffff; }
.lp-pilot { color: #c1710e; }

.lp-tagline {
  font-size: 0.5rem;
  color: rgba(255, 255, 255, 0.4);
  letter-spacing: 0.1em;
  margin-top: 2px;
}

/* ── Card ─────────────────────────────────────────────────────────────────── */
.lp-center {
  position: relative;
  z-index: 1;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px 20px 160px;
  padding-top: 220px; /* empurra o card abaixo da logo no desktop */
}

.lp-card {
  width: 100%;
  max-width: 400px;
  border-radius: 16px;
  background: rgba(10, 10, 14, 0.90) !important;
  backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.07);
}


/* ── Identidade dentro do card ────────────────────────────────────────────── */
.lp-card-logo {
  width: 100%;
  max-width: 260px;
  height: auto;
  border-radius: 8px;
}

/* ── Mobile ───────────────────────────────────────────────────────────────── */
@media (max-width: 599px) {
  /* no mobile o root ocupa exatamente a tela, layout em fluxo */
  .lp-root {
    height: 100vh;
    overflow: hidden;
    flex-direction: column;
  }

  /* header sai do position:absolute e entra no fluxo */
  .lp-header {
    position: relative;
    z-index: 1;
    padding: 10vh 24px 16px;
    text-align: center;
    flex-shrink: 0;
  }

  .lp-icon {
    display: none;
  }

  .lp-brand {
    justify-content: center;
  }

  .lp-brand > div {
    margin-left: 0 !important;
  }

  /* logo maior e centralizada no mobile */
  .lp-brand-logo {
    max-width: 450px;
  }

  /* mais espaço entre logo e card */
  .lp-center {
    padding: 92px 16px 24px;
    align-items: flex-start;
    overflow-y: auto;
  }

  .lp-card {
    padding: 0 4px;
  }

  /* logo dentro do card menor no mobile */
  .lp-card-logo {
    max-width: 160px;
  }
}

/* ── Misc ─────────────────────────────────────────────────────────────────── */
.lp-register-link {
  color: #c1710e;
  font-weight: 600;
  font-size: 0.8rem;
  text-decoration: none;
}

.lp-register-link:hover {
  text-decoration: underline;
}
</style>

