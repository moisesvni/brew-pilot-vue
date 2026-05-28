<template>
  <brew-pilot-dialog v-model="open" title="Escolher base para o Perfil"
    icon="mdi-kettle" icon-color="orange-6" width="600px" scrollable>

    <!-- Busca + filtro favoritos -->
    <div class="q-px-md q-pt-md q-pb-xs row items-center no-wrap" style="gap: 8px">
      <brew-pilot-search-input v-model="search" placeholder="Buscar perfil base..." class="col" />
      <q-btn flat round dense size="sm"
        :icon="onlyFavorites ? 'mdi-star' : 'mdi-star-outline'"
        :color="onlyFavorites ? 'amber-5' : 'grey-5'"
        @click="onlyFavorites = !onlyFavorites">
        <q-tooltip>{{ onlyFavorites ? 'Mostrar todos' : 'Somente favoritos' }}</q-tooltip>
      </q-btn>
    </div>

    <!-- Lista -->
    <q-list class="q-px-sm q-pb-sm">
      <q-item v-if="!visibleProfiles.length">
        <q-item-section class="text-caption text-center q-py-md" style="color: var(--bp-text-muted)">
          {{ onlyFavorites ? 'Nenhum favorito ainda.' : 'Nenhum perfil encontrado.' }}
        </q-item-section>
      </q-item>

      <q-item v-for="p in visibleProfiles" :key="p.id"
        clickable v-ripple class="picker-item rounded-borders q-mb-xs"
        :class="{ 'picker-item--active': selected?.id === p.id }"
        @click="selected = p" @dblclick="confirmSelected">

        <q-item-section avatar style="min-width: 34px">
          <q-icon name="mdi-kettle"
            :color="selected?.id === p.id ? 'primary' : 'grey-5'"
            size="18px" />
        </q-item-section>

        <q-item-section>
          <q-item-label class="picker-item-name">{{ p.name }}</q-item-label>
          <q-item-label caption class="picker-item-stats">
            <span>{{ p.batchVolume }} L</span>
            <span class="sep">·</span>
            <span>{{ p.boilTime }} min</span>
            <span class="sep">·</span>
            <span>{{ p.efficiency }}% ef.</span>
            <span v-if="p.boilOffRate" class="sep">·</span>
            <span v-if="p.boilOffRate">{{ p.boilOffRate }} L/h evap.</span>
          </q-item-label>
          <!-- Detalhes expandidos ao selecionar -->
          <div v-if="selected?.id === p.id" class="picker-item-detail q-mt-xs">
            <span v-if="p.preBoilVolume">Pré-Fervura: <strong>{{ p.preBoilVolume }} L</strong></span>
            <span v-if="p.mashEfficiency">Ef. Mostura: <strong>{{ p.mashEfficiency }}%</strong></span>
            <span v-if="p.trubLoss">Perda Trub: <strong>{{ p.trubLoss }} L</strong></span>
            <span v-if="p.fermentorLoss">Perda Ferm.: <strong>{{ p.fermentorLoss }} L</strong></span>
          </div>
        </q-item-section>

        <q-item-section side class="row no-wrap items-center q-gutter-xs">
          <!-- Favorito -->
          <q-btn flat round dense size="xs"
            :icon="isFavorite(p.id) ? 'mdi-star' : 'mdi-star-outline'"
            :color="isFavorite(p.id) ? 'amber-5' : 'grey-6'"
            @click.stop="toggleFavorite(p.id)">
            <q-tooltip>{{ isFavorite(p.id) ? 'Remover favorito' : 'Favoritar' }}</q-tooltip>
          </q-btn>
          <!-- Check ativo -->
          <q-icon v-if="selected?.id === p.id"
            name="mdi-check-circle" color="positive" size="16px" />
        </q-item-section>
      </q-item>
    </q-list>

    <template #footer>
      <div class="row items-center q-px-md q-py-sm" style="gap: 8px">
        <brew-pilot-button variant="outline" no-caps icon="mdi-pencil-plus-outline"
          label="Criar do Zero" size="sm" @click="createFromScratch" />
        <q-space />
        <brew-pilot-button variant="flat" no-caps label="Cancelar" @click="open = false" />
        <brew-pilot-button variant="filled" color="primary" no-caps
          icon="mdi-plus" label="Usar esta Base"
          :disable="!selected" size="sm" @click="confirmSelected" />
      </div>
    </template>

  </brew-pilot-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import BrewPilotDialog from '@/components/BrewPilotDialog.vue'
import BrewPilotButton from '@/components/shared/BrewPilotButton.vue'
import BrewPilotSearchInput from '@/components/shared/BrewPilotSearchInput.vue'
import { useEquipmentStore } from '@/stores/equipmentStore'
import type { EquipmentProfile } from '@/types/equipment'

const FAVORITES_KEY = 'bp_equip_favorites'

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{
  'update:modelValue': [v: boolean]
  'select': [base: EquipmentProfile | null]
}>()

const open = computed({ get: () => props.modelValue, set: v => emit('update:modelValue', v) })

const equipStore = useEquipmentStore()
const search = ref('')
const onlyFavorites = ref(false)
const selected = ref<EquipmentProfile | null>(null)
const favorites = ref<string[]>(loadFavorites())

watch(() => props.modelValue, (v) => {
  if (v) {
    search.value = ''
    selected.value = null
    onlyFavorites.value = false
    if (!equipStore.profiles.length) equipStore.fetchAll()
  }
})

function loadFavorites(): string[] {
  try { return JSON.parse(localStorage.getItem(FAVORITES_KEY) ?? '[]') } catch { return [] }
}

function saveFavorites() {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites.value))
}

function isFavorite(id: string) {
  return favorites.value.includes(id)
}

function toggleFavorite(id: string) {
  const idx = favorites.value.indexOf(id)
  if (idx === -1) favorites.value.push(id)
  else favorites.value.splice(idx, 1)
  saveFavorites()
}

const visibleProfiles = computed(() => {
  let list = equipStore.globalProfiles
  if (onlyFavorites.value) list = list.filter(p => favorites.value.includes(p.id))
  if (search.value) {
    const q = search.value.toLowerCase()
    list = list.filter(p => p.name.toLowerCase().includes(q))
  }
  // Favoritos primeiro
  return [...list].sort((a, b) => {
    const af = favorites.value.includes(a.id) ? 0 : 1
    const bf = favorites.value.includes(b.id) ? 0 : 1
    return af - bf
  })
})

function confirmSelected() {
  if (!selected.value) return
  emit('select', selected.value)
  open.value = false
}

function createFromScratch() {
  emit('select', null)
  open.value = false
}
</script>

<style scoped>
.picker-item {
  border-radius: 6px;
  transition: background 0.1s;
}

.picker-item--active {
  background: color-mix(in srgb, #c1710e 10%, transparent) !important;
}

.picker-item-name {
  font-size: 13.5px;
  font-weight: 600;
  color: var(--bp-text-primary);
}

.picker-item-stats {
  font-size: 11.5px;
  color: var(--bp-text-secondary);
}

.picker-item-stats .sep {
  margin: 0 4px;
  color: var(--bp-text-muted);
}

.picker-item-detail {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 12px;
  font-size: 11px;
  color: var(--bp-text-muted);
}

.picker-item-detail strong {
  color: var(--bp-text-primary);
}
</style>
