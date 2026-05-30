<template>
  <q-page class="mash-profiles-page">
    <brew-pilot-page-header icon="mdi-thermometer" title="Perfis de Mostura" :bleed="false">
      <template #actions>
        <brew-pilot-button
          variant="filled"
          color="primary"
          no-caps
          icon="mdi-plus"
          label="Criar Perfil"
          :disable="!mashStore.canAddMore"
          @click="openCreate"
        />
      </template>
    </brew-pilot-page-header>

    <div class="profiles-content">
      <!-- Banner limite Free -->
      <div v-if="!mashStore.canAddMore" class="mp-limit-banner q-mb-md">
        <q-icon name="mdi-lock-outline" size="14px" class="q-mr-xs" />
        Limite atingido: plano Free permite até {{ FREE_LIMIT }} perfis personalizados.
        <span class="mp-limit-link q-ml-xs">Assinar Pro</span>
      </div>

      <!-- Loading -->
      <div v-if="mashStore.loading" class="row justify-center q-py-xl">
        <q-spinner color="primary" size="36px" />
      </div>

      <!-- Erro -->
      <template v-else-if="mashStore.error">
        <div class="mp-error-banner q-mb-md">
          <q-icon name="mdi-alert-circle-outline" size="14px" class="q-mr-xs" />
          {{ mashStore.error }}
          <span class="mp-limit-link q-ml-xs cursor-pointer" @click="mashStore.fetchAll()">Tentar novamente</span>
        </div>
      </template>

      <template v-else>
        <!-- ── Meus Perfis ── -->
        <div class="section-label q-mb-sm">Meus Perfis</div>

        <div v-if="mashStore.userProfiles.length" class="column q-gutter-sm q-mb-xl">
          <div v-for="p in mashStore.userProfiles" :key="p.id" class="mp-card">
            <!-- Topo: ícone + nome + ações -->
            <div class="row items-center no-wrap q-mb-sm" style="gap: 8px">
              <q-icon name="mdi-thermometer" color="red-4" size="20px" class="flex-shrink-0" />
              <div class="row items-center no-wrap col" style="gap: 6px; min-width: 0">
                <span class="mp-card-name">{{ p.name }}</span>
                <q-icon v-if="p.isDefault" name="mdi-star" color="amber" size="13px">
                  <q-tooltip>Perfil padrão</q-tooltip>
                </q-icon>
                <q-badge v-if="p.biab" color="blue-7" label="BIAB" style="font-size:9px" />
                <q-badge v-if="p.batchSparge" color="teal-6" label="Batch Sparge" style="font-size:9px" />
              </div>
              <div class="row q-gutter-xs flex-shrink-0">
                <q-btn flat round dense size="sm" icon="mdi-pencil" color="grey-5" @click="openEdit(p)">
                  <q-tooltip>Editar</q-tooltip>
                </q-btn>
                <q-btn flat round dense size="sm" icon="mdi-content-copy" color="grey-5"
                  :disable="!mashStore.canAddMore" @click="openCreateFromBase(p)">
                  <q-tooltip>{{ mashStore.canAddMore ? 'Duplicar' : 'Limite atingido' }}</q-tooltip>
                </q-btn>
                <q-btn flat round dense size="sm" icon="mdi-delete" color="negative" @click="confirmDelete(p)">
                  <q-tooltip>Excluir</q-tooltip>
                </q-btn>
              </div>
            </div>

            <!-- Corpo 2 colunas -->
            <div class="mp-card-body">
              <!-- Esquerda: stats + etapas -->
              <div class="mp-left">
                <div class="mp-stats-row q-mb-sm">
                  <span class="mp-stat">
                    <span class="mp-stat-label">Etapas</span>
                    <span class="mp-stat-value">{{ p.steps.length }}</span>
                  </span>
                  <span class="mp-stat">
                    <span class="mp-stat-label">Tempo total</span>
                    <span class="mp-stat-value">{{ totalTime(p) }} min</span>
                  </span>
                  <span class="mp-stat">
                    <span class="mp-stat-label">Temperatura</span>
                    <span class="mp-stat-value">{{ tempRange(p) }}</span>
                  </span>
                </div>
                <div class="mp-step-list">
                  <div v-for="(s, si) in p.steps" :key="s.id" class="mp-step-row">
                    <q-icon :name="stepChipIcon(s.stepType)" :color="stepChipColorName(s.stepType)" size="11px" class="flex-shrink-0" />
                    <span class="mp-step-name">{{ s.name || stepChipLabel(s.stepType) }}</span>
                    <span class="mp-step-meta">{{ s.temperature }}°C · {{ s.time }}min</span>
                  </div>
                </div>
              </div>
              <!-- Direita: gráfico -->
              <div v-if="p.steps.length" class="mp-right">
                <mash-temp-chart :steps="p.steps" />
              </div>
            </div>

            <!-- Notas -->
            <div v-if="p.notes" class="mp-notes q-mt-sm">{{ p.notes }}</div>
          </div>
        </div>

        <div v-else class="text-caption q-mb-xl" style="color: var(--bp-text-muted)">
          Nenhum perfil personalizado ainda.
          <span v-if="mashStore.canAddMore" class="cursor-pointer mp-limit-link" @click="openCreate">Criar o primeiro →</span>
        </div>

        <div v-if="mashStore.defaultProfiles.length" class="column q-gutter-sm">
          <div v-for="p in mashStore.defaultProfiles" :key="p.id" class="mp-card mp-card--global">
            <!-- Topo: ícone + nome + ação -->
            <div class="row items-center no-wrap q-mb-sm" style="gap: 8px">
              <q-icon name="mdi-thermometer" color="grey-5" size="20px" class="flex-shrink-0" />
              <span class="mp-card-name col">{{ p.name }}</span>
              <q-btn flat round dense size="sm" icon="mdi-content-copy" color="grey-5"
                :disable="!mashStore.canAddMore" @click="openCreateFromBase(p)">
                <q-tooltip>{{ mashStore.canAddMore ? 'Usar como base' : 'Limite atingido' }}</q-tooltip>
              </q-btn>
            </div>

            <!-- Corpo 2 colunas -->
            <div class="mp-card-body">
              <!-- Esquerda: stats + etapas -->
              <div class="mp-left">
                <div class="mp-stats-row q-mb-sm">
                  <span class="mp-stat">
                    <span class="mp-stat-label">Etapas</span>
                    <span class="mp-stat-value">{{ p.steps.length }}</span>
                  </span>
                  <span class="mp-stat">
                    <span class="mp-stat-label">Tempo total</span>
                    <span class="mp-stat-value">{{ totalTime(p) }} min</span>
                  </span>
                  <span class="mp-stat">
                    <span class="mp-stat-label">Temperatura</span>
                    <span class="mp-stat-value">{{ tempRange(p) }}</span>
                  </span>
                </div>
                <div class="mp-step-list">
                  <div v-for="(s, si) in p.steps" :key="s.id" class="mp-step-row">
                    <q-icon :name="stepChipIcon(s.stepType)" :color="stepChipColorName(s.stepType)" size="11px" class="flex-shrink-0" />
                    <span class="mp-step-name">{{ s.name || stepChipLabel(s.stepType) }}</span>
                    <span class="mp-step-meta">{{ s.temperature }}°C · {{ s.time }}min</span>
                  </div>
                </div>
              </div>
              <!-- Direita: gráfico -->
              <div v-if="p.steps.length" class="mp-right">
                <mash-temp-chart :steps="p.steps" />
              </div>
            </div>

            <!-- Notas -->
            <div v-if="p.notes" class="mp-notes q-mt-sm">{{ p.notes }}</div>
          </div>
        </div>

        <div v-if="mashStore.userProfiles.length" class="text-caption q-mt-lg" style="color: var(--bp-text-muted)">
          {{ mashStore.userProfiles.length }} / {{ FREE_LIMIT }} perfis personalizados
        </div>
      </template>
    </div>

    <!-- Dialog de edição/criação -->
    <edit-mash-profile-dialog
      v-model="editDialog"
      :base-profile="editBase"
      @saved="onSaved"
    />

    <!-- Dialog de confirmação de exclusão -->
    <brew-pilot-dialog
      v-model="deleteDialog"
      title="Excluir Perfil"
      icon="mdi-delete"
      icon-color="negative"
      width="360px"
    >
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
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useMashProfileStore } from '@/stores/mashProfileStore'
import type { MashProfile, MashProfileStep } from '@/types/mash'
import type { MashStepType } from '@/types/recipe'
import EditMashProfileDialog from './EditMashProfileDialog.vue'
import MashTempChart from './MashTempChart.vue'

