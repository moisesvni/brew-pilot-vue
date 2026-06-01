<template>
  <div class="q-pa-md">
    <!-- ── HEADER: 3 CARDS ───────────────────────────────────────────────── -->
    <div class="row q-col-gutter-md q-mb-md">
      <!-- ╔══ CARD 1 — Receita ═══════════════════════════════════════════╗ -->
      <div class="col-12 col-md-4">
        <q-card flat bordered class="card-dark">
          <q-card-section class="q-pa-sm" style="min-height: 170px;">
            <div class="row items-center no-wrap q-gutter-sm">
              <!-- Avatar / Swatch EBC -->
              <div class="recipe-thumb rounded-borders overflow-hidden flex flex-center flex-shrink-0 cursor-pointer"
                :style="{ backgroundColor: ebcToHex(stats?.ebc ?? 4) }" @click="showImageDialog()">
                <img v-if="recipe.imageUrl" :src="recipe.imageUrl" class="fit" style="object-fit:cover"
                  referrerpolicy="no-referrer" />
                <q-icon v-else name="mdi-beer" size="30px" color="white" style="opacity:.5" />
                <div class="thumb-overlay">
                  <q-icon name="mdi-camera" size="16px" color="white" />
                </div>
              </div>
              <!-- Campos direita -->
              <div class="col column q-gutter-none">
                <!-- Nome -->
                <div class="info-row">
                  <span class="info-label">Nome</span>
                  <q-input v-model="recipe.name"  dense class="col" placeholder="Nome da receita" />
                </div>
                <!-- Autor -->
                <div class="info-row">
                  <span class="info-label">Autor</span>
                  <q-input v-model="recipe.author"  dense class="col" placeholder="Nome do autor" />
                </div>
                <!-- Tipo + Versão chips -->
                <div class="info-row">
                  <span class="info-label">Tipo</span>
                   <q-select
                    v-model="recipe.type"
                    class="col"
                    :options="typeOptions"
                    option-value="value"
                    emit-value
                    map-options
                    transition-show="flip-up"
                    transition-hide="flip-down"
                  />
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-md-4">
        <q-card flat bordered class="card-dark">
          <q-card-section class="q-pa-sm">
            <!-- Header: ícone + nome + ações -->
            <div class="row items-center no-wrap q-mb-xs">
              <q-icon :name="recipe.equipmentProfile?.name ? 'mdi-kettle' : 'mdi-kettle-off'" size="24px" class="q-mr-xs flex-shrink-0"
                :style="{ color: recipe.equipmentProfile?.name ? 'var(--bp-text-secondary)' : 'var(--bp-text-muted)' }" />
              <brew-pilot-label :variant="recipe.equipmentProfile?.name ? 'primary' : 'muted'" size="13px" class="col ellipsis">
                {{ recipe.equipmentProfile?.name ?? 'Equipamento não selecionado' }}
              </brew-pilot-label>
              <div class="row q-gutter-xs flex-shrink-0">
                <brew-pilot-button round outline dense icon="mdi-resize" color="grey-5" size="md"
                  v-if="recipe.equipmentProfile?.name"
                  @click="showResizeEquipDialog()">
                  <q-tooltip>Redimensionar lote</q-tooltip>
                </brew-pilot-button>
                <brew-pilot-button round outline dense icon="mdi-swap-horizontal" color="grey-5" size="md"
                  v-if="recipe.equipmentProfile?.name && hasMultipleEquipProfiles"
                  @click="showChangeEquipDialog()">
                  <q-tooltip>Alterar equipamento</q-tooltip>
                </brew-pilot-button>
                <brew-pilot-button round outline dense icon="mdi-pencil" color="grey-5" size="md"
                  v-if="recipe.equipmentProfile?.name"
                  @click="showEditEquipDialog()">
                  <q-tooltip>Editar equipamento</q-tooltip>
                </brew-pilot-button>
                <brew-pilot-button round outline dense icon="mdi-plus" primary size="md"
                  v-if="!recipe.equipmentProfile?.name && equipStore.userProfiles.length > 0"
                  @click="showChangeEquipDialog()">
                  <q-tooltip>Selecionar equipamento</q-tooltip>
                </brew-pilot-button>
              </div>
            </div>
            <q-separator class="q-mb-xs" />

            <!-- Estado: carregando perfis -->
            <div v-if="equipStore.loading && !recipe.equipmentProfile"
              class="column items-center q-py-md q-gutter-xs">
              <q-spinner-dots color="primary" size="28px" />
              <brew-pilot-label variant="muted" size="11px">Carregando equipamentos...</brew-pilot-label>
            </div>

            <!-- Estado: sem nenhum perfil criado -->
            <div v-if="hasNoEquipProfiles && !recipe.equipmentProfile && !equipStore.loading"
              class="column items-center q-py-sm q-gutter-xs text-center">
              <q-icon name="mdi-kettle-off" size="32px" color="grey-5" />
              <brew-pilot-label variant="primary" size="12px" class="text-weight-medium">
                Nenhum perfil de equipamento
              </brew-pilot-label>
              <brew-pilot-label variant="muted" size="11px">
                Crie um perfil para calcular volumes e eficiências.
              </brew-pilot-label>
              <brew-pilot-button variant="outline" label="Criar Perfil" icon="mdi-plus"
                size="sm" no-caps class="q-mt-xs" @click="router.push('/profiles/equipment')" />
            </div>

            <!-- Estado: há perfis mas nenhum selecionado -->
            <div v-else-if="!recipe.equipmentProfile && equipStore.userProfiles.length"
              class="equip-pick-state column q-gutter-xs q-py-xs">
              <brew-pilot-label variant="secondary" size="11.5px" class="text-weight-medium q-mb-xs">
                Escolha um equipamento para esta receita
              </brew-pilot-label>
              <div v-for="p in equipStore.userProfiles.slice(0, 3)" :key="p.id"
                class="equip-pick-row row items-center no-wrap cursor-pointer rounded-borders"
                :class="{ 'equip-pick-row--default': p.isDefault }"
                @click="selectEquip(p)">
                <div :class="['equip-pick-icon', p.isDefault && 'equip-pick-icon--default']">
                  <q-icon v-if="p.isDefault" name="mdi-star" color="amber-7" size="9px" />
                  <q-icon name="mdi-kettle" :color="p.isDefault ? 'amber-8' : 'grey-5'" size="14px" />
                </div>
                <div class="col q-ml-xs">
                  <div class="equip-pick-name ellipsis">{{ p.name }}</div>
                  <div class="equip-pick-caption">{{ p.batchVolume }}L · {{ p.boilTime }}min · {{ p.efficiency }}%</div>
                </div>
                <q-icon name="mdi-chevron-right" color="grey-5" size="16px" />
              </div>
              <div v-if="equipStore.userProfiles.length > 3"
                class="text-center q-mt-xs">
                <brew-pilot-button variant="flat" no-caps size="xs" label="Ver todos"
                  icon="mdi-dots-horizontal" @click="showChangeEquipDialog()" />
              </div>
            </div>

            <!-- Dados do lote quando equipamento selecionado -->
            <div v-else-if="recipe.equipmentProfile" class="column q-gutter-none">
              <div class="row items-center no-wrap q-py-xs">
                <q-icon name="mdi-cup" size="12px" class="q-mr-xs flex-shrink-0"
                  :style="{ color: 'var(--bp-text-secondary)' }" />
                <BrewPilotLabel variant="secondary" size="12px" class="col">Volume do Lote</BrewPilotLabel>
                <BrewPilotLabel variant="value" size="12px">{{ recipe.batchVolume }} L</BrewPilotLabel>
              </div>
              <div class="row items-center no-wrap q-py-xs">
                <q-icon name="mdi-timer-outline" size="12px" class="q-mr-xs flex-shrink-0"
                  :style="{ color: 'var(--bp-text-secondary)' }" />
                <BrewPilotLabel variant="secondary" size="12px" class="col">Tempo de Fervura</BrewPilotLabel>
                <BrewPilotLabel variant="value" size="12px">{{ recipe.boilTime }} min</BrewPilotLabel>
              </div>
              <div class="row items-center no-wrap q-py-xs">
                <q-icon name="mdi-cup-outline" size="12px" class="q-mr-xs flex-shrink-0"
                  :style="{ color: 'var(--bp-text-secondary)' }" />
                <BrewPilotLabel variant="secondary" size="12px" class="col">Volume Pré Fervura</BrewPilotLabel>
                <BrewPilotLabel variant="value" size="12px">{{ recipe.preBoilVolume }} L</BrewPilotLabel>
              </div>
              <div class="row items-center no-wrap q-py-xs">
                <q-icon name="mdi-percent" size="12px" class="q-mr-xs flex-shrink-0"
                  :style="{ color: 'var(--bp-text-secondary)' }" />
                <BrewPilotLabel variant="secondary" size="12px" class="col">Eficiência</BrewPilotLabel>
                <BrewPilotLabel variant="value" size="12px">{{ recipe.efficiency }} %</BrewPilotLabel>
              </div>
              <div v-if="recipe.equipmentProfile?.mashEfficiency" class="row items-center no-wrap q-py-xs">
                <q-icon name="mdi-percent-outline" size="12px" class="q-mr-xs flex-shrink-0"
                  :style="{ color: 'var(--bp-text-secondary)' }" />
                <BrewPilotLabel variant="secondary" size="12px" class="col">Ef. da Mostura</BrewPilotLabel>
                <BrewPilotLabel variant="value" size="12px">{{ recipe.equipmentProfile.mashEfficiency }} %</BrewPilotLabel>
              </div>
              <div v-if="recipe.equipmentProfile?.boilTemperature" class="row items-center no-wrap q-py-xs">
                <q-icon name="mdi-thermometer" size="12px" class="q-mr-xs flex-shrink-0"
                  :style="{ color: 'var(--bp-text-secondary)' }" />
                <BrewPilotLabel variant="secondary" size="12px" class="col">Temp. de Fervura</BrewPilotLabel>
                <BrewPilotLabel variant="value" size="12px">{{ recipe.equipmentProfile.boilTemperature }} °C</BrewPilotLabel>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- ╔══ CARD 3 — Estilo ═════════════════════════════════════════════╗ -->
      <div class="col-12 col-md-4">
        <style-guide-card />
      </div>
    </div>
    <!-- ── SEÇÕES COLAPSÁVEIS ─────────────────────────────────────────────── -->
    <!-- Fermentáveis | Lúpulos -->
    <div class="row q-col-gutter-md">
      <div class="col-12 col-md-6">
        <fermentables-card />
      </div>
      <div class="col-12 col-md-6">
        <hops-card />
      </div>
    </div>

    <!-- Diversos -->
    <div class="row q-col-gutter-md q-mt-sm">
      <div class="col-12 col-md-6">
        <recipe-section title="Diversos" icon="mdi-flask-outline" icon-color="teal">
          <template #actions>
            <div class="misc-add-action">
              <brew-pilot-button variant="outline" round dense icon="mdi-plus" primary
                :disable="!hasSelectedStyle"
                :tooltip="hasSelectedStyle ? 'Adicionar Ingrediente' : undefined"
                @click.stop="miscTabRef?.openPicker()" />
              <q-tooltip v-if="!hasSelectedStyle" anchor="bottom middle" self="top middle" class="misc-action-tooltip">
                Selecione um estilo para liberar a adição de ingredientes diversos.
              </q-tooltip>
            </div>
          </template>
          <recipe-misc-tab v-if="recipe.miscs.length" ref="miscTabRef" :hide-button="true" />
          <overview-empty-state-banner
            v-else
            class="q-mt-xs"
            icon="mdi-flask-outline"
            tone="teal"
            title="Nenhum ingrediente diverso adicionado"
            description="Adicione clarificantes, especiarias, cascas, lactose e outros extras que completam a receita."
          />
        </recipe-section>
      </div>
      <div class="col-12 col-md-6">
        <yeast-card />
      </div>
    </div>

    <!-- Mostura | Fermentação -->
    <div class="row q-col-gutter-md q-mt-sm">
      <div class="col-12 col-md-6">
        <mash-card section="mash" />
      </div>
      <div class="col-12 col-md-6">
        <mash-card section="fermentation" />
      </div>
    </div>

    <!-- Água (full width – último) -->
    <div class="q-mt-sm">
      <water-card />
    </div>

    <!-- Outros (Tags, Anotações, Texto, Anexos) -->
    <div class="q-mt-sm">
      <others-card />
    </div>

    <!-- ── Dialogs ────────────────────────────────────────────────────────── -->
    <RecipeImageDialog v-if="imageDialogMounted" v-model="imageDialog" />
    <ChangeEquipmentDialog v-if="changeEquipDialogMounted" v-model="changeEquipDialog" />
    <ResizeEquipDialog v-if="resizeEquipDialogMounted" v-model="resizeEquipDialog" />
    <EditEquipmentDialog
      v-if="editEquipDialogMounted"
      v-model="editEquipDialog"
      :base-profile="recipe.equipmentProfile ?? null"
      @saved="applyEquipmentProfile"
    />
    <RecipeStyleDialog v-if="styleDialogMounted" v-model="styleDialog" />

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useRecipeStore } from '@/stores/recipeStore'
import { useEquipmentStore } from '@/stores/equipmentStore'
import { ebcToHex } from '@/core/utils/brewColors'
import type { EquipmentProfile } from '@/types/equipment'
import ChangeEquipmentDialog from '@/pages/recipes/components/overview/dialogs/ChangeEquipmentDialog.vue'
import EditEquipmentDialog from '@/pages/recipes/components/overview/dialogs/EditEquipmentDialog.vue'
import RecipeImageDialog from '@/pages/recipes/components/overview/dialogs/RecipeImageDialog.vue'
import RecipeStyleDialog from '@/pages/recipes/components/overview/dialogs/RecipeStyleDialog.vue'
import ResizeEquipDialog from '@/pages/recipes/components/overview/dialogs/ResizeEquipDialog.vue'
import OverviewEmptyStateBanner from '@/pages/recipes/components/overview/OverviewEmptyStateBanner.vue'

