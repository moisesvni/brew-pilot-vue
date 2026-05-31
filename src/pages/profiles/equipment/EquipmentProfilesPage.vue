<template>
  <brew-pilot-page>
    <brew-pilot-page-header icon="mdi-kettle" title="Perfis de Equipamento" :bleed="false">
      <template #actions>
        <brew-pilot-button variant="filled" color="primary" no-caps icon="mdi-plus" label="Criar Perfil"
          :disable="!equipStore.canAddMore" @click="openCreate" />
      </template>
    </brew-pilot-page-header>

    <div class="q-pa-md">

      <!-- Loading -->
      <div v-if="equipStore.loading" class="row justify-center q-py-xl">
        <brew-pilot-loading />
      </div>

      <!-- Erro -->
      <q-banner v-else-if="equipStore.error" rounded dense class="bg-negative text-white q-mb-md">
        <template #avatar><q-icon name="mdi-alert-circle-outline" /></template>
        {{ equipStore.error }}
        <template #action>
          <q-btn flat dense no-caps label="Tentar novamente" @click="equipStore.fetchAll()" />
        </template>
      </q-banner>

      <template v-else>

        <!-- ── Banner Upgrade ────────────────────────────── -->
        <div v-if="!equipStore.canAddMore" class="upgrade-banner q-mb-lg">
          <div class="row items-center no-wrap" style="gap: 12px">
            <div class="upgrade-icon-wrap">
              <q-icon name="mdi-crown" color="amber-7" size="28px" />
            </div>
            <div class="col">
              <div class="text-body2 text-weight-bold upgrade-title">
                Você atingiu o limite do plano gratuito
              </div>
              <div class="text-caption upgrade-sub">
                O plano Free permite até {{ FREE_LIMIT }} perfis de equipamento.
                Altere seu plano, você cria perfis ilimitados e acessa recursos avançados.
              </div>
            </div>
            <brew-pilot-subscription-plan-button />
          </div>
        </div>
        <!-- Meus Perfis -->
        <div class="section-label q-mb-sm">Meus Perfis</div>
        <div v-if="filteredUserProfiles.length" class="column q-gutter-sm q-mb-xl">
          <div v-for="p in filteredUserProfiles" :key="p.id" :class="['eq-card', p.isDefault && 'eq-card--default']">
            <div class="row items-start no-wrap">
              <div :class="['eq-icon-wrap q-mr-sm flex-shrink-0', p.isDefault && 'eq-icon-wrap--default']" style="margin-top: 2px">
                <q-icon v-if="p.isDefault" name="mdi-star" color="amber-7" size="12px" />
                <q-icon name="mdi-kettle" :color="p.isDefault ? 'amber-8' : 'primary'" size="20px" />
              </div>
              <div class="col" style="min-width: 0">
                <div class="row items-center no-wrap q-mb-xs" style="gap: 8px">
                  <span class="eq-card-name">{{ p.name }}</span>
                </div>
                <div class="eq-stats-grid">
                  <div class="eq-stat"><span class="eq-stat-label">Lote</span><span class="eq-stat-value">{{
                      p.batchVolume }} L</span></div>
                  <div class="eq-stat"><span class="eq-stat-label">Pré-Fervura</span><span class="eq-stat-value">{{
                      p.preBoilVolume }} L</span></div>
                  <div class="eq-stat"><span class="eq-stat-label">Fervura</span><span class="eq-stat-value">{{
                      p.boilTime }} min</span></div>
                  <div class="eq-stat"><span class="eq-stat-label">Eficiência</span><span class="eq-stat-value">{{
                      p.efficiency }}%</span></div>
                  <div class="eq-stat"><span class="eq-stat-label">Ef. Mostura</span><span class="eq-stat-value">{{
                    p.mashEfficiency }}%</span></div>
                  <div class="eq-stat"><span class="eq-stat-label">Evaporação</span><span class="eq-stat-value">{{
                      p.boilOffRate }} L/h</span></div>
                  <div class="eq-stat"><span class="eq-stat-label">Perda Trub</span><span class="eq-stat-value">{{
                      p.trubLoss }} L</span></div>
                  <div class="eq-stat"><span class="eq-stat-label">Perda Ferm.</span><span class="eq-stat-value">{{
                      p.fermentorLoss }} L</span></div>
                  <div v-if="p.hopUtilization" class="eq-stat"><span class="eq-stat-label">Util. Lúpulo</span><span
                      class="eq-stat-value">{{ p.hopUtilization }}%</span></div>
                </div>
                <div v-if="p.notes" class="eq-notes q-mt-xs">{{ p.notes }}</div>
              </div>
              <div class="row q-gutter-xs flex-shrink-0 q-ml-sm">
                <template v-if="p.isDefault">
                  <q-btn flat round dense size="sm" icon="mdi-star-off" color="amber-6" @click="toggleDefault(p)">
                    <q-tooltip>Remover como padrão</q-tooltip>
                  </q-btn>
                </template>
                <template v-else>
                  <q-btn flat round dense size="sm" icon="mdi-star-outline" color="grey-5" @click="toggleDefault(p)">
                    <q-tooltip>Definir como padrão</q-tooltip>
                  </q-btn>
                </template>
                <q-btn flat round dense size="sm" icon="mdi-export-variant" color="grey-5"
                  @click="equipStore.exportProfile(p)">
                  <q-tooltip>Exportar como JSON</q-tooltip>
                </q-btn>
                <q-btn flat round dense size="sm" icon="mdi-pencil" color="grey-5" @click="openEdit(p)">
                  <q-tooltip>Editar</q-tooltip>
                </q-btn>
                <q-btn flat round dense size="sm" icon="mdi-content-copy" color="grey-5"
                  :disable="!equipStore.canAddMore" @click="openCreateFromBase(p)">
                  <q-tooltip>Duplicar</q-tooltip>
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
          <span v-if="equipStore.canAddMore" class="cursor-pointer eq-limit-link" @click="openCreate">Criar o primeiro
            →</span>
        </div>

        <!-- Perfis Padrão -->
        <div class="section-label q-mb-sm">Perfis Padrão</div>
        <div v-if="filteredGlobalProfiles.length" class="column q-gutter-sm">
          <div v-for="p in filteredGlobalProfiles" :key="p.id" class="eq-card eq-card--global">
            <div class="row items-start no-wrap">
              <q-icon name="mdi-kettle" color="grey-5" size="22px" class="q-mr-sm q-mt-xs flex-shrink-0" />
              <div class="col" style="min-width: 0">
                <div class="row items-center no-wrap q-mb-xs" style="gap: 8px">
                  <span class="eq-card-name">{{ p.name }}</span>
                  <q-icon v-if="p.isDefault" name="mdi-star" color="primary" size="16px">
                    <q-tooltip>Perfil padrão</q-tooltip>
                  </q-icon>
                </div>
                <div class="eq-stats-grid q-mt-sm">
                  <div class="eq-stat"><span class="eq-stat-label">Lote</span><span class="eq-stat-value">{{
                      p.batchVolume }} L</span></div>
                  <div class="eq-stat"><span class="eq-stat-label">Pré-Fervura</span><span class="eq-stat-value">{{
                      p.preBoilVolume }} L</span></div>
                  <div class="eq-stat"><span class="eq-stat-label">Fervura</span><span class="eq-stat-value">{{
                      p.boilTime }} min</span></div>
                  <div class="eq-stat"><span class="eq-stat-label">Eficiência</span><span class="eq-stat-value">{{
                      p.efficiency }}%</span></div>
                  <div class="eq-stat"><span class="eq-stat-label">Ef. Mostura</span><span class="eq-stat-value">{{
                    p.mashEfficiency }}%</span></div>
                  <div class="eq-stat"><span class="eq-stat-label">Evaporação</span><span class="eq-stat-value">{{
                      p.boilOffRate }} L/h</span></div>
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
    </div>

    <!-- Dialogs -->
    <brew-pilot-equipment-base-picker-dialog v-model="pickerDialog" @select="onPickerSelect" />
    <brew-pilot-edit-equipment-dialog v-model="editDialog" :base-profile="editBase" :show-back-to-picker="fromPicker"
      @back-to-picker="backToPicker" @saved="onSaved" />

    <brew-pilot-dialog v-model="deleteDialog" title="Excluir Perfil" icon="mdi-delete" icon-color="negative"
      width="360px">
      <q-card-section class="q-pt-sm">
        <div style="color: var(--bp-text-secondary)">
          Deseja excluir <strong style="color: var(--bp-text-primary)">{{ deleteTarget?.name }}</strong>?
          Esta ação não pode ser desfeita.
        </div>
      </q-card-section>
      <template #footer>
        <q-card-actions align="right" class="q-px-md q-pb-md">
          <brew-pilot-button variant="flat" no-caps label="Cancelar" @click="deleteDialog = false" />
          <brew-pilot-button variant="filled" color="negative" no-caps label="Excluir" :loading="deleting"
            @click="doDelete" />
        </q-card-actions>
      </template>
    </brew-pilot-dialog>
  </brew-pilot-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useEquipmentStore } from '@/stores/equipmentStore'
