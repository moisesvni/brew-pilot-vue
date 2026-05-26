<template>
  <q-layout view="lHh Lpr lFf">
    <!-- ── Header ──────────────────────────────────────────────────────────── -->
    <q-header  class="bg-dark" style="border-bottom: 1px solid rgba(232,160,32,0.25)">
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />
        <q-toolbar-title>
          <img :src="logoLoginImg" alt="BrewPilot" class="header-logo" />
        </q-toolbar-title>

        <!-- Ações rápidas -->
        <q-btn flat round dense icon="mdi-magnify" class="q-mr-xs" />
        <q-btn flat round dense icon="mdi-bell-outline" class="q-mr-sm">
          <q-badge color="negative" floating transparent />
        </q-btn>

        <!-- Avatar do usuário -->
        <q-btn flat round dense padding="4px">
          <q-avatar size="34px" :color="avatarColor" text-color="white" class="cursor-pointer">
            <img v-if="user?.avatarUrl" :src="user.avatarUrl" referrerpolicy="no-referrer" />
            <span v-else class="text-caption text-weight-bold">{{ userInitials }}</span>
          </q-avatar>

          <q-popup-proxy transition-show="scale" transition-hide="scale" :offset="[0, 8]">
            <q-card style="min-width: 280px" class="bg-dark-page">
              <!-- Cabeçalho do perfil -->
              <q-card-section class="row items-center q-pb-sm">
                <q-avatar size="48px" :color="avatarColor" text-color="white" class="q-mr-md">
                  <img v-if="user?.avatarUrl" :src="user.avatarUrl" referrerpolicy="no-referrer" />
                  <span v-else class="text-subtitle1 text-weight-bold">{{ userInitials }}</span>
                </q-avatar>
                <div>
                  <div class="text-body1 text-weight-bold text-white">{{ user?.name }}</div>
                  <div class="text-caption text-grey-5">{{ user?.email }}</div>
                  <q-badge
                    :color="user?.plan === 'Pro' ? 'amber' : 'grey-7'"
                    :label="user?.plan ?? 'Free'"
                    class="q-mt-xs"
                  />
                </div>
              </q-card-section>

              <q-separator color="grey-9" />

              <!-- Stats rápidos -->
              <q-card-section class="row q-col-gutter-sm q-py-sm">
                <div class="col-6">
                  <q-item dense class="rounded-borders bg-dark q-pa-sm">
                    <q-item-section avatar>
                      <q-icon name="mdi-note-text" color="amber" size="20px" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label class="text-white text-weight-bold">{{ recipeCount }}</q-item-label>
                      <q-item-label caption class="text-grey-5">Receitas</q-item-label>
                    </q-item-section>
                  </q-item>
                </div>
                <div class="col-6">
                  <q-item dense class="rounded-borders bg-dark q-pa-sm">
                    <q-item-section avatar>
                      <q-icon name="mdi-barrel" color="primary" size="20px" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label class="text-white text-weight-bold">{{ batchCount }}</q-item-label>
                      <q-item-label caption class="text-grey-5">Lotes</q-item-label>
                    </q-item-section>
                  </q-item>
                </div>
              </q-card-section>

              <q-separator color="grey-9" />

              <!-- Modo escuro -->
              <q-card-section class="q-py-sm">
                <q-item dense clickable v-ripple @click="toggleDark" class="rounded-borders">
                  <q-item-section avatar>
                    <q-icon :name="$q.dark.isActive ? 'mdi-weather-sunny' : 'mdi-weather-night'" color="amber" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-white">{{ $q.dark.isActive ? 'Modo claro' : 'Modo escuro' }}</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-toggle :model-value="$q.dark.isActive" color="amber" @update:model-value="toggleDark" />
                  </q-item-section>
                </q-item>
              </q-card-section>

              <q-separator color="grey-9" />

              <!-- Ações -->
              <q-card-section class="q-pt-sm q-pb-sm">
                <q-btn
                  flat
                  class="full-width text-negative"
                  icon="mdi-logout"
                  label="Sair"
                  align="left"
                  @click="handleLogout"
                />
              </q-card-section>
            </q-card>
          </q-popup-proxy>
        </q-btn>
      </q-toolbar>
    </q-header>

    <!-- ── Drawer lateral ──────────────────────────────────────────────────── -->
    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      :width="220"
      class="bg-dark-page"
      style="border-right: 1px solid rgba(255,255,255,0.06)"
    >
      <q-list padding>
        <q-item
          v-for="link in navLinks"
          :key="link.to"
          clickable
          v-ripple
          :to="link.to"
          exact-active-class="nav-item-active"
          class="rounded-borders q-mb-xs nav-item"
        >
          <q-item-section avatar>
            <q-icon :name="link.icon" size="22px" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ link.label }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <!-- ── Conteúdo principal ──────────────────────────────────────────────── -->
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { useRecipeStore } from '../stores/recipeStore'
import logoLoginImg from '../assets/logo-brew-right-only-label.png'

const $q = useQuasar()
const router = useRouter()
const authStore = useAuthStore()
const recipeStore = useRecipeStore()

const leftDrawerOpen = ref(false)

const user = computed(() => authStore.user)

const userInitials = computed(() => {
  const name = user.value?.name ?? ''
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0][0]!.toUpperCase()
  return (parts[0][0]! + parts[parts.length - 1][0]!).toUpperCase()
})

const avatarColor = computed(() => {
  const colors = ['primary', 'secondary', 'accent', 'teal', 'deep-purple', 'indigo']
  const name = user.value?.name ?? ''
  return colors[name.charCodeAt(0) % colors.length] ?? 'primary'
})

const recipeCount = computed(() => recipeStore.recipes.length)
const batchCount = ref(0) // placeholder até existir batchStore

const navLinks = [
  { label: 'Receitas',     icon: 'mdi-note-text',          to: '/recipes'     },
  { label: 'Lotes',        icon: 'mdi-barrel',              to: '/batches'     },
  {
    label: 'Equipamentos',
    caption: 'Perfis e configurações',
    icon: 'mdi-kettle',
    to: '/equipment'
  },
  {
    label: 'Estilos BJCP',
    caption: 'Guia de estilos',
    icon: 'mdi-flask',
    to: '/styles'
  },
  { label: 'Dispositivos', icon: 'mdi-wifi',                to: '/devices'     },
  { label: 'Estoque',      icon: 'mdi-package-variant',     to: '/inventory'   },
  { label: 'Biblioteca',   icon: 'mdi-cloud-outline',       to: '/library'     },
  { label: 'Perfis',       icon: 'mdi-account-group',       to: '/profiles'    },
  { label: 'Estilos',      icon: 'mdi-book-open-variant',   to: '/styles'      },
  { label: 'Ferramentas',  icon: 'mdi-tools',               to: '/tools'       },
  { label: 'Configurações',icon: 'mdi-cog',                 to: '/settings'    },
]

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

function toggleDark() {
  $q.dark.toggle()
}

async function handleLogout() {
  await authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.header-logo {
  height: 32px;
  width: auto;
  display: block;
}
.nav-item {
  color: rgba(255, 255, 255, 0.65);
  transition: color 0.15s, background 0.15s;
}
.nav-item:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.06);
}
.nav-item-active {
  color: #fff !important;
  background: rgba(232, 160, 32, 0.15) !important;
}
.nav-item-active .q-icon {
  color: #e8a020 !important;
}
</style>