const store = useRecipeStore()
const recipe = computed(() => store.currentRecipe!)
const stats = computed(() => store.stats)
const router = useRouter()
const hasSelectedStyle = computed(() => Boolean(recipe.value.styleGuide))

const miscTabRef = ref<{ openPicker: () => void } | null>(null)

const equipStore = useEquipmentStore()
const hasMultipleEquipProfiles = computed(() => (equipStore.userProfiles.length + equipStore.globalProfiles.length) > 1)

function selectEquip(p: EquipmentProfile) {
  recipe.value.equipmentProfileId = p.id
  recipe.value.equipmentProfile = p
  recipe.value.batchVolume = p.batchVolume
  recipe.value.preBoilVolume = p.preBoilVolume
  recipe.value.boilTime = p.boilTime
  recipe.value.efficiency = p.efficiency
}

function applyEquipmentProfile(p: EquipmentProfile) {
  selectEquip(p)
}

function tryAutoSelect() {
  if (recipe.value.equipmentProfile) return
  const user = equipStore.userProfiles
  if (user.length === 1 && user[0].isDefault) {
    selectEquip(user[0])
  }
}

onMounted(async () => {
  if (!equipStore.profiles.length) await equipStore.fetchAll()
  tryAutoSelect()
})

watch(() => equipStore.userProfiles, tryAutoSelect)