const FREE_LIMIT = 3
const $q = useQuasar()
const mashStore = useMashProfileStore()

onMounted(() => { if (!mashStore.profiles.length) mashStore.fetchAll() })

const editDialog  = ref(false)
const editBase    = ref<MashProfile | null>(null)
const deleteDialog = ref(false)
const deleteTarget = ref<MashProfile | null>(null)
const deleting     = ref(false)

// ── Helpers ───────────────────────────────────────────────────────────────
function totalTime(p: MashProfile) {
  return p.steps.reduce((sum, s) => sum + (s.time ?? 0), 0)
}
function totalRamp(p: MashProfile) {
  return p.steps.reduce((sum, s) => sum + (s.rampDuration ?? 0), 0)
}
function tempRange(p: MashProfile) {
  if (!p.steps.length) return '—'
  const temps = p.steps.map(s => s.temperature)
  const min = Math.min(...temps)
  const max = Math.max(...temps)
  return min === max ? `${min} °C` : `${min}–${max} °C`
}

function stepChipColor(type: MashStepType) {
  return type === 'Infusion' ? 'blue-7' : type === 'Decoction' ? 'red-7' : 'orange-7'
}
function stepChipColorName(type: MashStepType) {
  return type === 'Infusion' ? 'blue-7' : type === 'Decoction' ? 'red-7' : 'orange-7'
}
function stepChipIcon(type: MashStepType) {
  return type === 'Infusion' ? 'mdi-water-plus' : type === 'Decoction' ? 'mdi-pot-steam-outline' : 'mdi-thermometer'
}
function stepChipLabel(type: MashStepType) {
  return type === 'Infusion' ? 'Infusão' : type === 'Decoction' ? 'Decocção' : 'Temp.'
}

