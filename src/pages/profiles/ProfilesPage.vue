<template>
  <q-page class="profiles-page">

    <!-- ══ HUB: listagem das 5 categorias ══════════════════════════════════ -->
    <template v-if="!activeCategory">
      <div class="hub-header">
        <div class="hub-title">Perfis da Receita</div>
        <div class="hub-subtitle">
          Configure os perfis abaixo para ter todos os parâmetros prontos ao criar suas receitas.
        </div>
      </div>

      <div class="hub-grid">
        <div v-for="cat in categories" :key="cat.id"
          class="hub-card" :class="{ 'hub-card--soon': cat.comingSoon }"
          @click="!cat.comingSoon && $router.push('/profiles/' + cat.id)">

          <!-- Ícone -->
          <div class="hub-card-icon-wrap" :style="{ background: `color-mix(in srgb, ${cat.colorHex} 14%, transparent)` }">
            <q-icon :name="cat.icon" :color="cat.color" size="28px" />
          </div>

          <!-- Texto -->
          <div class="col column" style="gap: 2px; min-width: 0">
            <div class="hub-card-title">{{ cat.label }}</div>
            <div class="hub-card-desc">{{ cat.desc }}</div>
          </div>

          <!-- Direita: contagem ou badge -->
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
            <q-icon v-if="!cat.comingSoon" name="mdi-chevron-right" color="grey-5" size="20px" />
          </div>
        </div>
      </div>
    </template>

    <!-- ══ DETALHE DE CATEGORIA ═════════════════════════════════════════════ -->
    <template v-else>
      <div class="profiles-detail">

        <!-- ── EQUIPAMENTO ── -->
        <template v-if="activeCategory === 'equipment'">
          <div class="row items-center no-wrap q-mb-md" style="gap: 12px">
            <q-icon name="mdi-kettle" size="22px" color="primary" />
            <span class="detail-title">Perfis de Equipamento</span>
            <q-space />
            <brew-pilot-search-input v-model="search" placeholder="Buscar perfil..."
              style="max-width: 260px" />
            <brew-pilot-button variant="filled" color="primary" no-caps icon="mdi-plus"
              label="Criar Perfil" :disable="!equipStore.canAddMore" @click="openCreate" />
          </div>

          <!-- Banner limite Free -->
          <div v-if="!equipStore.canAddMore" class="eq-limit-banner q-mb-md">
            <q-icon name="mdi-lock-outline" size="14px" class="q-mr-xs" />
            Limite atingido: plano Free permite até {{ FREE_LIMIT }} perfis personalizados.
            <span class="eq-limit-link q-ml-xs">Assinar Pro</span>
          </div>

          <div v-if="equipStore.loading" class="row justify-center q-py-xl">
            <q-spinner color="primary" size="36px" />
          </div>

          <template v-else>
            <!-- Meus Perfis -->
            <div class="section-label q-mb-sm">Meus Perfis</div>
            <div v-if="filteredUserProfiles.length" class="column q-gutter-sm q-mb-xl">
              <div v-for="p in filteredUserProfiles" :key="p.id" class="eq-card">
                <div class="row items-start no-wrap">
                  <q-icon name="mdi-kettle" color="primary" size="22px" class="q-mr-sm q-mt-xs flex-shrink-0" />
                  <div class="col" style="min-width: 0">
                    <div class="row items-center no-wrap q-mb-xs" style="gap: 8px">
                      <span class="eq-card-name">{{ p.name }}</span>
                    </div>
                    <div class="eq-stats-grid">
                      <div class="eq-stat"><span class="eq-stat-label">Lote</span><span class="eq-stat-value">{{ p.batchVolume }} L</span></div>
                      <div class="eq-stat"><span class="eq-stat-label">Pré-Fervura</span><span class="eq-stat-value">{{ p.preBoilVolume }} L</span></div>
                      <div class="eq-stat"><span class="eq-stat-label">Fervura</span><span class="eq-stat-value">{{ p.boilTime }} min</span></div>
                      <div class="eq-stat"><span class="eq-stat-label">Eficiência</span><span class="eq-stat-value">{{ p.efficiency }}%</span></div>
                      <div class="eq-stat"><span class="eq-stat-label">Ef. Mostura</span><span class="eq-stat-value">{{ p.mashEfficiency }}%</span></div>
                      <div class="eq-stat"><span class="eq-stat-label">Evaporação</span><span class="eq-stat-value">{{ p.boilOffRate }} L/h</span></div>
                      <div class="eq-stat"><span class="eq-stat-label">Perda Trub</span><span class="eq-stat-value">{{ p.trubLoss }} L</span></div>
                      <div class="eq-stat"><span class="eq-stat-label">Perda Ferm.</span><span class="eq-stat-value">{{ p.fermentorLoss }} L</span></div>
                      <div v-if="p.hopUtilization" class="eq-stat"><span class="eq-stat-label">Util. Lúpulo</span><span class="eq-stat-value">{{ p.hopUtilization }}%</span></div>
                    </div>
                    <div v-if="p.notes" class="eq-notes q-mt-xs">{{ p.notes }}</div>
                  </div>
                  <div class="row q-gutter-xs flex-shrink-0 q-ml-sm">
                    <q-btn flat round dense size="sm" icon="mdi-pencil" color="grey-5" @click="openEdit(p)"><q-tooltip>Editar</q-tooltip></q-btn>
                    <q-btn flat round dense size="sm" icon="mdi-content-copy" color="grey-5"
                      :disable="!equipStore.canAddMore" @click="openCreateFromBase(p)"><q-tooltip>Duplicar</q-tooltip></q-btn>
                    <q-btn flat round dense size="sm" icon="mdi-delete" color="negative" @click="confirmDelete(p)"><q-tooltip>Excluir</q-tooltip></q-btn>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="text-caption q-mb-xl" style="color: var(--bp-text-muted)">
              Nenhum perfil personalizado ainda.
              <span v-if="equipStore.canAddMore" class="cursor-pointer eq-limit-link" @click="openCreate">Criar o primeiro →</span>
            </div>

            <!-- Perfis Padrão -->
            <div class="section-label q-mb-sm">Perfis Padrão</div>
            <div v-if="filteredGlobalProfiles.length" class="column q-gutter-sm">
              <div v-for="p in filteredGlobalProfiles" :key="p.id" class="eq-card eq-card--global">
                <div class="row items-start no-wrap">
                  <q-icon name="mdi-kettle" color="grey-5" size="22px" class="q-mr-sm q-mt-xs flex-shrink-0" />
                  <div class="col" style="min-width: 0">
                    <span class="eq-card-name">{{ p.name }}</span>
                    <div class="eq-stats-grid q-mt-sm">
                      <div class="eq-stat"><span class="eq-stat-label">Lote</span><span class="eq-stat-value">{{ p.batchVolume }} L</span></div>
                      <div class="eq-stat"><span class="eq-stat-label">Pré-Fervura</span><span class="eq-stat-value">{{ p.preBoilVolume }} L</span></div>
                      <div class="eq-stat"><span class="eq-stat-label">Fervura</span><span class="eq-stat-value">{{ p.boilTime }} min</span></div>
                      <div class="eq-stat"><span class="eq-stat-label">Eficiência</span><span class="eq-stat-value">{{ p.efficiency }}%</span></div>
                      <div class="eq-stat"><span class="eq-stat-label">Ef. Mostura</span><span class="eq-stat-value">{{ p.mashEfficiency }}%</span></div>
                      <div class="eq-stat"><span class="eq-stat-label">Evaporação</span><span class="eq-stat-value">{{ p.boilOffRate }} L/h</span></div>
                    </div>
                  </div>
                  <div class="flex-shrink-0 q-ml-sm">
                    <q-btn flat round dense size="sm" icon="mdi-content-copy" color="grey-5"
                      :disable="!equipStore.canAddMore" @click="openCreateFromBase(p)">
                      <q-tooltip>{{ equipStore.canAddMore ? 'Usar como base' : 'Limite atingido' }}</q-tooltip>
                    </q-btn>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="equipStore.userProfiles.length" class="text-caption q-mt-lg" style="color: var(--bp-text-muted)">
              {{ equipStore.userProfiles.length }} / {{ FREE_LIMIT }} perfis personalizados
            </div>
          </template>
        </template>

        <!-- ── EM BREVE ── -->
        <template v-else>
          <div class="row items-center no-wrap q-mb-md" style="gap: 12px">
            <q-icon :name="activecat?.icon ?? 'mdi-tune'" size="22px" :color="activecat?.color ?? 'primary'" />
            <span class="detail-title">{{ activecat?.label }}</span>
          </div>
          <div class="column items-center q-py-xl" style="gap: 16px; opacity: 0.45">
            <q-icon name="mdi-hammer-wrench" size="52px" color="grey-5" />
            <div class="text-subtitle2" style="color: var(--bp-text-secondary)">Em construção</div>
            <div class="text-caption text-center" style="color: var(--bp-text-muted); max-width: 260px">
              Esta seção estará disponível em breve.
            </div>
          </div>
        </template>

      </div>
    </template>

    <!-- ── Dialogs ──────────────────────────────────────────────────────────── -->
    <equipment-base-picker-dialog v-model="pickerDialog" @select="onPickerSelect" />
    <edit-equipment-dialog v-model="editDialog" :base-profile="editBase" @saved="onSaved" />

    <brew-pilot-dialog v-model="deleteDialog" title="Excluir Perfil"
      icon="mdi-delete" icon-color="negative" width="360px">
      <q-card-section class="q-pt-sm">
        <div style="color: var(--bp-text-secondary)">
          Deseja excluir <strong style="color: var(--bp-text-primary)">{{ deleteTarget?.name }}</strong>?
          Esta ação não pode ser desfeita.
        </div>
      </q-card-section>
      <template #footer>
        <q-card-actions align="right" class="q-px-md q-pb-md">
          <brew-pilot-button variant="flat" no-caps label="Cancelar" @click="deleteDialog = false" />
          <brew-pilot-button variant="filled" color="negative" no-caps label="Excluir"
            :loading="deleting" @click="doDelete" />
        </q-card-actions>
      </template>
    </brew-pilot-dialog>

  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useEquipmentStore } from '@/stores/equipmentStore'
