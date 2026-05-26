<template>
  <q-btn flat round dense padding="4px">
    <q-avatar size="34px" :color="avatarColor" text-color="white" class="cursor-pointer">
      <img v-if="user?.avatarUrl" :src="user.avatarUrl" referrerpolicy="no-referrer" />
      <span v-else class="text-caption text-weight-bold">{{ userInitials }}</span>
    </q-avatar>
    <q-menu transition-show="scale" transition-hide="scale" :offset="[0, 0]"
      class="bg-dark-page" style="border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; min-width: 340px">
      <div class="row no-wrap q-pa-md" style="gap: 0">

        <!-- ── Coluna esquerda: configurações ──────────────────────────────── -->
        <div class="column" style="min-width: 160px">
          <div class="text-overline text-grey-5 q-mb-sm" style="letter-spacing: 0.08em">Configurações</div>

          <!-- Stats -->
          <q-item dense class="rounded-borders bg-dark q-pa-sm q-mb-xs">
            <q-item-section avatar style="min-width: 28px">
              <q-icon name="mdi-note-text" color="primary" size="18px" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-white text-weight-bold text-body2">{{ recipeCount }}</q-item-label>
              <q-item-label caption class="text-grey-5" style="font-size: 10px">Receitas</q-item-label>
            </q-item-section>
          </q-item>

          <q-item dense class="rounded-borders bg-dark q-pa-sm q-mb-md">
            <q-item-section avatar style="min-width: 28px">
              <q-icon name="mdi-barrel" color="primary" size="18px" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-white text-weight-bold text-body2">{{ batchCount }}</q-item-label>
              <q-item-label caption class="text-grey-5" style="font-size: 10px">Lotes</q-item-label>
            </q-item-section>
          </q-item>

          <q-separator dark class="q-mb-sm" />

          <!-- Modo escuro -->
          <q-item dense clickable v-ripple class="rounded-borders q-px-sm" @click="toggleDark">
            <q-item-section avatar style="min-width: 28px">
              <q-icon :name="$q.dark.isActive ? 'mdi-weather-sunny' : 'mdi-weather-night'" color="primary" size="18px" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-white text-caption">
                {{ $q.dark.isActive ? 'Modo claro' : 'Modo escuro' }}
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-toggle :model-value="$q.dark.isActive" color="primary" size="xs"
                @update:model-value="toggleDark" @click.stop />
            </q-item-section>
          </q-item>

          <!-- Configurações -->
          <q-item dense clickable v-ripple class="rounded-borders q-px-sm" v-close-popup
            @click="$router.push('/settings')">
            <q-item-section avatar style="min-width: 28px">
              <q-icon name="mdi-cog-outline" color="grey-5" size="18px" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-white text-caption">Configurações</q-item-label>
            </q-item-section>
          </q-item>
        </div>

        <q-separator vertical dark class="q-mx-md" />

        <!-- ── Coluna direita: perfil ──────────────────────────────────────── -->
        <div class="column items-center justify-between" style="min-width: 120px">
          <div class="column items-center">
            <q-avatar size="64px" :color="avatarColor" text-color="white" class="q-mb-sm shadow-4">
              <img v-if="user?.avatarUrl" :src="user.avatarUrl" referrerpolicy="no-referrer" />
              <span v-else class="text-h6 text-weight-bold">{{ userInitials }}</span>
            </q-avatar>
            <div class="text-body2 text-weight-bold text-white text-center" style="max-width: 120px; line-height: 1.2">
              {{ user?.name }}
            </div>
            <div class="text-caption text-grey-5 text-center q-mt-xs" style="max-width: 120px; word-break: break-all">
              {{ user?.email }}
            </div>
            <q-badge :color="user?.plan === 'Pro' ? 'amber' : 'grey-7'" :label="user?.plan ?? 'Free'"
              class="q-mt-sm" />
          </div>

          <div class="column items-center q-mt-md" style="width: 100%">
            <q-btn flat no-caps size="sm" icon="mdi-account-circle-outline" label="Perfil"
              color="grey-4" class="full-width q-mb-xs" v-close-popup @click="$router.push('/profiles')" />
            <q-btn unelevated no-caps size="sm" icon="mdi-logout" label="Sair"
              color="negative" class="full-width" v-close-popup @click="handleLogout" />
          </div>
        </div>

      </div>
    </q-menu>
  </q-btn>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/authStore'
import { useRecipeStore } from '../../stores/recipeStore'

const $q = useQuasar()
const router = useRouter()
const authStore = useAuthStore()
const recipeStore = useRecipeStore()

const user = computed(() => authStore.user)

const userInitials = computed(() => {
  const name = user.value?.name ?? ''
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0]![0]!.toUpperCase()
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase()
})

const avatarColor = computed(() => {
  const colors = ['primary', 'secondary', 'accent', 'teal', 'deep-purple', 'indigo']
  const name = user.value?.name ?? ''
  return colors[name.charCodeAt(0) % colors.length] ?? 'primary'
})

const recipeCount = computed(() => recipeStore.recipes.length)
const batchCount = ref(0)

function toggleDark() {
  $q.dark.toggle()
}

async function handleLogout() {
  await authStore.logout()
  router.push('/login')
}
</script>
