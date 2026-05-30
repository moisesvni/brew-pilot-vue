<template>
  <brew-pilot-dialog v-model="open" title="Escolher base para o Perfil"
    icon="mdi-kettle" icon-color="orange-6" width="620px" scrollable>

    <template #header-actions>
      <!-- Importar perfil JSON (gera um novo perfil editável) -->
      <q-btn flat round dense icon="mdi-upload-outline" color="grey-5"
        @click="importFileInput?.click()">
        <q-tooltip>Importar perfil de um arquivo JSON</q-tooltip>
      </q-btn>
      <input ref="importFileInput" type="file" accept=".json" style="display:none"
        @change="handleImportFile" />
    </template>

    <!-- ── Sticky: busca + filtros ────────────────────────────────────── -->
    <div class="ebp-sticky-header">
      <!-- Linha única: [Filtrar] [busca] [⭐] -->
      <div class="row items-center no-wrap q-px-md q-pt-md q-pb-sm" style="gap: 8px">

        <!-- Botão Filtrar com menu reestruturado -->
        <q-btn flat no-caps dense
          icon="mdi-filter-variant"
          :color="selectedTypes.size > 0 ? 'primary' : 'grey-5'"
          size="sm"
          class="ebp-filter-btn">
          <span class="q-ml-xs">Filtrar</span>
          <q-badge v-if="selectedTypes.size > 0" floating color="primary" :label="selectedTypes.size"
            style="font-size: 9px; min-height: 14px; min-width: 14px; padding: 1px 3px" />
          <q-menu :auto-close="false" anchor="bottom left" self="top left" :offset="[0, 4]" class="ebp-filter-menu">
            <div style="min-width: 230px">
              <div class="q-px-md q-pt-sm q-pb-xs">
                <div class="text-caption text-weight-medium" style="color: var(--bp-text-muted); font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px">Tipo de Equipamento</div>
              </div>
              <q-list dense>

                <!-- Todos: item simples, sem checkbox -->
                <q-item clickable v-ripple dense
                  :active="selectedTypes.size === 0"
                  active-class="ebp-menu-item--active"
                  style="min-height: 38px"
                  @click.stop="selectedTypes = new Set()">
                  <q-item-section avatar style="min-width: 28px; padding-left: 4px">
                    <q-icon name="mdi-format-list-bulleted" size="16px"
                      :color="selectedTypes.size === 0 ? 'primary' : 'grey-5'" />
                  </q-item-section>
                  <q-item-section style="font-size: 13px; color: var(--bp-text-primary)">Todos os tipos</q-item-section>
                  <q-item-section side v-if="selectedTypes.size === 0">
                    <q-icon name="mdi-check" size="14px" color="primary" />
                  </q-item-section>
                </q-item>

                <q-separator class="q-my-xs" />

                <!-- Tipos com checkbox -->
                <q-item v-for="(label, type) in SETUP_TYPE_LABELS" :key="type"
                  clickable dense
                  :class="{ 'ebp-menu-item--active': selectedTypes.has(type) }"
                  style="min-height: 38px"
                  @click.stop="toggleType(type)">
                  <q-item-section side style="padding-right: 8px; min-width: 0">
                    <q-checkbox :model-value="selectedTypes.has(type)"
                      dense size="sm" color="primary"
                      @update:model-value="toggleType(type)" @click.stop />
                  </q-item-section>
                  <q-item-section avatar style="min-width: 28px">
                    <q-icon :name="SETUP_TYPE_ICONS[type]" size="15px"
                      :color="selectedTypes.has(type) ? 'primary' : 'grey-5'" />
                  </q-item-section>
                  <q-item-section style="font-size: 13px; color: var(--bp-text-primary)">{{ label }}</q-item-section>
                </q-item>

                <q-separator class="q-mt-xs" />

                <!-- Limpar — habilitado só quando há filtros ativos -->
                <q-item clickable dense
                  :disable="selectedTypes.size === 0"
                  style="min-height: 38px"
                  @click.stop="selectedTypes = new Set()">
                  <q-item-section avatar style="min-width: 28px; padding-left: 4px">
                    <q-icon name="mdi-filter-remove-outline" size="16px"
                      :color="selectedTypes.size > 0 ? 'negative' : 'grey-7'" />
                  </q-item-section>
                  <q-item-section :style="{ fontSize: '13px', color: selectedTypes.size > 0 ? 'var(--bp-text-primary)' : 'var(--bp-text-muted)' }">
                    Limpar filtros
                  </q-item-section>
                </q-item>

              </q-list>
            </div>
          </q-menu>
        </q-btn>

        <brew-pilot-search-input v-model="search" placeholder="Buscar perfil base..." class="col" />

        <q-btn flat round
          :icon="onlyFavorites ? 'mdi-star' : 'mdi-star-outline'"
          :color="onlyFavorites ? 'amber-5' : 'grey-5'"
          size="14px"
          @click="onlyFavorites = !onlyFavorites">
          <q-tooltip>{{ onlyFavorites ? 'Mostrar todos' : 'Somente favoritos' }}</q-tooltip>
        </q-btn>
      </div>

      <q-separator />
    </div>

    <!-- ── Lista ──────────────────────────────────────────────────────── -->
    <q-list class="q-px-sm q-pt-xs q-pb-xs">
      <q-item v-if="!visibleProfiles.length">
        <q-item-section class="text-caption text-center q-py-lg" style="color: var(--bp-text-muted)">
          <q-icon name="mdi-magnify-remove-outline" size="36px" class="q-mb-xs" /><br>
          {{ onlyFavorites ? 'Nenhum favorito ainda.' : 'Nenhum perfil encontrado.' }}
        </q-item-section>
      </q-item>

      <q-item v-for="p in visibleProfiles" :key="p.id"
        clickable v-ripple class="picker-item rounded-borders q-mb-xs"
        :class="{ 'picker-item--active': selected?.id === p.id }"
        @click="selectProfile(p)">

        <q-item-section avatar style="min-width: 36px">
          <q-icon :name="SETUP_TYPE_ICONS[p.setupType ?? ''] ?? 'mdi-kettle'"
            :color="selected?.id === p.id ? 'primary' : 'grey-5'"
            size="20px" />
        </q-item-section>

        <q-item-section>
          <q-item-label class="picker-item-name row items-center" style="gap: 6px">
            {{ p.name }}
            <q-chip v-if="p.setupType" dense size="xs"
              class="ebp-type-chip q-my-none q-px-xs"
              :label="SETUP_TYPE_LABELS[p.setupType] ?? p.setupType" />
          </q-item-label>
          <q-item-label caption class="picker-item-stats">
            <span>{{ p.batchVolume }} L</span>
            <span class="sep">·</span>
            <span>{{ p.boilTime > 0 ? `${p.boilTime} min` : 'Sem fervura' }}</span>
            <span class="sep">·</span>
            <span>{{ p.efficiency }}% ef.</span>
            <span v-if="p.boilOffRate" class="sep">·</span>
            <span v-if="p.boilOffRate">{{ p.boilOffRate }} L/h evap.</span>
          </q-item-label>

          <!-- Detalhes expandidos ao selecionar -->
          <div v-if="selected?.id === p.id" class="picker-item-expanded q-mt-sm">
            <div class="picker-item-detail">
              <span v-if="p.preBoilVolume">Pré-Fervura: <strong>{{ p.preBoilVolume }} L</strong></span>
              <span v-if="p.mashEfficiency">Ef. Mostura: <strong>{{ p.mashEfficiency }}%</strong></span>
              <span v-if="p.trubLoss">Perda Trub: <strong>{{ p.trubLoss }} L</strong></span>
              <span v-if="p.fermentorLoss">Perda Ferm.: <strong>{{ p.fermentorLoss }} L</strong></span>
              <span v-if="p.lauterMethod">Lavagem: <strong>{{ LAUTER_LABELS[p.lauterMethod] ?? p.lauterMethod }}</strong></span>
              <span v-if="p.hltVolume">HLT: <strong>{{ p.hltVolume }} L</strong></span>
            </div>
            <p v-if="p.notes" class="picker-item-notes q-mt-xs q-mb-xs">{{ p.notes }}</p>
          </div>
        </q-item-section>

        <!-- Favorito (maior) -->
        <q-item-section side style="padding-left: 8px">
          <q-btn flat round
            :icon="isFavorite(p.id) ? 'mdi-star' : 'mdi-star-outline'"
            :color="isFavorite(p.id) ? 'amber-5' : 'grey-6'"
            size="14px"
            @click.stop="toggleFavorite(p.id)">
            <q-tooltip>{{ isFavorite(p.id) ? 'Remover favorito' : 'Favoritar' }}</q-tooltip>
          </q-btn>
        </q-item-section>
      </q-item>
    </q-list>

    <template #footer>
      <div class="row items-center q-px-md q-py-sm" style="gap: 8px">
        <!-- "Criar do Zero" com tooltip -->
        <brew-pilot-button
          variant="outline"
          no-caps
          icon="mdi-pencil-plus-outline"
          label="Criar do Zero"
          tooltip="Não encontrou o que procurava? Crie um perfil totalmente personalizado do zero, com os dados do seu próprio equipamento."
          @click="createFromScratch" />
        <q-space />
        <brew-pilot-button variant="outline" no-caps label="Cancelar" @click="open = false" />
        <!-- Wrapper div para tooltip funcionar mesmo com botão desabilitado -->
        <div style="display: inline-block">
          <brew-pilot-button variant="filled" color="primary" no-caps
            icon="mdi-arrow-right" label="Usar esta Base"
            :disable="!selected" @click="confirmSelected" />
          <q-tooltip v-if="!selected" anchor="top middle" self="bottom middle">
            Selecione um perfil da lista para continuar.<br>
            <span style="font-size: 10px; opacity: 0.8">Clique em qualquer perfil para ver os detalhes e escolher.</span>
          </q-tooltip>
        </div>
      </div>
    </template>

  </brew-pilot-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useEquipmentStore } from '@/stores/equipmentStore'