const hasNoEquipProfiles = computed(() => !equipStore.loading && equipStore.userProfiles.length === 0)

const typeOptions = [
  { label: 'All Grain', value: 'AllGrain' },
  { label: 'Parcial', value: 'PartialMash' },
  { label: 'Extrato', value: 'Extract' },
]

// Dialog state refs
const imageDialog = ref(false)
const imageDialogMounted = ref(false)
const changeEquipDialog = ref(false)
const changeEquipDialogMounted = ref(false)
const resizeEquipDialog = ref(false)
const resizeEquipDialogMounted = ref(false)
const editEquipDialog = ref(false)
const editEquipDialogMounted = ref(false)
const styleDialog = ref(false)
const styleDialogMounted = ref(false)

function showImageDialog() {
  imageDialogMounted.value = true
  nextTick(() => {
    imageDialog.value = true
  })
}

function showChangeEquipDialog() {
  changeEquipDialogMounted.value = true
  nextTick(() => {
    changeEquipDialog.value = true
  })
}

function showResizeEquipDialog() {
  resizeEquipDialogMounted.value = true
  nextTick(() => {
    resizeEquipDialog.value = true
  })
}

function showEditEquipDialog() {
  editEquipDialogMounted.value = true
  nextTick(() => {
    editEquipDialog.value = true
  })
}

