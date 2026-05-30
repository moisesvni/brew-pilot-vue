<template>
  <q-page class="profiles-page">
    <brew-pilot-page-header
      icon="mdi-tune-variant"
      title="Perfis"
      subtitle="Configure os perfis abaixo para ter todos os parâmetros prontos ao criar suas receitas."
      :bleed="false"
    />

    <div class="hub-grid">
      <div
        v-for="cat in categories"
        :key="cat.id"
        class="hub-card"
        :class="{ 'hub-card--soon': cat.comingSoon }"
        @click="!cat.comingSoon && $router.push('/profiles/' + cat.id)"
      >
        <div
          class="hub-card-icon-wrap"
          :style="{ background: `color-mix(in srgb, ${cat.colorHex} 14%, transparent)` }"
        >
          <q-icon :name="cat.icon" :color="cat.color" size="28px" />
        </div>

        <div class="col column" style="gap: 2px; min-width: 0">
          <div class="hub-card-title">{{ cat.label }}</div>
          <div class="hub-card-desc">{{ cat.desc }}</div>
        </div>

        <div class="hub-card-right">
          <template v-if="cat.comingSoon">
            <q-badge label="Em breve" color="grey-6" />
          </template>
          <template v-else-if="cat.id === 'equipment'">
            <div class="hub-card-count" v-if="equipStore.userProfiles.length">
              {{ equipStore.userProfiles.length }}
              <span class="hub-card-count-label">perfil{{ equipStore.userProfiles.length > 1 ? 'is' : '' }}</span>
            </div>
            <div v-else class="hub-card-empty">Nenhum cadastrado</div>
          </template>
          <template v-else-if="cat.id === 'mash'">
            <div class="hub-card-count" v-if="mashStore.userProfiles.length">
              {{ mashStore.userProfiles.length }}
              <span class="hub-card-count-label">perfil{{ mashStore.userProfiles.length > 1 ? 'is' : '' }}</span>
            </div>
            <div v-else class="hub-card-empty">Nenhum cadastrado</div>
          </template>
          <q-icon v-if="!cat.comingSoon" name="mdi-chevron-right" color="grey-5" size="20px" />
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useEquipmentStore } from '@/stores/equipmentStore'
import { useMashProfileStore } from '@/stores/mashProfileStore'

const equipStore = useEquipmentStore()
const mashStore  = useMashProfileStore()

onMounted(() => {
  if (!equipStore.profiles.length) equipStore.fetchAll()
  if (!mashStore.profiles.length) mashStore.fetchAll()
})

const categories = [
  {
    id: 'equipment',
    label: 'Equipamento',
    desc: 'Volume do lote, eficiência, perdas, tempo de fervura e configurações do sistema.',
    icon: 'mdi-kettle',
    color: 'orange-6',
    colorHex: '#c1710e',
  },
  {
    id: 'mash',
    label: 'Mostura',
    desc: 'Etapas de mostura, temperaturas, tempos e relação água/grão.',
    icon: 'mdi-thermometer',
    color: 'red-4',
    colorHex: '#ef5350',
  },
  {
    id: 'ferment',
    label: 'Fermentação',
    desc: 'Perfil de temperatura de fermentação, carbonatação e maturação.',
    icon: 'mdi-chart-timeline-variant',
    color: 'blue-5',
    colorHex: '#2196f3',
    comingSoon: true,
  },
  {
    id: 'water',
    label: 'Água',
    desc: 'Perfil mineral da água, ajustes de pH e tratamentos.',
    icon: 'water_drop',
    color: 'cyan-5',
    colorHex: '#00bcd4',
    comingSoon: true,
  },
  {
    id: 'styles',
    label: 'Estilos Personalizados',
    desc: 'Crie e gerencie seus próprios guias de estilo além do BJCP.',
    icon: 'mdi-book-open-variant',
    color: 'green-5',
    colorHex: '#4caf50',
    comingSoon: true,
  },
]
</script>

<style scoped>
.profiles-page {
  padding: 0;
}

.hub-grid {
  padding: 20px 28px 20px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

@media (max-width: 599px) {
  .hub-grid {
    grid-template-columns: 1fr;
  }
}

.hub-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 18px;
  background: var(--bp-surface-alt);
  border: 1px solid var(--bp-border);
  border-radius: 12px;
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.hub-card:not(.hub-card--soon):hover {
  border-color: #c1710e88;
  box-shadow: 0 2px 12px color-mix(in srgb, #c1710e 12%, transparent);
}

.hub-card--soon {
  cursor: default;
  opacity: 0.6;
}

.hub-card-icon-wrap {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.hub-card-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--bp-text-primary);
  margin-bottom: 2px;
}

.hub-card-desc {
  font-size: 12px;
  color: var(--bp-text-secondary);
  line-height: 1.45;
}

.hub-card-right {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
}

.hub-card-count {
  font-size: 18px;
  font-weight: 700;
  color: #c1710e;
  line-height: 1;
}

.hub-card-count-label {
  font-size: 11px;
  font-weight: 400;
  color: var(--bp-text-secondary);
  display: block;
}

.hub-card-empty {
  font-size: 11px;
  color: var(--bp-text-muted);
}
</style>