import type { EquipmentProfile } from '@/types/equipment'
import {
  BASE_EQUIPMENT_PROFILES,
  SETUP_TYPE_LABELS,
  SETUP_TYPE_ICONS,
} from '@/data/equipment-profiles-base'

const FAVORITES_KEY = 'bp_equip_favorites'

const LAUTER_LABELS: Record<string, string> = {
  BatchSparge: 'Batch Sparge',
  FlySparge:   'Fly Sparge',
  NoSparge:    'Sem Lavagem',
  RIMS:        'RIMS',
  HERMS:       'HERMS',
}

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{
  'update:modelValue': [v: boolean]
  'select': [base: EquipmentProfile | null]
}>()

const open = computed({ get: () => props.modelValue, set: v => emit('update:modelValue', v) })

const equipStore = useEquipmentStore()
const importFileInput = ref<HTMLInputElement | null>(null)
const search        = ref('')
const onlyFavorites = ref(false)
const selectedTypes = ref<Set<string>>(new Set())
const selected      = ref<EquipmentProfile | null>(null)
const favorites     = ref<string[]>(loadFavorites())

watch(() => props.modelValue, (v) => {
  if (v) {
    search.value        = ''
    selected.value      = null
    selectedTypes.value = new Set()
    onlyFavorites.value = false
    if (!equipStore.profiles.length) equipStore.fetchAll()
  }
})