function showStyleDialog() {
  styleDialogMounted.value = true
  nextTick(() => {
    styleDialog.value = true
  })
}

watch(imageDialog, value => {
  if (!value && imageDialogMounted.value) {
    nextTick(() => {
      if (!imageDialog.value) imageDialogMounted.value = false
    })
  }
})

watch(changeEquipDialog, value => {
  if (!value && changeEquipDialogMounted.value) {
    nextTick(() => {
      if (!changeEquipDialog.value) changeEquipDialogMounted.value = false
    })
  }
})

watch(resizeEquipDialog, value => {
  if (!value && resizeEquipDialogMounted.value) {
    nextTick(() => {
      if (!resizeEquipDialog.value) resizeEquipDialogMounted.value = false
    })
  }
})

watch(editEquipDialog, value => {
  if (!value && editEquipDialogMounted.value) {
    nextTick(() => {
      if (!editEquipDialog.value) editEquipDialogMounted.value = false
    })
  }
})

watch(styleDialog, value => {
  if (!value && styleDialogMounted.value) {
    nextTick(() => {
      if (!styleDialog.value) styleDialogMounted.value = false
    })
  }
})
</script>

<style scoped>
.card-dark {
  background: var(--bp-card-bg) !important;
  border-color: var(--bp-card-border) !important;
}