import type { EquipmentProfile } from '@/types/equipment'
import BrewPilotButton from '@/components/shared/BrewPilotButton.vue'
import BrewPilotSearchInput from '@/components/shared/BrewPilotSearchInput.vue'
import BrewPilotDialog from '@/components/BrewPilotDialog.vue'
import EditEquipmentDialog from '../recipes/components/overview/dialogs/EditEquipmentDialog.vue'
import EquipmentBasePickerDialog from './EquipmentBasePickerDialog.vue'

const FREE_LIMIT = 2
const equipStore = useEquipmentStore()
const route = useRoute()

onMounted(() => { if (!equipStore.profiles.length) equipStore.fetchAll() })

// Categoria ativa deriva da rota (breadcrumb automático via router)
const activeCategory = computed(() => {
  const parts = route.path.split('/')
  return parts[2] ?? null
})

const search = ref('')
const pickerDialog = ref(false)
const editDialog = ref(false)
const editBase = ref<EquipmentProfile | null>(null)
const deleteDialog = ref(false)
const deleteTarget = ref<EquipmentProfile | null>(null)
const deleting = ref(false)

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
    comingSoon: true,
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

const activecat = computed(() => categories.find(c => c.id === activeCategory.value))

const filteredUserProfiles = computed(() => {
  const q = search.value.toLowerCase()
  return equipStore.userProfiles.filter(p => p.name.toLowerCase().includes(q))
})

