<template>
  <brew-pilot-dialog v-model="open" title="Selecionar Perfil de Equipamento"
    icon="mdi-kettle" icon-color="orange-6" width="580px" scrollable>
    <!-- Banner Upgrade -->
    <div v-if="!equipStore.canAddMore" class="q-px-md q-pt-md">
      <div class="upgrade-banner">
        <div class="row items-center no-wrap" style="gap: 10px">
          <div class="upgrade-icon-wrap">
            <q-icon name="mdi-crown" color="amber-7" size="20px" />
          </div>
          <div class="col">
            <div class="text-caption text-weight-bold upgrade-title">Limite do plano gratuito atingido</div>
            <div class="upgrade-sub">O plano Free permite até {{ FREE_LIMIT }} perfis personalizados.</div>
          </div>
          <brew-pilot-subscription-plan-button />
        </div>
      </div>
    </div>
    <q-list class="q-px-sm q-pb-sm">
      <!-- ── Meus Perfis ── -->
      <template v-if="filteredUserProfiles.length">
        <q-item-label header class="eq-section-label">Meus Perfis</q-item-label>
        <q-item v-for="p in sortedUserProfiles" :key="p.id"
          clickable v-ripple class="eq-item rounded-borders q-mb-xs"
          :class="{ 'eq-item--active': recipe.equipmentProfileId === p.id, 'eq-item--default': p.isDefault }"
          @click="selectProfile(p)">
          <q-item-section avatar style="min-width: 36px">
            <div :class="['eq-icon-wrap', p.isDefault && 'eq-icon-wrap--default']">
              <q-icon v-if="p.isDefault" name="mdi-star" color="amber-7" size="10px" />
              <q-icon name="mdi-kettle"
                :color="recipe.equipmentProfileId === p.id ? 'primary' : (p.isDefault ? 'amber-8' : 'grey-5')"
                size="18px" />
            </div>
          </q-item-section>
          <q-item-section>
            <q-item-label class="eq-item-name">{{ p.name }}</q-item-label>
            <q-item-label caption class="eq-item-caption">
              {{ p.batchVolume }}L &middot; {{ p.boilTime }}min fervura &middot; {{ p.efficiency }}% efic.
            </q-item-label>
          </q-item-section>
          <q-item-section side style="min-width: 24px">
            <q-icon v-if="recipe.equipmentProfileId === p.id"
              name="mdi-check-circle" color="primary" size="20px" />
          </q-item-section>
        </q-item>
      </template>

      <!-- ── Perfis Padrão ── -->
      <q-item-label header class="eq-section-label">Perfis Padrão</q-item-label>
      <q-item v-for="p in filteredGlobalProfiles" :key="p.id"
        clickable v-ripple class="eq-item rounded-borders q-mb-xs"
        :class="{ 'eq-item--active': recipe.equipmentProfileId === p.id }"
        @click="selectProfile(p)">
        <q-item-section avatar style="min-width: 36px">
          <div class="eq-icon-wrap">
            <q-icon name="mdi-kettle"
              :color="recipe.equipmentProfileId === p.id ? 'primary' : 'grey-5'"
              size="18px" />
          </div>
        </q-item-section>
        <q-item-section>
          <q-item-label class="eq-item-name">{{ p.name }}</q-item-label>
          <q-item-label caption class="eq-item-caption">
            {{ p.batchVolume }}L &middot; {{ p.boilTime }}min fervura &middot; {{ p.efficiency }}% efic.
          </q-item-label>
        </q-item-section>
        <q-item-section side style="min-width: 24px">
          <q-icon v-if="recipe.equipmentProfileId === p.id"
            name="mdi-check-circle" color="primary" size="20px" />
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
        <brew-pilot-button variant="flat" no-caps icon="mdi-cog-outline" label="Gerenciar Perfis"
          size="sm" @click="goToProfiles" />
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
  <brew-pilot-equipment-base-picker-dialog v-model="pickerDialog" @select="onPickerSelect" />

</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useRecipeStore } from '@/stores/recipeStore'
import { useEquipmentStore } from '@/stores/equipmentStore'
import type { EquipmentProfile } from '@/types/equipment'

const FREE_LIMIT = 2

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [v: boolean] }>()

const open = computed({ get: () => props.modelValue, set: v => emit('update:modelValue', v) })

const router = useRouter()
const store = useRecipeStore()
const recipe = computed(() => store.currentRecipe!)
const equipStore = useEquipmentStore()

const search = ref('')
const editDialog = ref(false)
const editBase = ref<EquipmentProfile | null>(null)
const fromPicker = ref(false)
const pickerDialog = ref(false)
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

const sortedUserProfiles = computed(() =>
  [...filteredUserProfiles.value].sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0))
)

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
  fromPicker.value = true
  editBase.value = p
  editDialog.value = true
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

function goToProfiles() {
  open.value = false
  router.push('/profiles/equipment')
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
.eq-item--default {
  border-left: 3px solid #f59e0b;
  border-color: color-mix(in srgb, #f59e0b 45%, var(--bp-border));
  background: color-mix(in srgb, #f59e0b 5%, var(--bp-surface-alt));
}
.eq-item--default:hover {
  border-color: color-mix(in srgb, #f59e0b 70%, transparent) !important;
  background: rgba(193, 113, 14, 0.08) !important;
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

.upgrade-banner {
  background: linear-gradient(
    135deg,
    color-mix(in srgb, #f59e0b 10%, var(--bp-surface-alt)),
    color-mix(in srgb, #c1710e 8%, var(--bp-surface-alt))
  );
  border: 1px solid color-mix(in srgb, #f59e0b 35%, transparent);
  border-radius: 10px;
  padding: 10px 12px;
  margin-bottom: 4px;
}
.upgrade-icon-wrap {
  background: color-mix(in srgb, #f59e0b 15%, transparent);
  border-radius: 8px;
  padding: 6px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
}
.upgrade-title { color: var(--bp-text-primary); margin-bottom: 1px; }
.upgrade-sub { font-size: 11px; color: var(--bp-text-secondary); }
</style>