// ── Actions ───────────────────────────────────────────────────────────────
function openCreate() {
  editBase.value = null
  editDialog.value = true
}

function openEdit(p: MashProfile) {
  editBase.value = p
  editDialog.value = true
}

function openCreateFromBase(p: MashProfile) {
  editBase.value = { ...p, isDefault: true }  // force copy mode
  editDialog.value = true
}

function onSaved(_: MashProfile) { /* store updated inside dialog */ }

function confirmDelete(p: MashProfile) {
  deleteTarget.value = p
  deleteDialog.value = true
}

async function doDelete() {
  if (!deleteTarget.value) return
  deleting.value = true
  try {
    await mashStore.remove(deleteTarget.value.id)
    deleteDialog.value = false
    deleteTarget.value = null
    $q.notify({ type: 'positive', message: 'Perfil excluído.', timeout: 2000 })
  } catch {
    $q.notify({ type: 'negative', message: 'Erro ao excluir perfil. Tente novamente.', timeout: 4000 })
  } finally {
    deleting.value = false
  }
}
</script>

<style scoped>
.mash-profiles-page {
  padding: 0;
}

.profiles-content {
  padding: 20px 28px;
}

.section-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--bp-text-muted);
}

.mp-card {
  background: var(--bp-surface-alt);
  border: 1px solid var(--bp-border);
  border-radius: 10px;
  padding: 12px 14px;
  transition: border-color 0.15s;
}

.mp-card:hover {
  border-color: #ef535066;
}

.mp-card--global {
  opacity: 0.82;
}

.mp-card-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--bp-text-primary);
}

.mp-stats-row {
  display: flex;
  flex-wrap: nowrap;
  gap: 0;
  margin-bottom: 8px;
  overflow: hidden;
}

.mp-stat {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 3px 8px 3px 0;
  margin-right: 8px;
  border-right: 1px solid var(--bp-border);
  white-space: nowrap;
  min-width: 0;
  flex-shrink: 1;
}
.mp-stat:last-child {
  border-right: none;
  margin-right: 0;
}

.mp-stat-label {
  font-size: 9px;
  font-weight: 500;
  color: var(--bp-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.4px;
  line-height: 1.2;
}

.mp-stat-value {
  font-size: 12px;
  font-weight: 600;
  color: var(--bp-text-primary);
}

.mp-chart-wrap {
  margin-top: 10px;
  max-width: 560px;
}

.mp-card-body {
  display: flex;
  gap: 100px;
  align-items: flex-start;
}

.mp-left {
  flex: 0 0 210px;
  width: 210px;
  min-width: 0;
}

.mp-right {
  flex: 0 0 460px;
  width: 460px;
  min-width: 0;
  overflow: hidden;
}

.mp-step-list {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.mp-step-row {
  display: flex;
  align-items: center;
  gap: 5px;
  min-width: 0;
}

.mp-step-name {
  font-size: 11px;
  font-weight: 500;
  color: var(--bp-text-secondary);
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mp-step-meta {
  font-size: 10px;
  color: var(--bp-text-muted);
  flex-shrink: 0;
  white-space: nowrap;
}

@media (max-width: 599px) {
  .mp-card-body {
    flex-direction: column;
  }
  .mp-left {
    flex: none;
    width: 100%;
  }
}

.mp-notes {
  font-size: 12px;
  color: var(--bp-text-secondary);
  font-style: italic;
}

.mp-limit-banner {
  background: color-mix(in srgb, var(--q-primary) 8%, transparent);
  border: 1px solid color-mix(in srgb, var(--q-primary) 30%, transparent);
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 13px;
  color: var(--bp-text-secondary);
  display: flex;
  align-items: center;
}

.mp-error-banner {
  background: color-mix(in srgb, var(--q-negative) 8%, transparent);
  border: 1px solid color-mix(in srgb, var(--q-negative) 30%, transparent);
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 13px;
  color: var(--bp-text-secondary);
  display: flex;
  align-items: center;
}

.mp-limit-link {
  color: var(--q-primary);
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
}
</style>