function toggleType(type: string) {
  const next = new Set(selectedTypes.value)
  if (next.has(type)) next.delete(type)
  else next.add(type)
  selectedTypes.value = next
}

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

// Mescla perfis base locais + perfis globais do servidor (sem duplicatas)
const allProfiles = computed<EquipmentProfile[]>(() => {
  const serverIds = new Set(equipStore.globalProfiles.map(p => p.id))
  const localOnly = BASE_EQUIPMENT_PROFILES.filter(p => !serverIds.has(p.id))
  return [...equipStore.globalProfiles, ...localOnly]
})

const visibleProfiles = computed(() => {
  let list = allProfiles.value

  if (onlyFavorites.value)          list = list.filter(p => favorites.value.includes(p.id))
  if (selectedTypes.value.size > 0) list = list.filter(p => p.setupType && selectedTypes.value.has(p.setupType))

  if (search.value) {
    const q = search.value.toLowerCase()
    list = list.filter(p =>
      p.name.toLowerCase().includes(q) ||
      (p.setupType && SETUP_TYPE_LABELS[p.setupType]?.toLowerCase().includes(q))
    )
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

function selectProfile(p: EquipmentProfile) {
  // Clique no mesmo item selecionado → fecha o expand
  selected.value = selected.value?.id === p.id ? null : p
}

function createFromScratch() {
  emit('select', null)
  open.value = false
}

async function handleImportFile(event: Event) {
  const input = event.target as HTMLInputElement
  const file  = input.files?.[0]
  if (!file) return
  try {
    const imported = await equipStore.importProfile(file)
    // Emite o perfil importado como base selecionada e fecha o picker
    emit('select', imported)
    open.value = false
  } catch (e) {
    console.error('Erro ao importar perfil:', e)
  } finally {
    input.value = ''
  }
}
</script>

<style scoped>
/* ── Sticky header (busca + filtros) ────────────────────────────── */
.ebp-sticky-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--bp-surface);
}

/* ── Filtros ────────────────────────────────────────────────────── */
.ebp-filter-btn {
  border: 1px solid var(--bp-border);
  border-radius: 6px;
  font-size: 12px;
  padding: 0 10px;
  height: 36px;   /* mesma altura do brew-pilot-search-input */
  flex-shrink: 0;
  position: relative;
}

.ebp-filter-menu {
  background: var(--bp-surface) !important;
  border: 1px solid var(--bp-border);
  border-radius: 8px;
}
.ebp-menu-item--active {
  background: color-mix(in srgb, #c1710e 10%, transparent);
}

/* ── Item da lista ───────────────────────────────────────────────── */
.picker-item {
  border-radius: 6px;
  transition: background 0.1s;
}
.picker-item--active {
  background: color-mix(in srgb, #c1710e 10%, transparent) !important;
  border: 1px solid color-mix(in srgb, #c1710e 25%, transparent);
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

/* ── Detalhes expandidos ─────────────────────────────────────────── */
.picker-item-expanded {
  padding-bottom: 4px;
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

.picker-item-notes {
  font-size: 11px;
  font-style: italic;
  color: var(--bp-text-muted);
  line-height: 1.5;
  margin: 0;
}

/* ── Chip de tipo no item ────────────────────────────────────────── */
.ebp-type-chip {
  font-size: 9px !important;
  height: 16px;
  background: color-mix(in srgb, #c1710e 15%, transparent) !important;
  color: var(--bp-text-secondary) !important;
  border-radius: 4px;
}
</style>
