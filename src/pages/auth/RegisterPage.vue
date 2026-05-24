<template>
  <q-page class="flex flex-center bg-grey-1">
    <q-card style="min-width: 380px; max-width: 480px; width: 100%">
      <q-card-section class="text-center q-pb-none">
        <div class="text-h5 text-weight-bold text-primary">BrewPilot</div>
        <div class="text-subtitle2 text-grey-6 q-mt-xs">Crie sua conta</div>
      </q-card-section>

      <!-- Seleção de plano ─────────────────────────────────────────────────── -->
      <q-card-section class="q-pb-xs">
        <div class="text-caption text-grey-7 q-mb-xs">Escolha seu plano</div>
        <div class="row q-gutter-sm">
          <!-- Free -->
          <div
            class="col plan-card cursor-pointer"
            :class="{ 'plan-card--active': selectedPlan === 'Free' }"
            @click="selectedPlan = 'Free'"
          >
            <div class="text-subtitle2 text-weight-bold">Grátis</div>
            <ul class="text-caption text-grey-8 q-pl-md q-mb-none">
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
              <div class="text-subtitle2 text-weight-bold col">Pro</div>
              <q-badge color="orange" label="Em breve" />
            </div>
            <ul class="text-caption text-grey-8 q-pl-md q-mb-none">
              <li>Perfis ilimitados</li>
              <li>Receitas ilimitadas</li>
              <li>Exportar PDF / BeerXML</li>
            </ul>
            <div class="text-h6 text-weight-bold q-mt-xs text-orange-8">R$ 19/mês</div>
          </div>
        </div>
      </q-card-section>

      <!-- OAuth ─────────────────────────────────────────────────────────────── -->
      <q-card-section class="q-pb-xs">
        <div ref="googleBtnEl" class="q-mb-sm" />
        <q-btn
          class="full-width"
          unelevated
          outline
          icon="img:https://www.apple.com/favicon.ico"
          label="Cadastrar com Apple"
          color="dark"
          :loading="oauthLoading"
          @click="loginWithApple"
        />
        <q-banner v-if="oauthError" rounded class="bg-negative text-white q-py-xs q-mt-sm">
          {{ oauthError }}
        </q-banner>
      </q-card-section>

      <!-- Divisor ──────────────────────────────────────────────────────────── -->
      <q-card-section class="q-py-xs">
        <div class="row items-center">
          <q-separator class="col" />
          <span class="text-caption text-grey-5 q-px-sm">ou cadastre com e-mail</span>
          <q-separator class="col" />
        </div>
      </q-card-section>

      <!-- Form padrão ──────────────────────────────────────────────────────── -->
      <q-card-section>
        <q-form @submit.prevent="handleRegister" class="q-gutter-md">
          <q-input
            v-model="form.name"
            label="Nome"
            outlined
            dense
            :rules="[v => !!v || 'Nome obrigatório']"
          />
          <q-input
            v-model="form.email"
            label="E-mail"
            type="email"
            outlined
            dense
            :rules="[v => !!v || 'E-mail obrigatório']"
          />
          <q-input
            v-model="form.password"
            label="Senha"
            :type="showPwd ? 'text' : 'password'"
            outlined
            dense
            :rules="[v => v?.length >= 6 || 'Mínimo 6 caracteres']"
          >
            <template #append>
              <q-icon
                :name="showPwd ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="showPwd = !showPwd"
              />
            </template>
          </q-input>

          <q-banner v-if="errorMsg" rounded class="bg-negative text-white q-py-xs">
            {{ errorMsg }}
          </q-banner>

          <q-btn
            label="Criar conta grátis"
            type="submit"
            color="primary"
            class="full-width"
            :loading="loading"
            unelevated
          />
        </q-form>
      </q-card-section>

      <q-card-section class="text-center q-pt-none">
        <span class="text-grey-7">Já tem conta? </span>
        <router-link to="/login" class="text-primary text-weight-medium">Entrar</router-link>
      </q-card-section>
    </q-card>

    <!-- Dialog Pro em breve ──────────────────────────────────────────────────── -->
    <q-dialog v-model="showProInfo">
      <q-card style="max-width: 340px">
        <q-card-section>
          <div class="text-h6">Plano Pro — Em breve</div>
          <p class="text-body2 text-grey-8 q-mt-sm">
            O plano Pro está em desenvolvimento. Crie uma conta gratuita agora e faça upgrade quando estiver disponível.
          </p>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Entendi" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/authStore'
import { useOAuth } from '../../composables/useOAuth'

const router    = useRouter()
const authStore = useAuthStore()

const { loading: oauthLoading, error: oauthError, initGoogle, loginWithApple } = useOAuth()

const selectedPlan = ref<'Free' | 'Pro'>('Free')
const showProInfo   = ref(false)
const form          = ref({ name: '', email: '', password: '' })
const showPwd       = ref(false)
const loading       = ref(false)
const errorMsg      = ref('')
const googleBtnEl   = ref<HTMLElement>()

onMounted(() => {
  if (googleBtnEl.value) initGoogle(googleBtnEl.value)
})

// Redireciona após OAuth
watch(() => authStore.isAuthenticated, async (val) => {
  if (val) await router.push('/')
})

async function handleRegister() {
  loading.value  = true
  errorMsg.value = ''
  try {
    await authStore.register(form.value)
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
.plan-card {
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  padding: 12px;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.plan-card:hover:not(.plan-card--disabled) {
  border-color: var(--q-primary);
}
.plan-card--active {
  border-color: var(--q-primary);
  box-shadow: 0 0 0 2px rgba(var(--q-primary-rgb), 0.15);
}
.plan-card--disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>

