<template>
  <div class="rp-root" :style="{ backgroundImage: `url(${bg})` }">
    <!-- Logo topo-esquerda -->
    <div class="rp-header">
      <div class="rp-brand row items-center no-wrap">
        <div class="rp-icon" />
        <div class="q-ml-xl">
          <img :src="logoImg" alt="BrewPilot" class="rp-brand-logo" />
        </div>
      </div>
    </div>

    <!-- Card de registro centralizado -->
    <div class="rp-center">
      <q-card class="rp-card" dark>
        <!-- Identidade no topo do card -->
        <q-card-section class="text-center q-pb-sm q-pt-md">
          <img :src="logoLoginImg" alt="BrewPilot" class="rp-card-logo" />
          <div class="text-caption text-grey-5 q-mt-xs">Crie sua conta</div>
        </q-card-section>

        <!-- Indicador de steps ──────────────────────────────────────────── -->
        <q-card-section class="q-pt-xs q-pb-sm">
          <div class="row justify-center items-center q-gutter-sm">
            <div class="step-dot" :class="{ 'step-dot--active': step === 1, 'step-dot--done': step > 1 }">
              <q-icon v-if="step > 1" name="check" size="10px" />
              <span v-else>1</span>
            </div>
            <div class="step-line" />
            <div class="step-dot" :class="{ 'step-dot--active': step === 2 }">
              <span>2</span>
            </div>
          </div>
          <div class="row justify-center items-center q-gutter-sm q-mt-xs">
            <span class="text-caption step-label" :class="step === 1 ? 'text-grey-4' : 'text-grey-6'">Identificação</span>
            <div style="width: 32px" />
            <span class="text-caption step-label" :class="step === 2 ? 'text-grey-4' : 'text-grey-6'">Segurança</span>
          </div>
        </q-card-section>

        <!-- ═══════════════════ STEP 1 ═══════════════════ -->
        <div v-if="step === 1">
          <!-- Seleção de plano ────────────────────────────────────────────── -->
          <q-card-section class="q-pb-xs q-pt-xs">
            <div class="text-caption text-grey-5 q-mb-xs">Escolha seu plano</div>
            <div class="row q-gutter-sm">
              <!-- Free -->
              <div
                class="col plan-card cursor-pointer"
                :class="{ 'plan-card--active': selectedPlan === 'Free' }"
                @click="selectedPlan = 'Free'"
              >
                <div class="text-subtitle2 text-weight-bold text-white">Grátis</div>
                <ul class="text-caption text-grey-5 q-pl-md q-mb-none">
                  <li>2 perfis de equipamento</li>
                  <li>Até 15 receitas</li>
                  <li>Todos os estilos BJCP</li>
                </ul>
                <div class="text-h6 text-weight-bold q-mt-xs text-primary">R$ 0</div>
              </div>

              <!-- Pro -->
              <div
                class="col plan-card plan-card--disabled"
                @click="showProInfo = true"
              >
                <div class="row items-center">
                  <div class="text-subtitle2 text-weight-bold text-white col">Pro</div>
                  <q-badge color="orange" label="Em breve" />
                </div>
                <ul class="text-caption text-grey-5 q-pl-md q-mb-none">
                  <li>Perfis ilimitados</li>
                  <li>Receitas ilimitadas</li>
                  <li>Exportar PDF / BeerXML</li>
                </ul>
                <div class="text-h6 text-weight-bold q-mt-xs text-orange-6">R$ 19/mês</div>
              </div>
            </div>
          </q-card-section>

          <!-- Google — cadastro rápido sem senha ──────────────────────────── -->
          <q-card-section class="q-py-sm">
            <div ref="googleBtnEl" style="display:none" />
            <q-btn
              class="full-width google-btn"
              unelevated
              outline
              no-caps
              :loading="oauthLoading"
              @click="loginWithGoogle"
            >
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                width="18" height="18" alt="Google"
                class="q-mr-sm"
                style="display:block"
              />
              <span>Cadastrar com Google</span>
            </q-btn>
            <q-banner v-if="oauthError" rounded class="bg-negative text-white q-py-xs q-mt-sm">
              {{ oauthError }}
            </q-banner>
          </q-card-section>

          <!-- Divisor ────────────────────────────────────────────────────── -->
          <q-card-section class="q-py-xs">
            <div class="row items-center">
              <q-separator dark class="col" />
              <span class="text-caption text-grey-6 q-px-sm">ou cadastre com e-mail</span>
              <q-separator dark class="col" />
            </div>
          </q-card-section>

          <!-- Campos step 1 ──────────────────────────────────────────────── -->
          <q-card-section class="q-pt-sm q-pb-xs">
            <q-form @submit.prevent="goToStep2" class="q-gutter-sm" ref="formStep1Ref">
              <q-input
                v-model="form.name"
                label="Nome"
                outlined
                dense
                dark
                label-color="grey-5"
                autocomplete="name"
                :rules="[v => !!v || 'Nome obrigatório']"
              />
              <q-input
                v-model="form.email"
                label="E-mail"
                type="email"
                outlined
                dense
                dark
                label-color="grey-5"
                autocomplete="email"
                :rules="[
                  v => !!v || 'E-mail obrigatório',
                  v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'E-mail inválido'
                ]"
              />

              <q-banner v-if="step1Error" rounded class="bg-negative text-white q-py-xs">
                {{ step1Error }}
              </q-banner>

              <q-btn
                label="CONTINUAR"
                type="submit"
                color="primary"
                text-color="dark"
                class="full-width"
                :loading="checkingEmail"
                unelevated
                no-caps
              />
            </q-form>
          </q-card-section>
        </div>

        <!-- ═══════════════════ STEP 2 ═══════════════════ -->
        <div v-else-if="step === 2">
          <!-- Boas vindas ─────────────────────────────────────────────────── -->
          <q-card-section class="q-pt-xs q-pb-sm text-center">
            <div class="text-body2 text-grey-4">
              Olá, <span class="text-white text-weight-medium">{{ form.name.split(' ')[0] }}</span>! Agora crie sua senha.
            </div>
          </q-card-section>

          <!-- Campos step 2 ──────────────────────────────────────────────── -->
          <q-card-section class="q-pt-xs q-pb-xs">
            <q-form @submit.prevent="handleRegister" class="q-gutter-sm" ref="formStep2Ref">
              <q-input
                v-model="form.password"
                label="Senha"
                :type="showPwd ? 'text' : 'password'"
                outlined
                dense
                dark
                label-color="grey-5"
                autocomplete="new-password"
                hint="Mínimo 8 caracteres"
                :rules="[v => v?.length >= 8 || 'Mínimo 8 caracteres']"
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

              <q-input
                v-model="form.confirmPassword"
                label="Repita a senha"
                :type="showPwdConfirm ? 'text' : 'password'"
                outlined
                dense
                dark
                label-color="grey-5"
                autocomplete="new-password"
                :rules="[v => v === form.password || 'As senhas não coincidem']"
              >
                <template #append>
                  <q-icon
                    :name="showPwdConfirm ? 'visibility_off' : 'visibility'"
                    class="cursor-pointer"
                    color="grey-5"
                    @click="showPwdConfirm = !showPwdConfirm"
                  />
                </template>
              </q-input>

              <q-banner v-if="errorMsg" rounded class="bg-negative text-white q-py-xs">
                {{ errorMsg }}
              </q-banner>

              <q-btn
                label="CRIAR CONTA GRÁTIS"
                type="submit"
                color="primary"
                text-color="dark"
                class="full-width"
                :loading="loading"
                unelevated
                no-caps
              />

              <q-btn
                label="Voltar"
                flat
                no-caps
                color="grey-5"
                class="full-width"
                @click="step = 1"
              />
            </q-form>
          </q-card-section>
        </div>

        <!-- Rodapé ──────────────────────────────────────────────────────── -->
        <q-card-section class="text-center q-pt-xs q-pb-md">
          <span class="text-grey-5 text-caption">Já tem conta? </span>
          <router-link to="/login" class="rp-login-link">Entrar</router-link>
        </q-card-section>
      </q-card>
    </div>

    <!-- Dialog Pro em breve ─────────────────────────────────────────────────── -->
    <q-dialog v-model="showProInfo">
      <q-card dark style="max-width: 340px; background: rgba(10,10,14,0.95)">
        <q-card-section>
          <div class="text-h6 text-white">Plano Pro — Em breve</div>
          <p class="text-body2 text-grey-4 q-mt-sm">
            O plano Pro está em desenvolvimento. Crie uma conta gratuita agora e faça upgrade quando estiver disponível.
          </p>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Entendi" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useOAuth } from '@/composables/useOAuth'
