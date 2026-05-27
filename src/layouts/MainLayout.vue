<template>
  <q-layout view="hHh lpR fFf">
    <!-- ── Header ──────────────────────────────────────────────────────────── -->
    <q-header class="bp-editor-toolbar" height-hint="64"
      style="border-bottom: 1px solid var(--bp-border)">
      <q-toolbar class="GNL__toolbar">
        <q-btn flat dense round icon="menu" aria-label="Menu" class="q-mr-sm"
          @click="toggleLeftDrawer" />

        <q-toolbar-title shrink class="row items-center no-wrap">
          <img :src="$q.dark.isActive ? logoDarkImg : logoLightImg" alt="BrewPilot" class="header-logo" />
        </q-toolbar-title>

        <q-space />
        <!-- Ações rápidas -->
        <div class="row items-center no-wrap q-gutter-xs">
          <q-btn flat round dense icon="mdi-bell-outline" color="grey-4">
            <q-badge color="negative" floating transparent />
            <q-tooltip>Notificações</q-tooltip>
          </q-btn>
          <user-avatar-menu />
        </div>
      </q-toolbar>
    </q-header>
    <!-- ── Drawer lateral ──────────────────────────────────────────────────── -->
    <q-drawer v-model="leftDrawerOpen" show-if-above bordered :width="220" class="bg-dark-page"
      style="border-right: 1px solid var(--bp-border)">
      <q-scroll-area class="absolute-full">
        <q-list class="q-pt-sm">
          <q-item v-for="link in navLinks" :key="link.to" clickable v-ripple :to="link.to"
            exact-active-class="nav-item-active" class="nav-item GNL__drawer-item">
            <q-item-section avatar>
              <q-icon :name="link.icon" size="20px" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ link.label }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>
    </q-drawer>
    <!-- ── Conteúdo principal ──────────────────────────────────────────────── -->
    <q-page-container>
      <brew-pilot-breadcrumbs />
      <div class="GNL__page-content">
        <q-card flat bordered >
          <router-view />
        </q-card>
      </div>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useQuasar } from 'quasar'
// Dark: logo com texto branco/claro (usa no fundo escuro)
import logoDarkImg from '../assets/logo-brew-right-only-label.png'
// Light: logo com texto preto/escuro — versão com letras escuras para fundo claro
import logoLightImg from '../assets/logo-brew-right-only-label-dark.png'
import UserAvatarMenu from 'src/components/UserAvatarMenu.vue'
import BrewPilotBreadcrumbs from 'src/components/BrewPilotBreadcrumbs.vue'

const $q = useQuasar()

const leftDrawerOpen = ref(false)

const navLinks = [
  { label: 'Receitas', icon: 'mdi-note-text', to: '/recipes' },
  { label: 'Lotes', icon: 'mdi-barrel', to: '/batches' },
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
  { label: 'Dispositivos', icon: 'mdi-wifi', to: '/devices' },
  { label: 'Estoque', icon: 'mdi-package-variant', to: '/inventory' },
  { label: 'Biblioteca', icon: 'mdi-cloud-outline', to: '/library' },
  { label: 'Perfis', icon: 'mdi-account-group', to: '/profiles' },
  { label: 'Estilos', icon: 'mdi-book-open-variant', to: '/styles' },
  { label: 'Ferramentas', icon: 'mdi-tools', to: '/tools' },
  { label: 'Configurações', icon: 'mdi-cog', to: '/settings' },
]

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}
</script>

<style scoped>
.GNL__toolbar {
  height: 64px;
}

.GNL__toolbar-input {
  width: 40%;
  max-width: 560px;
}

.GNL__drawer-item {
  border-radius: 0 24px 24px 0;
  margin-right: 12px;
  line-height: 24px;
}

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
  background: rgba(193, 113, 14, 0.15) !important;
}

.nav-item-active .q-icon {
  color: #c1710e !important;
}

.GNL__page-content {
  padding: 0 24px 24px;
}
</style>
