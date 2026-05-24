<template>
  <q-layout view="lHh Lpr lFf">
    <!-- Header -->
    <q-header elevated class="bg-dark" style="border-bottom: 1px solid rgba(232,160,32,0.3)">
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />
        <q-toolbar-title class="text-amber text-weight-bold" style="letter-spacing: 1px">
          🍺 BrewPilotApi
        </q-toolbar-title>
        <q-btn flat round dense icon="mdi-cog" to="/equipment" />
      </q-toolbar>
    </q-header>

    <!-- Drawer lateral (navegação) -->
    <q-drawer v-model="leftDrawerOpen" show-if-above bordered class="bg-dark-page">
      <q-list>
        <q-item-label header class="text-grey-5 text-caption text-uppercase q-mt-md">
          Módulos
        </q-item-label>

        <q-item
          v-for="link in navLinks"
          :key="link.to"
          clickable
          v-ripple
          :to="link.to"
          active-class="text-amber"
        >
          <q-item-section avatar>
            <q-icon :name="link.icon" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ link.label }}</q-item-label>
            <q-item-label caption class="text-grey-6">{{ link.caption }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <!-- Conteúdo principal -->
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const leftDrawerOpen = ref(false)

const navLinks = [
  {
    label: 'Receitas',
    caption: 'Criação e gestão',
    icon: 'mdi-beer',
    to: '/recipes'
  },
  {
    label: 'Ingredientes',
    caption: 'Biblioteca de insumos',
    icon: 'mdi-barley',
    to: '/ingredients'
  },
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
  }
]

function toggleLeftDrawer () {
  leftDrawerOpen.value = !leftDrawerOpen.value
}
</script>
