<template>
  <q-page class="q-pa-md">
    <!-- Cabeçalho ──────────────────────────────────────────────────────────── -->
    <div class="row items-center q-mb-md">
      <div class="text-h5 text-weight-bold col">Perfis de Equipamento</div>
      <q-btn
        label="Adicionar"
        color="primary"
        icon="add"
        unelevated
        :disable="!canAddMore"
        @click="openCreate"
      >
        <q-tooltip v-if="!canAddMore">
          Limite do plano Free atingido ({{ FREE_LIMIT }} perfis). Faça upgrade para Pro.
        </q-tooltip>
      </q-btn>
    </div>

    <!-- Plano Free: aviso de limite ────────────────────────────────────────── -->
    <q-banner
      v-if="!isPro"
      rounded
      class="bg-orange-1 text-orange-9 q-mb-md"
      icon="info_outline"
    >
      Plano Free: {{ userProfiles.length }}/{{ FREE_LIMIT }} perfis personalizados usados.
      <template #action>
        <q-btn flat label="Fazer upgrade" color="orange-9" />
      </template>
    </q-banner>

    <!-- Loading ─────────────────────────────────────────────────────────────── -->
    <div v-if="store.loading" class="flex flex-center q-py-xl">
      <q-spinner color="primary" size="40px" />
    </div>

    <!-- Perfis globais (padrão) ────────────────────────────────────────────── -->
    <template v-else>
      <div class="text-subtitle2 text-grey-7 q-mb-sm">Perfis Padrão</div>
      <div class="row q-col-gutter-md q-mb-lg">
        <div
          v-for="p in globalProfiles"
          :key="p.id"
          class="col-12 col-sm-6 col-md-4"
        >
          <EquipmentCard :profile="p" readonly />
        </div>
      </div>

      <div class="text-subtitle2 text-grey-7 q-mb-sm">Meus Perfis</div>
      <div class="row q-col-gutter-md">
        <div
          v-for="p in userProfiles"
          :key="p.id"
          class="col-12 col-sm-6 col-md-4"
        >
          <EquipmentCard :profile="p" @edit="openEdit(p)" @delete="confirmDelete(p)" />
        </div>
        <div v-if="!userProfiles.length" class="col-12 text-grey-5 text-body2">
          Nenhum perfil personalizado. Clique em "Adicionar" para criar o seu.
        </div>
      </div>
    </template>

    <!-- Dialog criar / editar ────────────────────────────────────────────────── -->
    <q-dialog v-model="dialogOpen" persistent>
      <q-card style="min-width: 380px; max-width: 520px; width: 100%">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ editTarget ? 'Editar Perfil' : 'Novo Perfil' }}</div>
          <q-space />
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-form @submit.prevent="saveProfile" class="q-gutter-sm">
            <q-input v-model="form.name" label="Nome" outlined dense :rules="[v => !!v || 'Obrigatório']" />
            <div class="row q-gutter-sm">
              <q-input v-model.number="form.batchVolume"   label="Vol. batelada (L)"  outlined dense type="number" class="col" />
              <q-input v-model.number="form.preBoilVolume" label="Pré-fervura (L)"    outlined dense type="number" class="col" />
            </div>
            <div class="row q-gutter-sm">
              <q-input v-model.number="form.boilTime"      label="Tempo fervura (min)" outlined dense type="number" class="col" />
              <q-input v-model.number="form.efficiency"    label="Eficiência (%)"      outlined dense type="number" class="col" />
            </div>
            <div class="row q-gutter-sm">
              <q-input v-model.number="form.mashEfficiency" label="Ef. mostura (%)"  outlined dense type="number" class="col" />
              <q-input v-model.number="form.boilOffRate"    label="Evap. fervura (%)" outlined dense type="number" class="col" />
            </div>
            <div class="row q-gutter-sm">
              <q-input v-model.number="form.trubLoss"      label="Perda trub (L)"    outlined dense type="number" class="col" />
              <q-input v-model.number="form.fermentorLoss" label="Perda ferment. (L)" outlined dense type="number" class="col" />
            </div>
            <div class="row q-gutter-sm">
              <q-input v-model.number="form.deadSpace"     label="Espaço morto (L)"  outlined dense type="number" class="col" />
              <q-input v-model.number="form.mashTunVolume" label="Vol. mosturador (L)" outlined dense type="number" class="col" />
            </div>
            <q-input v-model="form.notes" label="Notas" outlined dense type="textarea" autogrow />

            <q-banner v-if="saveError" rounded class="bg-negative text-white q-py-xs">{{ saveError }}</q-banner>

            <div class="row justify-end q-gutter-sm q-mt-xs">
              <q-btn flat label="Cancelar" v-close-popup />
              <q-btn label="Salvar" type="submit" color="primary" unelevated :loading="saving" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Confirm delete ───────────────────────────────────────────────────────── -->
    <q-dialog v-model="deleteDialogOpen">
      <q-card>
        <q-card-section>
          <div class="text-body1">Remover perfil <strong>{{ deleteTarget?.name }}</strong>?</div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn flat label="Remover" color="negative" @click="doDelete" :loading="deleting" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useEquipmentStore } from '@/stores/equipmentStore'
import { useAuthStore }      from '@/stores/authStore'
import type { EquipmentProfile } from '@/types/equipment'

const FREE_LIMIT = 2

const store     = useEquipmentStore()
const authStore = useAuthStore()

const isPro         = computed(() => authStore.isPro)
const canAddMore    = computed(() => store.canAddMore)
const globalProfiles = computed(() => store.globalProfiles)
const userProfiles   = computed(() => store.userProfiles)

onMounted(() => store.fetchAll())

// ── Dialog criar/editar ────────────────────────────────────────────────────
const dialogOpen = ref(false)
const editTarget = ref<EquipmentProfile | null>(null)
const saving     = ref(false)
const saveError  = ref('')

const emptyForm = () => ({
  name: '', batchVolume: 20, preBoilVolume: 25, boilTime: 60,
  efficiency: 75, mashEfficiency: 80, boilOffRate: 10,
  trubLoss: 1, fermentorLoss: 1, deadSpace: 2, mashTunVolume: 30,
  boilTemperature: 100, notes: '',
})
const form = ref(emptyForm())

function openCreate() {
  editTarget.value = null
  form.value = emptyForm()
  saveError.value = ''
  dialogOpen.value = true
}

function openEdit(p: EquipmentProfile) {
  editTarget.value = p
  form.value = { ...p, notes: p.notes ?? '' }
  saveError.value = ''
  dialogOpen.value = true
}

async function saveProfile() {
  saving.value    = true
  saveError.value = ''
  try {
    if (editTarget.value) {
      await store.update(editTarget.value.id, form.value)
    } else {
      await store.create(form.value)
    }
    dialogOpen.value = false
  } catch (e: unknown) {
    const msg = (e as { response?: { data?: { error?: string } } })?.response?.data?.error
    saveError.value = msg ?? 'Erro ao salvar perfil.'
  } finally {
    saving.value = false
  }
}

// ── Confirm delete ─────────────────────────────────────────────────────────
const deleteDialogOpen = ref(false)
const deleteTarget     = ref<EquipmentProfile | null>(null)
const deleting         = ref(false)

function confirmDelete(p: EquipmentProfile) {
  deleteTarget.value = p
  deleteDialogOpen.value = true
}

async function doDelete() {
  if (!deleteTarget.value) return
  deleting.value = true
  try {
    await store.remove(deleteTarget.value.id)
    deleteDialogOpen.value = false
  } finally {
    deleting.value = false
  }
}
</script>