import bgDeskImg   from '@/assets/back-desk.png'
import bgMobileImg from '@/assets/back-mobile.png'
import logoImg      from '@/assets/logo-brew-right-full.png'
import logoLoginImg from '@/assets/logo-brew-right-only-label.png'

const router    = useRouter()
const authStore = useAuthStore()

const { loading: oauthLoading, error: oauthError, initGoogle, googleOneTap } = useOAuth()

const step         = ref<1 | 2>(1)
const selectedPlan = ref<'Free' | 'Pro'>('Free')
const showProInfo   = ref(false)
const form          = ref({ name: '', email: '', password: '', confirmPassword: '' })
const showPwd       = ref(false)
const showPwdConfirm = ref(false)
const loading       = ref(false)
const checkingEmail = ref(false)
const errorMsg      = ref('')
const step1Error    = ref('')
const googleBtnEl   = ref<HTMLElement>()

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const formStep1Ref = ref<any>(null)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const formStep2Ref = ref<any>(null)

const isMobile = ref(window.innerWidth < 600)
function onResize() { isMobile.value = window.innerWidth < 600 }
onMounted(() => {
  window.addEventListener('resize', onResize)
  if (googleBtnEl.value) initGoogle(googleBtnEl.value)
})
onUnmounted(() => window.removeEventListener('resize', onResize))
const bg = computed(() => isMobile.value ? bgMobileImg : bgDeskImg)

