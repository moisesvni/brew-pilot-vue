<template>
  <q-page class="flex flex-center bg-grey-1">
    <q-card style="min-width: 360px; max-width: 440px; width: 100%">
      <q-card-section class="text-center q-pb-none">
        <div class="text-h5 text-weight-bold text-primary">BrewPilot</div>
        <div class="text-subtitle2 text-grey-6 q-mt-xs">Faça login na sua conta</div>
      </q-card-section>

      <!-- OAuth ─────────────────────────────────────────────────────────────── -->
      <q-card-section class="q-pb-xs">
        <!-- Google Sign-In (renderizado pelo SDK do Google) -->
        <div ref="googleBtnEl" class="q-mb-sm" />

        <q-btn
          class="full-width"
          unelevated
          outline
          icon="img:https://www.apple.com/favicon.ico"
          label="Continuar com Apple"
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
          <span class="text-caption text-grey-5 q-px-sm">ou</span>
          <q-separator class="col" />
        </div>
      </q-card-section>

      <!-- Form padrão ──────────────────────────────────────────────────────── -->
      <q-card-section>
        <q-form @submit.prevent="handleLogin" class="q-gutter-md">
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
            :rules="[v => !!v || 'Senha obrigatória']"
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
            label="Entrar"
            type="submit"
            color="primary"
            class="full-width"
            :loading="loading"
            unelevated
          />
        </q-form>
      </q-card-section>

      <q-card-section class="text-center q-pt-none">
        <span class="text-grey-7">Não tem conta? </span>
        <router-link to="/register" class="text-primary text-weight-medium">Cadastre-se</router-link>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/authStore'
import { useOAuth } from '../../composables/useOAuth'

const router    = useRouter()
const route     = useRoute()
const authStore = useAuthStore()

const { loading: oauthLoading, error: oauthError, initGoogle, loginWithApple } = useOAuth()

const form     = ref({ email: '', password: '' })
const showPwd  = ref(false)
const loading  = ref(false)
const errorMsg = ref('')

const googleBtnEl = ref<HTMLElement>()

onMounted(() => {
  if (googleBtnEl.value) initGoogle(googleBtnEl.value)
})

// Redireciona após OAuth bem-sucedido
import { watch } from 'vue'
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