.recipe-thumb {
  width: 115px;
  height: 115px;
  flex-shrink: 0;
  position: relative;
}

.thumb-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.45);
  opacity: 0;
  transition: opacity 0.15s;
}

.recipe-thumb:hover .thumb-overlay {
  opacity: 1;
}

.info-row {
  display: flex;
  align-items: baseline;
  gap: 6px;
  min-height: 24px;
}

.info-label {
  font-size: 12px;
  color: var(--bp-text-secondary);
  width: 42px;
  flex-shrink: 0;
}

.info-value {
  font-size: 13px;
  color: var(--bp-text-primary);
}

.equip-pick-row {
  padding: 5px 6px;
  border: 1px solid transparent;
  transition: background 0.12s, border-color 0.12s;
  gap: 4px;
}
.equip-pick-row:hover {
  background: rgba(193, 113, 14, 0.06);
  border-color: rgba(193, 113, 14, 0.18);
}
.equip-pick-row--default {
  border-left: 2px solid #f59e0b;
  border-color: color-mix(in srgb, #f59e0b 40%, var(--bp-border));
  background: color-mix(in srgb, #f59e0b 4%, var(--bp-surface-alt));
}
.equip-pick-icon {
  background: color-mix(in srgb, var(--q-primary) 10%, transparent);
  border-radius: 5px;
  padding: 3px 4px;
  display: flex;
  align-items: center;
  gap: 1px;
  flex-shrink: 0;
}
.equip-pick-icon--default {
  background: color-mix(in srgb, #f59e0b 15%, transparent);
}
.equip-pick-name {
  font-size: 12px;
  font-weight: 500;
  color: var(--bp-text-primary);
}
.equip-pick-caption {
  font-size: 10.5px;
  color: var(--bp-text-muted);
}

.misc-add-action {
  display: inline-flex;
}

.misc-action-tooltip {
  font-size: 12px;
}
</style>
