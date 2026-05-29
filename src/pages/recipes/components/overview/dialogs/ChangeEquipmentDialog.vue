<template>
  <brew-pilot-dialog v-model="open" title="Selecionar Perfil de Equipamento"
    icon="mdi-kettle" icon-color="orange-6" width="580px" scrollable>

    <!-- Busca -->
    <div class="q-px-md q-pt-md q-pb-xs">
      <brew-pilot-search-input v-model="search" placeholder="Buscar perfil..." />
    </div>

    <!-- Banner limite Free -->
    <div v-if="!equipStore.canAddMore" class="q-px-md q-pt-sm">
      <div class="eq-limit-banner">
        <q-icon name="mdi-lock-outline" size="14px" class="q-mr-xs" />
        Limite atingido: plano Free permite até {{ FREE_LIMIT }} perfis personalizados.
        <a class="eq-limit-link" @click.prevent>Assinar Pro</a>
      </div>
    </div>

    <q-list class="q-px-sm q-pb-sm">

      <!-- ── Meus Perfis ── -->
      <template v-if="filteredUserProfiles.length">
        <q-item-label header class="eq-section-label">Meus Perfis</q-item-label>
        <q-item v-for="p in filteredUserProfiles" :key="p.id"
          clickable v-ripple class="eq-item rounded-borders q-mb-xs"
          :class="{ 'eq-item--active': recipe.equipmentProfileId === p.id }"
          @click="selectProfile(p)">
          <q-item-section avatar style="min-width:36px">
            <q-icon name="mdi-kettle"
              :color="recipe.equipmentProfileId === p.id ? 'primary' : 'grey-5'"
              size="20px" />
          </q-item-section>
          <q-item-section>
            <q-item-label class="eq-item-name">{{ p.name }}</q-item-label>
            <q-item-label caption class="eq-item-caption">
              {{ p.batchVolume }} L · {{ p.boilTime }} min · {{ p.efficiency }}%
            </q-item-label>
          </q-item-section>
          <q-item-section side class="row no-wrap q-gutter-xs">
            <q-btn flat round dense size="xs" icon="mdi-pencil"
              color="grey-5" @click.stop="openEdit(p)">
              <q-tooltip>Editar perfil</q-tooltip>
            </q-btn>
            <q-btn flat round dense size="xs" icon="mdi-delete"
              color="negative" @click.stop="confirmDelete(p)">
              <q-tooltip>Excluir perfil</q-tooltip>
            </q-btn>
            <q-icon v-if="recipe.equipmentProfileId === p.id"
              name="mdi-check-circle" color="positive" size="18px" class="q-ml-xs" />
          </q-item-section>
        </q-item>
      </template>

      <!-- ── Perfis Padrão ── -->
      <q-item-label header class="eq-section-label">Perfis Padrão</q-item-label>
      <q-item v-for="p in filteredGlobalProfiles" :key="p.id"
        clickable v-ripple class="eq-item rounded-borders q-mb-xs"
        :class="{ 'eq-item--active': recipe.equipmentProfileId === p.id }"
        @click="selectProfile(p)">
        <q-item-section avatar style="min-width:36px">
          <q-icon name="mdi-kettle"
            :color="recipe.equipmentProfileId === p.id ? 'primary' : 'grey-5'"
            size="20px" />
        </q-item-section>
        <q-item-section>
          <q-item-label class="eq-item-name">{{ p.name }}</q-item-label>
          <q-item-label caption class="eq-item-caption">
            {{ p.batchVolume }} L · {{ p.boilTime }} min · {{ p.efficiency }}%
          </q-item-label>
        </q-item-section>
        <q-item-section side class="row no-wrap items-center q-gutter-xs">
          <q-btn flat round dense size="xs" icon="mdi-content-copy"
            color="grey-5" :disable="!equipStore.canAddMore"
            @click.stop="openCreateFromBase(p)">
            <q-tooltip>{{ equipStore.canAddMore ? 'Usar como base' : 'Limite de perfis atingido' }}</q-tooltip>
          </q-btn>
          <q-icon v-if="recipe.equipmentProfileId === p.id"
            name="mdi-check-circle" color="positive" size="18px" class="q-ml-xs" />
        </q-item-section>
      </q-item>

      <q-item v-if="!filteredGlobalProfiles.length && !filteredUserProfiles.length">
        <q-item-section class="text-caption text-grey-5 text-center q-py-md">
          Nenhum perfil encontrado
        </q-item-section>
      </q-item>

    </q-list>

    <template #footer>
      <div class="row items-center q-px-md q-py-sm" style="gap: 8px">
        <brew-pilot-label v-if="equipStore.userProfiles.length" variant="muted" size="11px">
          {{ equipStore.userProfiles.length }} / {{ FREE_LIMIT }} perfis personalizados
        </brew-pilot-label>
        <q-space />
        <brew-pilot-button variant="outline" no-caps icon="mdi-plus" label="Criar Perfil"
          :disable="!equipStore.canAddMore" size="sm"
          @click="openCreateFromBase(null)" />
      </div>
    </template>

  </brew-pilot-dialog>

  <!-- Edit / Create dialog -->
  <edit-equipment-dialog
    v-model="editDialog"
    :base-profile="editBase"
    :show-back-to-picker="fromPicker"
    @back-to-picker="backToPicker"
    @saved="onSaved" />

  <!-- Picker de base -->
  <equipment-base-picker-dialog v-model="pickerDialog" @select="onPickerSelect" />

  <!-- Confirmação de exclusão -->
  <brew-pilot-dialog v-model="deleteDialog" title="Excluir Perfil"
    icon="mdi-delete" icon-color="negative" width="360px">
    <q-card-section class="q-pt-sm">
      <brew-pilot-label variant="secondary">
        Deseja excluir o perfil <strong>{{ deleteTarget?.name }}</strong>?
        Esta ação não pode ser desfeita.
      </brew-pilot-label>
    </q-card-section>
    <template #footer>
      <q-card-actions align="right" class="q-px-md q-pb-md">
        <brew-pilot-button variant="flat" no-caps label="Cancelar" @click="deleteDialog = false" />
        <brew-pilot-button variant="filled" color="negative" no-caps label="Excluir"
          :loading="deleting" @click="doDelete" />
      </q-card-actions>
    </template>
  </brew-pilot-dialog>