import type { EquipmentProfile } from '@/types/equipment'

const FREE_LIMIT = 2
const $q = useQuasar()
const equipStore = useEquipmentStore()

onMounted(() => { if (!equipStore.profiles.length) equipStore.fetchAll() })

const pickerDialog = ref(false)
const editDialog = ref(false)
const editBase = ref<EquipmentProfile | null>(null)
const fromPicker = ref(false)
const deleteDialog = ref(false)
const deleteTarget = ref<EquipmentProfile | null>(null)
const deleting = ref(false)

const filteredUserProfiles = computed(() =>
  [...equipStore.userProfiles].sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0))
)
const filteredGlobalProfiles = computed(() => equipStore.globalProfiles)

function openCreate() { pickerDialog.value = true }
function onPickerSelect(base: EquipmentProfile | null) { fromPicker.value = true; editBase.value = base; editDialog.value = true }
function backToPicker() { editDialog.value = false; pickerDialog.value = true }
function openEdit(p: EquipmentProfile) { fromPicker.value = false; editBase.value = p; editDialog.value = true }
function openCreateFromBase(p: EquipmentProfile) { fromPicker.value = false; editBase.value = p; editDialog.value = true }
function onSaved(_: EquipmentProfile) { /* store updated inside dialog */ }

async function toggleDefault(p: EquipmentProfile) {
  const newDefault = !p.isDefault
  try {
    await equipStore.update(p.id, { ...p, isDefault: newDefault })
  } catch {
    $q.notify({ type: 'negative', message: 'Erro ao atualizar perfil padrão.', timeout: 3000 })
  }
}

