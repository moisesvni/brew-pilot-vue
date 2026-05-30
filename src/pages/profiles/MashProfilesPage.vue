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
            <div class="row items-start no-wrap">
              <q-icon name="mdi-thermometer" color="red-4" size="22px" class="q-mr-sm q-mt-xs flex-shrink-0" />

              <div class="col" style="min-width: 0">
                <!-- Nome + estrela padrão -->
                <div class="row items-center no-wrap q-mb-xs" style="gap: 8px">
                  <span class="mp-card-name">{{ p.name }}</span>
                  <q-icon v-if="p.isDefault" name="mdi-star" color="amber" size="14px">
                    <q-tooltip>Perfil padrão</q-tooltip>
                  </q-icon>
                </div>

                <!-- Stat chips -->
                <div class="mp-stats-row q-mb-xs">
                  <span class="mp-stat">
                    <span class="mp-stat-label">Etapas</span>
                    <span class="mp-stat-value">{{ p.steps.length }}</span>
                  </span>
                  <span class="mp-stat">
                    <span class="mp-stat-label">Tempo total</span>
                    <span class="mp-stat-value">{{ totalTime(p) }} min</span>
                  </span>
                  <span v-if="totalRamp(p) > 0" class="mp-stat">
                    <span class="mp-stat-label">Rampa</span>
                    <span class="mp-stat-value">{{ totalRamp(p) }} min</span>
                  </span>
                  <span class="mp-stat">
                    <span class="mp-stat-label">Temperatura</span>
                    <span class="mp-stat-value">{{ tempRange(p) }}</span>
                  </span>
                </div>

                <!-- Gráfico SVG mini -->
                <div v-if="p.steps.length" class="mp-chart-wrap">
                  <mash-temp-chart :steps="p.steps" />
                </div>

                <!-- Notas -->
                <div v-if="p.notes" class="mp-notes q-mt-xs">{{ p.notes }}</div>
              </div>

              <!-- Ações -->
              <div class="row q-gutter-xs flex-shrink-0 q-ml-sm">
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
          </div>
        </div>

        <div v-else class="text-caption q-mb-xl" style="color: var(--bp-text-muted)">
          Nenhum perfil personalizado ainda.
          <span v-if="mashStore.canAddMore" class="cursor-pointer mp-limit-link" @click="openCreate">Criar o primeiro →</span>
        </div>

        <!-- ── Perfis Padrão ── -->
        <div class="section-label q-mb-sm">Perfis Padrão</div>
        <div v-if="mashStore.defaultProfiles.length" class="column q-gutter-sm">
          <div v-for="p in mashStore.defaultProfiles" :key="p.id" class="mp-card mp-card--global">
            <div class="row items-start no-wrap">
              <q-icon name="mdi-thermometer" color="grey-5" size="22px" class="q-mr-sm q-mt-xs flex-shrink-0" />
              <div class="col" style="min-width: 0">
                <div class="row items-center no-wrap q-mb-xs" style="gap: 8px">
                  <span class="mp-card-name">{{ p.name }}</span>
                </div>
                <div class="mp-stats-row q-mb-xs">
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
                <div v-if="p.steps.length" class="mp-chart-wrap">
                  <mash-temp-chart :steps="p.steps" />
                </div>
                <div v-if="p.notes" class="mp-notes q-mt-xs">{{ p.notes }}</div>
              </div>
              <div class="flex-shrink-0 q-ml-sm">
                <q-btn flat round dense size="sm" icon="mdi-content-copy" color="grey-5"
                  :disable="!mashStore.canAddMore" @click="openCreateFromBase(p)">
                  <q-tooltip>{{ mashStore.canAddMore ? 'Usar como base' : 'Limite atingido' }}</q-tooltip>
                </q-btn>
              </div>
            </div>
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
import type { MashProfile } from '@/types/mash'
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
  return p.steps.reduce((sum, s) => sum + (s.rampTime ?? 0), 0)
}
function tempRange(p: MashProfile) {
  if (!p.steps.length) return '—'
  const temps = p.steps.map(s => s.temperature)
  const min = Math.min(...temps)
  const max = Math.max(...temps)
  return min === max ? `${min} °C` : `${min}–${max} °C`
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
  flex-wrap: wrap;
  gap: 0;
}

.mp-stat {
  display: flex;
  flex-direction: column;
  min-width: 80px;
  padding: 2px 10px 2px 0;
  margin-right: 10px;
  border-right: 1px solid var(--bp-border);
}

.mp-stat:last-child {
  border-right: none;
}

.mp-stat-label {
  font-size: 9px;
  font-weight: 500;
  color: var(--bp-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.mp-stat-value {
  font-size: 12px;
  font-weight: 600;
  color: var(--bp-text-primary);
}

.mp-chart-wrap {
  margin-top: 8px;
  max-width: 420px;
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
