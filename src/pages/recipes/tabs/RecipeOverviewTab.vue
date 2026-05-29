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
                :style="{ backgroundColor: ebcToHex(stats?.ebc ?? 4) }" @click="imageDialog = true">
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
                   <q-select v-model="recipe.type" class="col" :options="typeOptions" option-value="label" 
                   transition-show="flip-up"
                  transition-hide="flip-down"/>
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
              <q-icon name="mdi-kettle" size="24px" class="q-mr-xs flex-shrink-0"
                :style="{ color: 'var(--bp-text-secondary)' }" />
              <span class="text-caption text-weight-bold ellipsis col"
                style="color: var(--bp-text-primary)">
                {{ recipe.equipmentProfile?.name ?? 'Equipamento não selecionado' }}
              </span>
              <div class="row q-gutter-xs flex-shrink-0">
                <!-- Redimensionar (só quando há equipamento selecionado) -->
                <q-btn round outline dense icon="mdi-resize" color="grey-5" size="md"
                  v-if="recipe.equipmentProfile?.name"
                  @click="resizeEquipDialog = true">
                  <q-tooltip>Redimensionar lote</q-tooltip>
                </q-btn>
                <!-- Alterar equipamento -->
                <q-btn round outline dense icon="mdi-swap-horizontal" color="grey-5" size="md" @click="changeEquipDialog = true"
                  v-if="recipe.equipmentProfile?.name">
                  <q-tooltip>Alterar equipamento</q-tooltip>
                </q-btn>
                <!-- Editar equipamento -->
                <q-btn round outline dense icon="mdi-pencil" color="grey-5" size="md" @click="editEquipDialog = true"
                 v-if="recipe.equipmentProfile?.name">
                  <q-tooltip>Editar equipamento</q-tooltip>
                </q-btn>
                <!-- Adicionar (quando nenhum perfil selecionado e há perfis disponíveis) -->
                <q-btn round outline dense icon="mdi-plus" color="primary" size="md"
                  v-if="!recipe.equipmentProfile?.name && !hasNoEquipProfiles"
                  @click="changeEquipDialog = true">
                  <q-tooltip>Selecionar equipamento</q-tooltip>
                </q-btn>
              </div>
            </div>
            <q-separator class="q-mb-xs" />

            <!-- Alerta: sem nenhum perfil de equipamento criado -->
            <div v-if="hasNoEquipProfiles && !recipe.equipmentProfile"
              class="column items-center q-py-sm q-gutter-sm text-center">
              <q-icon name="mdi-alert-circle-outline" size="36px" color="warning" />
              <div class="text-caption text-weight-medium" style="color: var(--bp-text-primary)">
                Nenhum perfil de equipamento criado
              </div>
              <div class="text-caption" style="color: var(--bp-text-secondary)">
                Crie um perfil para calcular volumes e eficiências corretamente.
              </div>
              <brew-pilot-button
                variant="outline"
                color="warning"
                label="Criar Perfil"
                icon="mdi-plus"
                size="sm"
                no-caps
                @click="router.push('/profiles/equipment')"
              />
            </div>

            <!-- Dados do lote — texto compacto -->
            <div v-else class="column q-gutter-none">
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

    <!-- Diversos | Levedura -->
    <div class="row q-col-gutter-md q-mt-sm">
      <div class="col-12 col-md-6">
        <recipe-section title="Diversos" icon="mdi-flask-outline" icon-color="teal">
          <template #actions>
            <brew-pilot-button variant="outline" round dense icon="mdi-plus" primary
              tooltip="Adicionar Ingrediente" @click.stop="miscTabRef?.openPicker()" />
          </template>
          <recipe-misc-tab ref="miscTabRef" :hide-button="true" />
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
    <recipe-image-dialog v-model="imageDialog" />
    <change-equipment-dialog v-model="changeEquipDialog" />
    <resize-equip-dialog v-model="resizeEquipDialog" />
    <edit-equipment-dialog v-model="editEquipDialog" />
    <recipe-style-dialog v-model="styleDialog" />

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, type ComponentPublicInstance } from 'vue'
import { useRouter } from 'vue-router'
import { useRecipeStore } from '@/stores/recipeStore'
import { useEquipmentStore } from '@/stores/equipmentStore'
import { ebcToHex } from '@/core/utils/brewColors'

const store = useRecipeStore()
const recipe = computed(() => store.currentRecipe!)
const stats = computed(() => store.stats)
const router = useRouter()

const miscTabRef = ref<ComponentPublicInstance | null>(null)

const equipStore = useEquipmentStore()
onMounted(() => { if (!equipStore.profiles.length) equipStore.fetchAll() })

const hasNoEquipProfiles = computed(() => !equipStore.loading && equipStore.userProfiles.length === 0)

const typeOptions = [
  { label: 'All Grain', value: 'AllGrain' },
  { label: 'Parcial', value: 'PartialMash' },
  { label: 'Extrato', value: 'Extract' },
]

// Dialog state refs
const imageDialog = ref(false)
const changeEquipDialog = ref(false)
const resizeEquipDialog = ref(false)
const editEquipDialog = ref(false)
const styleDialog = ref(false)
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
</style>