function confirmDelete(p: EquipmentProfile) { deleteTarget.value = p; deleteDialog.value = true }

async function doDelete() {
  if (!deleteTarget.value) return
  deleting.value = true
  try {
    await equipStore.remove(deleteTarget.value.id)
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
.section-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--bp-text-muted);
}

.eq-card {
  background: var(--bp-surface-alt);
  border: 1px solid var(--bp-border);
  border-radius: 10px;
  padding: 12px 14px;
  transition: border-color 0.15s;
}

.eq-card:hover {
  border-color: color-mix(in srgb, var(--q-primary) 35%, transparent);
}

/* ── Card padrão — destaque âmbar ── */
.eq-card--default {
  border-left: 3px solid #f59e0b;
  border-color: color-mix(in srgb, #f59e0b 45%, var(--bp-border));
  background: color-mix(in srgb, #f59e0b 5%, var(--bp-surface-alt));
}
.eq-card--default:hover {
  border-color: color-mix(in srgb, #f59e0b 70%, transparent);
}

.eq-icon-wrap {
  background: color-mix(in srgb, var(--q-primary) 10%, transparent);
  border-radius: 6px;
  padding: 4px 5px;
  display: flex;
  align-items: center;
  gap: 2px;
}
.eq-icon-wrap--default {
  background: color-mix(in srgb, #f59e0b 15%, transparent);
}

.eq-card--global {
  opacity: 0.82;
}

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

.eq-stat:last-child {
  border-right: none;
}

.eq-stat-label {
  font-size: 10px;
  color: var(--bp-text-muted);
  line-height: 1.3;
}

.eq-stat-value {
  font-size: 13px;
  font-weight: 600;
  color: var(--bp-text-primary);
  line-height: 1.4;
}

.eq-notes {
  font-size: 12px;
  color: var(--bp-text-secondary);
  font-style: italic;
}

.upgrade-banner {
  background: linear-gradient(
    135deg,
    color-mix(in srgb, #f59e0b 10%, var(--bp-surface-alt)),
    color-mix(in srgb, #c1710e 8%, var(--bp-surface-alt))
  );
  border: 1px solid color-mix(in srgb, #f59e0b 35%, transparent);
  border-radius: 12px;
  padding: 14px 16px;
}
.upgrade-icon-wrap {
  background: color-mix(in srgb, #f59e0b 15%, transparent);
  border-radius: 10px;
  padding: 8px;
  flex-shrink: 0;
}
.upgrade-title { color: var(--bp-text-primary); margin-bottom: 2px; }
.upgrade-sub { color: var(--bp-text-secondary); }
</style>
