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
              <q-icon name="mdi-kettle" color="grey-5" size="24px" class="q-mr-xs flex-shrink-0" />
              <span class="text-caption text-weight-bold text-grey-2 ellipsis col">
                {{ recipe.equipmentProfile?.name ?? 'Equipamento não selecionado' }}
              </span>
              <div class="row q-gutter-xs flex-shrink-0">
                <!-- Redimensionar -->
                <q-btn round outline dense icon="mdi-resize" color="grey-5" size="md" @click="resizeEquipDialog = true">
                  <q-tooltip>Redimensionar lote</q-tooltip>
                </q-btn>
                <!-- Alterar equipamento -->
                <q-btn round outline dense icon="mdi-swap-horizontal" color="grey-5" size="md" @click="changeEquipDialog = true"
                  v-if="recipe.equipmentProfile?.name">
                  <q-tooltip>Alterar equipamento</q-tooltip>
                </q-btn>
                <!-- Editar equipamento -->
                <q-btn round outline dense icon="mdi-pencil" color="grey-5" size="md" @click="editEquipDialog = true">
                  <q-tooltip>Editar equipamento</q-tooltip>
                </q-btn>
              </div>
            </div>
            <q-separator class="q-mb-xs" />

            <!-- Dados do lote — texto compacto -->
            <div class="column q-gutter-none">
              <div class="row items-center no-wrap q-py-xs">
                <q-icon name="mdi-cup" size="12px" color="grey-6" class="q-mr-xs flex-shrink-0" />
                <span class="text-caption text-grey-6 col">Volume do Lote</span>
                <span class="text-caption text-grey-3">{{ recipe.batchVolume }} L</span>
              </div>
              <div class="row items-center no-wrap q-py-xs">
                <q-icon name="mdi-timer-outline" size="12px" color="grey-6" class="q-mr-xs flex-shrink-0" />
                <span class="text-caption text-grey-6 col">Tempo de Fervura</span>
                <span class="text-caption text-grey-3">{{ recipe.boilTime }} min</span>
              </div>
              <div class="row items-center no-wrap q-py-xs">
                <q-icon name="mdi-cup-outline" size="12px" color="grey-6" class="q-mr-xs flex-shrink-0" />
                <span class="text-caption text-grey-6 col">Volume Pré Fervura</span>
                <span class="text-caption text-grey-3">{{ recipe.preBoilVolume }} L</span>
              </div>
              <div class="row items-center no-wrap q-py-xs">
                <q-icon name="mdi-percent" size="12px" color="grey-6" class="q-mr-xs flex-shrink-0" />
                <span class="text-caption text-grey-6 col">Eficiência</span>
                <span class="text-caption text-grey-3">{{ recipe.efficiency }} %</span>
              </div>
              <div v-if="recipe.equipmentProfile?.mashEfficiency" class="row items-center no-wrap q-py-xs">
                <q-icon name="mdi-percent-outline" size="12px" color="grey-6" class="q-mr-xs flex-shrink-0" />
                <span class="text-caption text-grey-6 col">Ef. da Mostura</span>
                <span class="text-caption text-grey-3">{{ recipe.equipmentProfile.mashEfficiency }} %</span>
              </div>
              <div v-if="recipe.equipmentProfile?.boilTemperature" class="row items-center no-wrap q-py-xs">
                <q-icon name="mdi-thermometer" size="12px" color="grey-6" class="q-mr-xs flex-shrink-0" />
                <span class="text-caption text-grey-6 col">Temp. de Fervura</span>
                <span class="text-caption text-grey-3">{{ recipe.equipmentProfile.boilTemperature }} °C</span>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- ╔══ CARD 3 — Estilo ═════════════════════════════════════════════╗ -->
      <div class="col-12 col-md-4">
        <q-card flat bordered class="card-dark full-height">
          <q-card-section>
            <!-- Cabeçalho estilo -->
            <div class="row items-center justify-between q-mb-sm">
              <div class="row items-center no-wrap">
                <q-icon :name="recipe.styleGuide ? 'mdi-check-circle' : 'mdi-circle-outline'"
                  :color="recipe.styleGuide ? 'positive' : 'grey-6'" size="15px" class="q-mr-xs" />
                <span class="text-caption text-weight-bold ellipsis"
                  :class="recipe.styleGuide ? 'text-white' : 'text-grey-5'" style="max-width: 200px">
                  {{ recipe.styleGuide
                    ? `${recipe.styleGuide.code} ${recipe.styleGuide.name}`
                    : 'Nenhum estilo selecionado' }}
                </span>
              </div>
              <q-btn flat round dense size="xs" icon="mdi-pencil" color="grey-5" @click="styleDialog = true" />
            </div>

            <!-- Barras de range -->
            <template v-if="stats && recipe.styleGuide">
              <recipe-style-range-bar label="ABV" :current="stats.abv" :min="recipe.styleGuide.abvMin"
                :max="recipe.styleGuide.abvMax" :decimals="1" />
              <recipe-style-range-bar label="OG" :current="stats.og" :min="recipe.styleGuide.ogMin"
                :max="recipe.styleGuide.ogMax" :decimals="3" />
              <recipe-style-range-bar label="FG" :current="stats.fg" :min="recipe.styleGuide.fgMin"
                :max="recipe.styleGuide.fgMax" :decimals="3" />
              <recipe-style-range-bar label="EBC" :current="stats.ebc" :min="recipe.styleGuide.ebcMin"
                :max="recipe.styleGuide.ebcMax" :decimals="1" />
              <recipe-style-range-bar label="IBU" :current="stats.ibu" :min="recipe.styleGuide.ibuMin"
                :max="recipe.styleGuide.ibuMax" :decimals="0" />
              <recipe-style-range-bar label="BU/GU" :current="stats.buGuRatio"
                :min="Number((recipe.styleGuide.ibuMin / ((recipe.styleGuide.ogMin - 1) * 1000)).toFixed(2))"
                :max="Number((recipe.styleGuide.ibuMax / ((recipe.styleGuide.ogMax - 1) * 1000)).toFixed(2))"
                :decimals="2" />
            </template>
            <div v-else class="text-caption text-grey-6 q-mt-sm text-center q-py-md">
              <q-icon name="mdi-chart-bar" size="28px" class="q-mb-xs block" /><br>
              Selecione um estilo para ver a comparação
            </div>
          </q-card-section>
        </q-card>
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
            <q-btn outline rounded dense no-caps label="+ ADICIONAR" color="primary" size="md"
              @click.stop="miscTabRef?.openPicker()" />
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
import { ref, computed, onMounted } from 'vue'
import { useRecipeStore } from '../../../stores/recipeStore'
import { useEquipmentStore } from '../../../stores/equipmentStore'
import RecipeStyleRangeBar from '../components/RecipeStyleRangeBar.vue'
import RecipeSection from '../components/RecipeSection.vue'
import RecipeMiscTab from './RecipeMiscTab.vue'
import FermentablesCard from '../components/overview/FermentablesCard.vue'
import HopsCard from '../components/overview/HopsCard.vue'
import YeastCard from '../components/overview/YeastCard.vue'
import MashCard from '../components/overview/MashCard.vue'
import WaterCard from '../components/overview/WaterCard.vue'
import OthersCard from '../components/overview/OthersCard.vue'
import { ebcToHex } from '../../../utils/brewColors'
import RecipeImageDialog from '../components/overview/dialogs/RecipeImageDialog.vue'
import ChangeEquipmentDialog from '../components/overview/dialogs/ChangeEquipmentDialog.vue'
import ResizeEquipDialog from '../components/overview/dialogs/ResizeEquipDialog.vue'
import EditEquipmentDialog from '../components/overview/dialogs/EditEquipmentDialog.vue'
import RecipeStyleDialog from '../components/overview/dialogs/RecipeStyleDialog.vue'

const store = useRecipeStore()
const recipe = computed(() => store.currentRecipe!)
const stats = computed(() => store.stats)

const miscTabRef = ref<InstanceType<typeof RecipeMiscTab> | null>(null)

const equipStore = useEquipmentStore()
onMounted(() => { if (!equipStore.profiles.length) equipStore.fetchAll() })

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
