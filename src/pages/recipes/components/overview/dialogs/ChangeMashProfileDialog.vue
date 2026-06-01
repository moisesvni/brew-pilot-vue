<template>
  <brew-pilot-dialog v-model="open" title="Selecionar Perfil de Mostura"
    icon="mdi-thermometer" icon-color="orange-6" width="580px" scrollable>
    <div v-if="!mashStore.canAddMore" class="q-px-md q-pt-md">
      <div class="upgrade-banner">
        <div class="row items-center no-wrap" style="gap: 10px">
          <div class="upgrade-icon-wrap">
            <q-icon name="mdi-crown" color="amber-7" size="20px" />
          </div>
          <div class="col">
            <div class="text-caption text-weight-bold upgrade-title">Limite do plano gratuito atingido</div>
            <div class="upgrade-sub">O plano Free permite ate {{ FREE_LIMIT }} perfis personalizados.</div>
          </div>
          <brew-pilot-subscription-plan-button />
        </div>
      </div>
    </div>

    <q-list class="q-px-sm q-pb-sm">
      <q-item-label header class="mp-section-label">Perfis de Mostura</q-item-label>

      <q-item v-for="profile in sortedProfiles" :key="profile.id"
        clickable v-ripple class="mp-item rounded-borders q-mb-xs"
        :class="{ 'mp-item--active': selectedProfileId === profile.id, 'mp-item--default': profile.isDefault }"
        @click="selectProfile(profile)">
        <q-item-section avatar style="min-width: 36px">
          <div :class="['mp-icon-wrap', profile.isDefault && 'mp-icon-wrap--default']">
            <q-icon v-if="profile.isDefault" name="mdi-star" color="amber-7" size="10px" />
            <q-icon name="mdi-thermometer" :color="selectedProfileId === profile.id ? 'primary' : (profile.isDefault ? 'amber-8' : 'grey-5')" size="18px" />
          </div>
        </q-item-section>
        <q-item-section>
          <q-item-label class="mp-item-name">{{ profile.name }}</q-item-label>
          <q-item-label caption class="mp-item-caption">{{ profileSummary(profile) }}</q-item-label>
        </q-item-section>
        <q-item-section side style="min-width: 24px">
          <q-icon v-if="selectedProfileId === profile.id" name="mdi-check-circle" color="primary" size="20px" />
        </q-item-section>
      </q-item>

      <q-item v-if="!sortedProfiles.length">
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
          :disable="!mashStore.canAddMore" size="sm" @click="openCreate" />
      </div>
    </template>
  </brew-pilot-dialog>

  <edit-mash-profile-dialog
    v-model="editDialog"
    :base-profile="editBase"
    @saved="onSaved" />
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useMashProfileStore } from '@/stores/mashProfileStore'
import type { MashProfile } from '@/types/mash'
import EditMashProfileDialog from '@/pages/profiles/mash/EditMashProfileDialog.vue'

const FREE_LIMIT = 3

const props = defineProps<{
  modelValue: boolean
  selectedProfileId?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [v: boolean]
  'selected': [profile: MashProfile]
}>()

const open = computed({ get: () => props.modelValue, set: v => emit('update:modelValue', v) })

const router = useRouter()
const mashStore = useMashProfileStore()

const editDialog = ref(false)
const editBase = ref<MashProfile | null>(null)

watch(() => props.modelValue, value => {
  if (value) {
    mashStore.fetchAll()
  }
})

const sortedProfiles = computed(() =>
  [...mashStore.profiles].sort((a, b) => {
    const defaultOrder = Number(Boolean(b.isDefault)) - Number(Boolean(a.isDefault))
    return defaultOrder || a.name.localeCompare(b.name, 'pt-BR')
  })
)

function profileSummary(profile: MashProfile) {
  const infusionStep = profile.steps.find(step => step.stepType === 'Infusion')
  const totalTime = profile.steps.reduce((sum, step) => sum + (step.time ?? 0), 0)
  const lead = infusionStep ? `${infusionStep.temperature}°C` : `${profile.steps.length} etapa(s)`
  return `${lead} · ${totalTime}min total`
}

function selectProfile(profile: MashProfile) {
  emit('selected', profile)
  open.value = false
}

function openCreate() {
  editBase.value = null
  editDialog.value = true
}

function onSaved(profile: MashProfile) {
  emit('selected', profile)
  editDialog.value = false
  open.value = false
}

function goToProfiles() {
  open.value = false
  router.push('/profiles/mash')
}
</script>

<style scoped>
.mp-section-label {
  font-size: 10px !important;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--bp-text-muted) !important;
  padding-bottom: 4px;
}

.mp-item {
  border: 1px solid transparent;
  transition: border-color 0.15s, background 0.15s;
}

.mp-item:hover {
  background: rgba(193, 113, 14, 0.06) !important;
  border-color: rgba(193, 113, 14, 0.18);
}

.mp-item--active {
  background: rgba(193, 113, 14, 0.08) !important;
  border-color: rgba(193, 113, 14, 0.30) !important;
}

.mp-item--default {
  border-left: 3px solid #f59e0b;
  border-color: color-mix(in srgb, #f59e0b 45%, var(--bp-border));
  background: color-mix(in srgb, #f59e0b 5%, var(--bp-surface-alt));
}

.mp-item-name {
  color: var(--bp-text-primary);
  font-size: 13px;
  font-weight: 500;
}

.mp-item-caption {
  color: var(--bp-text-muted) !important;
  font-size: 11px;
}

.mp-icon-wrap {
  background: color-mix(in srgb, var(--q-primary) 10%, transparent);
  border-radius: 6px;
  padding: 4px 5px;
  display: flex;
  align-items: center;
  gap: 2px;
}

.mp-icon-wrap--default {
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
  border-radius: 10px;
  padding: 8px;
  flex-shrink: 0;
}

.upgrade-title {
  color: var(--bp-text-primary);
  margin-bottom: 2px;
}

.upgrade-sub {
  color: var(--bp-text-secondary);
}
</style>