const filteredGlobalProfiles = computed(() => {
  const q = search.value.toLowerCase()
  return equipStore.globalProfiles.filter(p => p.name.toLowerCase().includes(q))
})

function openCreate() { pickerDialog.value = true }
function onPickerSelect(base: EquipmentProfile | null) { editBase.value = base; editDialog.value = true }
function openEdit(p: EquipmentProfile) { editBase.value = p; editDialog.value = true }
function openCreateFromBase(p: EquipmentProfile) { editBase.value = p; editDialog.value = true }
function onSaved(_: EquipmentProfile) { /* store updated inside dialog */ }

function confirmDelete(p: EquipmentProfile) { deleteTarget.value = p; deleteDialog.value = true }

async function doDelete() {
  if (!deleteTarget.value) return
  deleting.value = true
  try {
    await equipStore.remove(deleteTarget.value.id)
    deleteDialog.value = false
    deleteTarget.value = null
  } finally {
    deleting.value = false
  }
}
</script>

<style scoped>
.profiles-page {
  padding: 0;
}

/* ── Hub ── */
.hub-header {
  padding: 28px 28px 16px;
  border-bottom: 1px solid var(--bp-border);
}

.hub-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--bp-text-primary);
  margin-bottom: 4px;
}

.hub-subtitle {
  font-size: 13px;
  color: var(--bp-text-secondary);
  max-width: 520px;
}

.hub-grid {
  padding: 20px 28px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 720px;
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

/* ── Detail ── */
.profiles-detail {
  padding: 20px 28px;
  max-width: 900px;
}

.detail-back:hover span {
  text-decoration: underline;
}

.detail-title {
  font-size: 17px;
  font-weight: 700;
  color: var(--bp-text-primary);
}

.section-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--bp-text-muted);
}

/* ── Equipment cards ── */
.eq-card {
  background: var(--bp-surface-alt);
  border: 1px solid var(--bp-border);
  border-radius: 10px;
  padding: 12px 14px;
  transition: border-color 0.15s;
}

.eq-card:hover { border-color: #c1710e66; }
.eq-card--global { opacity: 0.82; }

.eq-card-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--bp-text-primary);
}

.eq-stats-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 0;
}

.eq-stat {
  display: flex;
  flex-direction: column;
  min-width: 80px;
  padding: 3px 10px 3px 0;
  border-right: 1px solid var(--bp-border);
  margin-right: 10px;
}

.eq-stat:last-child { border-right: none; }
.eq-stat-label { font-size: 10px; color: var(--bp-text-muted); line-height: 1.3; }
.eq-stat-value { font-size: 13px; font-weight: 600; color: var(--bp-text-primary); line-height: 1.4; }

.eq-notes { font-size: 12px; color: var(--bp-text-secondary); font-style: italic; }

.eq-limit-banner {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: var(--bp-text-secondary);
  background: color-mix(in srgb, #c1710e 10%, transparent);
  border: 1px solid color-mix(in srgb, #c1710e 30%, transparent);
  border-radius: 6px;
  padding: 6px 10px;
}

.eq-limit-link { color: #c1710e; cursor: pointer; font-weight: 600; }
</style>