</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRecipeStore } from '@/stores/recipeStore'
import { useEquipmentStore } from '@/stores/equipmentStore'
import type { EquipmentProfile } from '@/types/equipment'

const FREE_LIMIT = 2

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [v: boolean] }>()

const open = computed({ get: () => props.modelValue, set: v => emit('update:modelValue', v) })

const store = useRecipeStore()
const recipe = computed(() => store.currentRecipe!)
const equipStore = useEquipmentStore()

const search = ref('')
const editDialog = ref(false)
const editBase = ref<EquipmentProfile | null>(null)
const fromPicker = ref(false)
const pickerDialog = ref(false)
const deleteDialog = ref(false)
const deleteTarget = ref<EquipmentProfile | null>(null)
const deleting = ref(false)

// Carrega os perfis ao abrir
watch(() => props.modelValue, (v) => {
  if (v) {
    search.value = ''
    equipStore.fetchAll()
  }
})

const filteredGlobalProfiles = computed(() => {
  const q = search.value.toLowerCase()
  return equipStore.globalProfiles.filter(p => p.name.toLowerCase().includes(q))
})

const filteredUserProfiles = computed(() => {
  const q = search.value.toLowerCase()
  return equipStore.userProfiles.filter(p => p.name.toLowerCase().includes(q))
})

function selectProfile(p: EquipmentProfile) {
  recipe.value.equipmentProfileId = p.id
  recipe.value.equipmentProfile = p
  recipe.value.batchVolume = p.batchVolume
  recipe.value.preBoilVolume = p.preBoilVolume
  recipe.value.boilTime = p.boilTime
  recipe.value.efficiency = p.efficiency
  open.value = false
}

function openEdit(p: EquipmentProfile) {
  fromPicker.value = false
  editBase.value = p
  editDialog.value = true
}

function openCreateFromBase(p: EquipmentProfile | null) {
  // Abre o picker de base em vez de criar direto
  pickerDialog.value = true
}

function onPickerSelect(base: EquipmentProfile | null) {
  fromPicker.value = true
  editBase.value = base
  editDialog.value = true
}

function backToPicker() {
  editDialog.value = false
  pickerDialog.value = true
}

function onSaved(saved: EquipmentProfile) {
  selectProfile(saved)
}

function confirmDelete(p: EquipmentProfile) {
  deleteTarget.value = p
  deleteDialog.value = true
}

async function doDelete() {
  if (!deleteTarget.value) return
  deleting.value = true
  try {
    await equipStore.remove(deleteTarget.value.id)
    if (recipe.value.equipmentProfileId === deleteTarget.value.id) {
      recipe.value.equipmentProfileId = undefined
      recipe.value.equipmentProfile = undefined
    }
  } finally {
    deleting.value = false
    deleteDialog.value = false
    deleteTarget.value = null
  }
}
</script>

<style scoped>
.eq-section-label {
  font-size: 10px !important;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--bp-text-muted) !important;
  padding-bottom: 4px;
}

.eq-item {
  border: 1px solid transparent;
  transition: border-color 0.15s, background 0.15s;
}
.eq-item:hover {
  background: rgba(193, 113, 14, 0.06) !important;
  border-color: rgba(193, 113, 14, 0.18);
}
.eq-item--active {
  background: rgba(193, 113, 14, 0.08) !important;
  border-color: rgba(193, 113, 14, 0.30) !important;
}
.eq-item-name {
  color: var(--bp-text-primary);
  font-size: 13px;
  font-weight: 500;
}
.eq-item-caption {
  color: var(--bp-text-muted) !important;
  font-size: 11px;
}
.eq-limit-banner {
  display: flex;
  align-items: center;
  background: rgba(193, 113, 14, 0.10);
  border: 1px solid rgba(193, 113, 14, 0.28);
  border-radius: 6px;
  padding: 7px 12px;
  font-size: 11.5px;
  color: var(--bp-text-secondary);
  gap: 4px;
}
.eq-limit-link {
  color: #c1710e;
  font-weight: 600;
  text-decoration: underline;
  cursor: pointer;
  margin-left: 4px;
}
</style>