async function loginWithGoogle() {
  await googleOneTap()
}

async function goToStep2() {
  const valid = await formStep1Ref.value?.validate()
  if (!valid) return
  step1Error.value = ''
  step.value = 2
}

watch(() => authStore.isAuthenticated, async (val) => {
  if (val) await router.push('/')
})

async function handleRegister() {
  loading.value  = true
  errorMsg.value = ''
  try {
    await authStore.register({
      name: form.value.name,
      email: form.value.email,
      password: form.value.password,
    })
    await router.push('/')
  } catch (e: unknown) {
    const msg = (e as { response?: { data?: { error?: string } } })?.response?.data?.error
    errorMsg.value = msg ?? 'Erro ao cadastrar. Tente novamente.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* ── Root / Background ────────────────────────────────────────────────────── */
.rp-root {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
}

.rp-root::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.32);
  pointer-events: none;
}

/* ── Header / Logo ────────────────────────────────────────────────────────── */
.rp-header {
  position: absolute;
  z-index: 1;
  padding: 80px 84px;
  max-width: 100vw;
  box-sizing: border-box;
  overflow: hidden;
}

.rp-brand {
  cursor: default;
  user-select: none;
}

.rp-icon {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background-size: 145%;
  background-position: center 4%;
  flex-shrink: 0;
}

.rp-brand-logo {
  width: 100%;
  max-width: 680px;
  height: auto;
}

/* ── Card ─────────────────────────────────────────────────────────────────── */
.rp-center {
  position: relative;
  z-index: 1;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px 20px 60px;
  padding-top: 220px;
}

.rp-card {
  width: 100%;
  max-width: 440px;
  border-radius: 16px;
  background: rgba(10, 10, 14, 0.90) !important;
  backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.07);
}

/* ── Identidade dentro do card ────────────────────────────────────────────── */
.rp-card-logo {
  width: 100%;
  max-width: 260px;
  height: auto;
  border-radius: 8px;
}

/* ── Step indicator ───────────────────────────────────────────────────────── */
.step-dot {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.35);
  transition: all 0.25s ease;
  flex-shrink: 0;
}
.step-dot--active {
  border-color: var(--q-primary);
  color: var(--q-primary);
  box-shadow: 0 0 0 3px rgba(193, 113, 14, 0.18);
}
.step-dot--done {
  border-color: var(--q-primary);
  background: var(--q-primary);
  color: #1a1a1a;
}
.step-line {
  flex: 1;
  max-width: 40px;
  height: 2px;
  background: rgba(255, 255, 255, 0.12);
  border-radius: 1px;
}
.step-label {
  width: 80px;
  text-align: center;
}

/* ── Google btn ───────────────────────────────────────────────────────────── */
.google-btn {
  border-color: rgba(255, 255, 255, 0.18) !important;
  color: rgba(255, 255, 255, 0.85) !important;
}
.google-btn:hover {
  border-color: rgba(255, 255, 255, 0.35) !important;
  background: rgba(255, 255, 255, 0.04) !important;
}

/* ── Plan cards ───────────────────────────────────────────────────────────── */
.plan-card {
  border: 2px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  padding: 12px;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.plan-card:hover:not(.plan-card--disabled) {
  border-color: var(--q-primary);
}
.plan-card--active {
  border-color: var(--q-primary);
  box-shadow: 0 0 0 2px rgba(193, 113, 14, 0.2);
}
.plan-card--disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

/* ── Link rodapé ──────────────────────────────────────────────────────────── */
.rp-login-link {
  color: var(--q-primary);
  text-decoration: none;
  font-size: 0.75rem;
  font-weight: 500;
}
.rp-login-link:hover {
  text-decoration: underline;
}

/* ── Mobile ───────────────────────────────────────────────────────────────── */
@media (max-width: 599px) {
  .rp-root {
    height: 100vh;
    overflow: hidden;
    flex-direction: column;
  }

  .rp-header {
    position: relative;
    z-index: 1;
    padding: 10vh 24px 16px;
    text-align: center;
    flex-shrink: 0;
  }

  .rp-icon {
    display: none;
  }

  .rp-brand {
    justify-content: center;
  }

  .rp-brand > div {
    margin-left: 0 !important;
  }

  .rp-brand-logo {
    max-width: 450px;
  }

  .rp-center {
    padding: 92px 16px 24px;
    align-items: flex-start;
    overflow-y: auto;
  }

  .rp-card {
    padding: 0 4px;
  }

  .rp-card-logo {
    max-width: 160px;
  }
}
</style>

