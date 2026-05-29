<template>
  <brew-pilot-dialog v-model="open" :title="dialogTitle" icon="mdi-kettle" icon-color="orange-6" width="720px"
    scrollable :loading="saving">
    <template #header-actions>
      <q-btn flat round dense icon="mdi-help-circle-outline" color="grey-5" :disable="saving">
        <q-tooltip>Ajuda sobre campos de equipamento</q-tooltip>
      </q-btn>

      <q-btn flat round dense :icon="form.isDefault ? 'mdi-star' : 'mdi-star-outline'"
        :color="form.isDefault ? 'amber' : 'grey-5'" :disable="saving" @click="form.isDefault = !form.isDefault">
        <q-tooltip>{{ form.isDefault ? 'Equipamento padrão' : 'Definir como padrão' }}</q-tooltip>
      </q-btn>

      <!-- Exportar perfil (só quando editando) -->
      <q-btn v-if="isEditing" flat round dense icon="mdi-export-variant" color="grey-5"
        :disable="saving" @click="handleExport">
        <q-tooltip>Exportar perfil como JSON</q-tooltip>
      </q-btn>

    </template>
    <div class="q-pa-md" :inert="saving ? true : undefined" :style="saving ? 'opacity: 0.55; pointer-events: none; transition: opacity 0.2s' : 'transition: opacity 0.2s'">
      <!-- ── 1. Identificação ──────────────────────────────────────── -->
      <brew-pilot-form-section title="Identificação">
        <div class="row q-col-gutter-sm">
          <div class="col-12 col-sm-8">
            <brew-pilot-input v-model="form.name" label="Nome" />
          </div>
          <div class="col-12 col-sm-4">
            <brew-pilot-select v-model="form.setupType" :options="setupTypeOptions" emit-value map-options
              label="Tipo de Sistema" />
          </div>
          <!-- chip descritivo do setup -->
          <div v-if="setupInfo" class="col-12">
            <div class="eq-setup-info">
              <q-icon :name="setupInfo.icon" size="14px" color="primary" class="q-mr-xs" />
              <span>{{ setupInfo.desc }}</span>
            </div>
          </div>
          <div class="col-12">
            <brew-pilot-input v-model="form.notes" type="textarea" autogrow label="Descrição"
              input-style="min-height: 56px; font-size: 13px" />
          </div>
        </div>
      </brew-pilot-form-section>

      <!-- ── 2. Lote & Fermentador ─────────────────────────────────── -->
      <brew-pilot-form-section title="Lote & Fermentador">
        <div class="row q-col-gutter-sm">
          <div class="col-12 col-sm-6">
            <brew-pilot-select v-model="form.batchVolumeTarget" :options="batchTargetOptions" emit-value map-options
              label="Volume Desejado" />
          </div>
          <div class="col-12 col-sm-6">
            <brew-pilot-input v-model.number="form.batchVolume" type="number" :label="batchVolumeLabel" suffix="L" />
          </div>
          <div class="col-12 col-sm-6">
            <brew-pilot-select v-model="form.fermenterType" :options="fermenterTypeOptions" emit-value map-options
              label="Tipo de Fermentador" />
          </div>
          <div class="col-12 col-sm-6">
            <brew-pilot-input v-model.number="form.fermentorLoss" type="number" step="0.1"
              label="Perda no Fermentador" suffix="L">
              <template #hint>{{ fermenterLossHint }}</template>
            </brew-pilot-input>
          </div>
          <div v-if="showTopUpInMain" class="col-12 col-sm-6">
            <brew-pilot-input v-model.number="form.fermenterWater" type="number" step="0.1"
              label="Água de Top-up no Fermentador" suffix="L">
              <template #hint>{{ topUpWaterHint }}</template>
            </brew-pilot-input>
          </div>
        </div>
      </brew-pilot-form-section>

      <!-- ── 3. Fervura ────────────────────────────────────────────── -->
      <brew-pilot-form-section v-if="hasBoil" title="Fervura">
        <div class="row q-col-gutter-sm">
          <div class="col-12 col-sm-4">
            <brew-pilot-input v-model.number="form.boilTime" type="number" label="Tempo de Fervura" suffix="min" />
          </div>
          <div class="col-12 col-sm-4">
            <brew-pilot-input v-model.number="form.boilOffRate" type="number" step="0.1"
              :label="`Evaporação (${evapPct}%)`" suffix="L/h" />
          </div>
          <div class="col-12 col-sm-4">
            <brew-pilot-input v-model.number="form.trubLoss" type="number" step="0.1" label="Perda Trub/Chiller"
              suffix="L">
              <template #hint>Resíduo na panela: trub, perdas no chiller, etc.</template>
            </brew-pilot-input>
          </div>
          <div class="col-12">
            <q-checkbox v-model="form.calculateBoilVolume" dense label="Calcular volume de fervura automaticamente"
              color="primary" />
          </div>
          <div class="col-12 col-sm-6">
            <brew-pilot-input
              :model-value="form.calculateBoilVolume ? calcPreBoilVol : form.preBoilVolume"
              @update:model-value="(v: string | number | null) => { if (!form.calculateBoilVolume) form.preBoilVolume = +(v ?? 0) }"
              type="number"
              :label="form.calculateBoilVolume ? 'Volume Pré-Fervura (calculado)' : 'Volume Pré-Fervura'"
              suffix="L" :disable="form.calculateBoilVolume" />
          </div>
        </div>
      </brew-pilot-form-section>

      <!-- ── 4. Mostura & Lavagem ──────────────────────────────────── -->
      <brew-pilot-form-section v-if="hasMash" title="Mostura & Lavagem">
        <div class="row q-col-gutter-sm">

          <!-- BIAB: espreme o saco + espaço morto -->
          <template v-if="isBIAB">
            <div class="col-12 col-sm-6">
              <brew-pilot-input v-model.number="form.deadSpace" type="number" step="0.1"
                label="Espaço Morto (fundo da panela)" suffix="L">
                <template #hint>Volume abaixo da torneira (~0,5–1 L)</template>
              </brew-pilot-input>
            </div>
            <div class="col-12 col-sm-6 flex items-center">
              <q-checkbox v-model="form.bagSqueeze" dense color="primary" label="Espreme o saco (BIAB)">
                <q-tooltip max-width="240px">
                  Espremer o saco reduz a absorção em ~30%, aumentando o rendimento.
                  Troca a absorção padrão de 1,0 → 0,7 L/kg.
                </q-tooltip>
              </q-checkbox>
            </div>
          </template>

          <!-- 2 ou 3 Panelas / Mini-Mash: método de lavagem + perdas -->
          <template v-else>
            <div class="col-12 col-sm-6">
              <brew-pilot-select v-model="form.lauterMethod" :options="lauterMethodOptions" emit-value map-options
                label="Método de Lavagem dos Grãos" />
            </div>
            <!-- chip descritivo do método -->
            <div v-if="lauterInfo" class="col-12">
              <div class="eq-setup-info">
                <q-icon :name="lauterInfo.icon" size="14px" color="primary" class="q-mr-xs" />
                <span>{{ lauterInfo.desc }}</span>
              </div>
            </div>
            <div class="col-12 col-sm-6">
              <brew-pilot-input v-model.number="form.deadSpace" type="number" step="0.1"
                label="Espaço Morto — Panela de Mostura" suffix="L" />
            </div>
            <div class="col-12 col-sm-6">
              <brew-pilot-input v-model.number="form.mashLoss" type="number" step="0.1"
                label="Perda na Transferência da Mostura" suffix="L">
                <template #hint>Líquido retido na bomba, mangueiras, etc.</template>
              </brew-pilot-input>
            </div>
            <div v-if="form.lauterMethod !== 'NoSparge'" class="col-12 col-sm-6">
              <brew-pilot-input v-model.number="form.spargeDeadSpace" type="number" step="0.1"
                label="Espaço Morto — Panela de Lavagem" suffix="L" />
            </div>
          </template>

        </div>
      </brew-pilot-form-section>

      <!-- ── Painel de resumo de volumes ───────────────────────────── -->
      <div class="q-mb-sm">
        <div class="eq-vol-summary">
          <div class="eq-vol-summary__grid">
            <template v-if="hasMash">
              <div class="eq-vol-item">
                <span class="eq-vol-label">Água de Mostura</span>
                <span class="eq-vol-value">{{ mashWaterVol }} L</span>
              </div>
              <div v-if="spargeWaterVol > 0" class="eq-vol-item">
                <span class="eq-vol-label">Água de Lavagem</span>
                <span class="eq-vol-value">{{ spargeWaterVol }} L</span>
              </div>
              <div class="eq-vol-item">
                <span class="eq-vol-label">Total de Água</span>
                <span class="eq-vol-value eq-vol-value--highlight">{{ totalWaterVol }} L</span>
              </div>
            </template>
            <template v-if="hasBoil">
              <div class="eq-vol-item">
                <span class="eq-vol-label">Pré-Fervura <span class="eq-vol-temp">(quente)</span></span>
                <span class="eq-vol-value">{{ preBoilHot }} L</span>
              </div>
              <div class="eq-vol-item">
                <span class="eq-vol-label">Pós-Fervura <span class="eq-vol-temp">(quente)</span></span>
                <span class="eq-vol-value">{{ postBoilHot }} L</span>
              </div>
              <div class="eq-vol-item">
                <span class="eq-vol-label">Pós-Fervura <span class="eq-vol-temp">(frio)</span></span>
                <span class="eq-vol-value">{{ postBoilVol }} L</span>
              </div>
            </template>
            <div class="eq-vol-item">
              <span class="eq-vol-label">No Fermentador</span>
              <span class="eq-vol-value">{{ fermenterVol }} L</span>
            </div>
            <div class="eq-vol-item">
              <span class="eq-vol-label">Engarrafamento / Barril</span>
              <span class="eq-vol-value eq-vol-value--highlight">{{ bottlingVol }} L</span>
            </div>
          </div>
          <div v-if="hasBoil" class="eq-vol-note">
            <q-icon name="mdi-information-outline" size="11px" />
            Volumes quentes incluem {{ form.boilExpansion ?? 4 }}% de expansão térmica. Volume real ao resfriar é menor.
          </div>
        </div>
      </div>

      <!-- ── 3. Eficiência ─────────────────────────────────────────── -->
      <brew-pilot-form-section v-if="hasBoil" title="Eficiência">
        <div class="row q-col-gutter-sm">
          <div class="col-12 col-sm-6">
            <brew-pilot-input v-model.number="form.efficiency" type="number" step="0.1"
              label="Eficiência do Equipamento" suffix="%">
              <template #hint>Eficiência geral de brassagem (pré-fervura → fermentador)</template>
            </brew-pilot-input>
          </div>
          <template v-if="hasMash">
            <div class="col-12 col-sm-6">
              <brew-pilot-input :model-value="form.calculateMashEfficiency ? calcMashEff : form.mashEfficiency"
                @update:model-value="(v: string | number | null) => { if (!form.calculateMashEfficiency) form.mashEfficiency = +(v ?? 0) }"
                type="number" step="0.1"
                :label="form.calculateMashEfficiency ? 'Eficiência da Mostura (calculada)' : 'Eficiência da Mostura'"
                suffix="%" :disable="form.calculateMashEfficiency">
                <template #hint>Conversão de açúcares na mostura</template>
              </brew-pilot-input>
            </div>
            <div class="col-12">
              <q-checkbox v-model="form.calculateMashEfficiency" dense
                label="Calcular eficiência da mostura automaticamente" color="primary" />
            </div>
          </template>
        </div>
      </brew-pilot-form-section>

      <!-- ── Avançado (expansível) ────────────────────────────────── -->
      <div class="q-mt-sm">
        <brew-pilot-button variant="outline" no-caps class="full-width eq-advanced-btn"
          :icon="showAdvanced ? 'mdi-chevron-up' : 'mdi-cog-outline'"
          :label="showAdvanced ? 'Ocultar configurações avançadas' : 'Configurações avançadas'"
          @click="showAdvanced = !showAdvanced" />
      </div>

      <transition name="eq-slide">
        <div v-if="showAdvanced" class="q-mt-sm">

          <!-- Equipamento de Mostura -->
          <brew-pilot-form-section v-if="hasMash" :title="mashSectionTitle">
            <div class="row q-col-gutter-sm">
              <template v-if="isBIAB">
                <div class="col-12 col-sm-6">
                  <brew-pilot-input v-model.number="form.mashTunVolume" type="number" step="0.5" label="Volume da Panela"
                    suffix="L">
                    <template #hint>No BIAB a mesma panela é usada para mostura e fervura</template>
                  </brew-pilot-input>
                </div>
              </template>
              <template v-else-if="isTwoVessel">
                <div class="col-12 col-sm-6">
                  <brew-pilot-input v-model.number="form.mashTunVolume" type="number" step="0.5"
                    label="Volume do Tun / Mash Tun" suffix="L">
                    <template #hint>Capacidade da panela (ou cooler) de mostura</template>
                  </brew-pilot-input>
                </div>
              </template>
              <template v-else-if="isThreeVessel">
                <div class="col-12 col-sm-6">
                  <brew-pilot-input v-model.number="form.mashTunVolume" type="number" step="0.5"
                    label="Volume do MLT (Mash Lauter Tun)" suffix="L" />
                </div>
                <div class="col-12 col-sm-6">
                  <brew-pilot-input v-model.number="form.hltVolume" type="number" step="0.5"
                    label="Volume do HLT (Hot Liquor Tank)" suffix="L">
                    <template #hint>Boiler de aquecimento da água de mostura e lavagem</template>
                  </brew-pilot-input>
                </div>
              </template>
              <template v-else>
                <div class="col-12 col-sm-6">
                  <brew-pilot-input v-model.number="form.mashTunVolume" type="number" step="0.5"
                    label="Volume do recipiente de mostura" suffix="L" />
                </div>
              </template>
              <div class="col-12 col-sm-6">
                <brew-pilot-input v-model.number="form.grainAbsorptionRate" type="number" step="0.01"
                  label="Absorção dos Grãos" suffix="L/kg">
                  <template #hint>{{ isBIAB ? 'BIAB sem espremer: ~1,0 L/kg; espremendo: ~0,7 L/kg' : 'Padrão 3 panelas: ~0,8 L/kg' }}</template>
                </brew-pilot-input>
              </div>
              <div class="col-12 col-sm-6">
                <brew-pilot-input v-model.number="form.waterToGrainRatio" type="number" step="0.1"
                  label="Relação Água/Grão" suffix="L/kg">
                  <template #hint>{{ isBIAB ? 'BIAB: geralmente 3–4 L/kg (mais água = mais eficiência)' : 'Padrão: 2,5–3,5 L/kg' }}</template>
                </brew-pilot-input>
              </div>
              <div v-if="!isBIAB" class="col-12 col-sm-6">
                <brew-pilot-select v-model="form.mashWaterMethod"
                  :options="['Padrão', 'Por Relação Água/Grão', 'Manual']"
                  label="Cálculo da Água de Mostura" />
              </div>
            </div>
          </brew-pilot-form-section>

          <!-- Ajustes de Volume -->
          <brew-pilot-form-section v-if="!showTopUpInMain" title="Ajustes de Volume">
            <div class="row q-col-gutter-sm">
              <div class="col-12 col-sm-6">
                <brew-pilot-input v-model.number="form.fermenterWater" type="number" step="0.1"
                  label="Água de Top-up no Fermentador" suffix="L">
                  <template #hint>{{ topUpWaterHint }}</template>
                </brew-pilot-input>
              </div>
            </div>
          </brew-pilot-form-section>

          <!-- Lúpulo & Hopstand -->
          <brew-pilot-form-section v-if="hasHops" title="Lúpulo & Hopstand">
            <div class="row q-col-gutter-sm">
              <div class="col-12 col-sm-6">
                <brew-pilot-input v-model.number="form.hopUtilization" type="number"
                  label="Multiplicador Utilização de Lúpulo" suffix="%">
                  <template #hint>100% = padrão. Sistemas maiores (>50 L) geralmente usam valores menores.</template>
                </brew-pilot-input>
              </div>
              <div class="col-12 col-sm-6">
                <brew-pilot-input v-model.number="form.aromaHopUtilization" type="number"
                  :label="form.calculateAromaHopUtil ? 'Lúpulo Aroma — Utilização (calculada)' : 'Lúpulo Aroma — Utilização'"
                  suffix="%" :disable="form.calculateAromaHopUtil" />
              </div>
              <div class="col-12">
                <q-checkbox v-model="form.calculateAromaHopUtil" dense
                  label="Calcular utilização de lúpulo de aroma automaticamente" color="primary" />
              </div>
              <div class="col-12 col-sm-6">
                <brew-pilot-input v-model.number="form.hopstandTemperature" type="number"
                  label="Temperatura Hopstand / Whirlpool" suffix="°C">
                  <template #hint>Temperatura na qual o lúpulo de aroma é adicionado</template>
                </brew-pilot-input>
              </div>
              <div class="col-12 col-sm-6">
                <brew-pilot-input v-model.number="form.whirlpoolTime" type="number"
                  label="Tempo Whirlpool / No-Chill" suffix="min" />
              </div>
            </div>
          </brew-pilot-form-section>

          <!-- Altitude / Temperatura da Fervura -->
          <brew-pilot-form-section title="Altitude / Temperatura da Fervura">
            <div class="row q-col-gutter-sm">
              <div class="col-12">
                <q-checkbox v-model="form.altitudeAdjust" dense label="Ajustar temperatura de fervura por altitude"
                  color="primary" />
              </div>
              <div class="col-12 col-sm-6">
                <brew-pilot-input v-model.number="form.altitude" type="number" label="Altitude" suffix="m"
                  :disable="!form.altitudeAdjust" />
              </div>
              <div class="col-12 col-sm-6">
                <brew-pilot-input :model-value="form.altitudeAdjust ? calcBoilTemp : form.boilTemperature"
                  @update:model-value="(v: string | number | null) => { if (!form.altitudeAdjust) form.boilTemperature = +(v ?? 0) }"
                  type="number" step="0.1"
                  :label="form.altitudeAdjust ? 'Temperatura de Fervura (calculada)' : 'Temperatura de Fervura'"
                  suffix="°C" :disable="form.altitudeAdjust" />
              </div>
              <div class="col-12 col-sm-6">
                <brew-pilot-input v-model.number="form.boilExpansion" type="number" step="0.1"
                  label="Contração por Resfriamento" suffix="%">
                  <template #hint>Redução de volume ao resfriar. Padrão: 4%</template>
                </brew-pilot-input>
              </div>
            </div>
          </brew-pilot-form-section>

        </div>
      </transition>

    </div>

    <template #footer>
      <div class="row items-center q-px-md q-py-sm" style="gap:8px">
        <!-- Voltar ao picker (só quando vindo do picker) -->
        <brew-pilot-button v-if="props.showBackToPicker && !isEditing"
          variant="flat" no-caps icon="mdi-arrow-left"
          :label="props.baseProfile ? 'Escolher outra base' : 'Voltar'"
          :disable="saving" @click="emit('back-to-picker')" />
        <brew-pilot-button v-if="isEditing" variant="outline" no-caps label="Copiar" icon="mdi-content-copy" size="sm"
          :disable="saving" @click="copyEquip" />
        <q-space />
        <brew-pilot-button variant="outline" no-caps label="Cancelar" :disable="saving" @click="open = false" />
        <brew-pilot-button variant="filled" color="primary" no-caps :label="isEditing ? 'Salvar' : 'Criar Perfil'"
          icon="mdi-content-save" :loading="saving" :disable="saving" @click="save" />
      </div>
    </template>

  </brew-pilot-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useRecipeStore } from '@/stores/recipeStore'
import { useEquipmentStore } from '@/stores/equipmentStore'
import { useAuthStore } from '@/stores/authStore'
import type { EquipmentProfile } from '@/types/equipment'

const props = defineProps<{
  modelValue: boolean
  baseProfile?: EquipmentProfile | null
  showBackToPicker?: boolean
}>()
const emit = defineEmits<{
  'update:modelValue': [v: boolean]
  'saved': [profile: EquipmentProfile]
  'back-to-picker': []
}>()

const $q = useQuasar()
const open = computed({ get: () => props.modelValue, set: v => emit('update:modelValue', v) })
const recipeStore = useRecipeStore()
const equipStore  = useEquipmentStore()
const authStore   = useAuthStore()
const recipe      = computed(() => recipeStore.currentRecipe)

const editingId = ref<string | null>(null)
const isEditing = computed(() => !!editingId.value)
const dialogTitle = computed(() => isEditing.value ? 'Editar Perfil de Equipamento' : 'Criar Perfil de Equipamento')
const saving = ref(false)
const showAdvanced = ref(false)
const isHydratingForm = ref(false)


// ── Tipos de setup ────────────────────────────────────────────────────────
/**
 * Tipos baseados no setup físico real do mercado:
 * - BIAB / Panela Única: Grainfather, Brewzilla, Robobrew, Anvil Foundry, panela comum com saco
 * - 2 Panelas: panela de fervura + mash tun (cooler ou panela separada)
 * - 3 Panelas / Tri-Bloc: HLT + MLT + BK — setup clássico homebrewer avançado e nano-cervejaria
 * - Extrato: somente extrato de malte, sem mostura
 * - Mini-Mash: extrato + pequena mostura de grãos especiais
 * - Bebida Fermentada: sidra, hidromél, vinho — sem mostura de grãos
 */
const setupTypeOptions = [
  {
    label: 'Panela Única / BIAB', value: 'BIAB',
    sub: 'Grainfather, Brewzilla, Robobrew, Anvil, panela com saco'
  },
  {
    label: '2 Panelas', value: 'TwoVessel',
    sub: 'Panela de fervura + Mash Tun (cooler ou panela separada)'
  },
  {
    label: '3 Panelas / Tri-Bloc', value: 'ThreeVessel',
    sub: 'HLT + MLT + Panela de Fervura — setup avançado / nano'
  },
  {
    label: 'Extrato de Malte', value: 'Extract',
    sub: 'Somente extrato, sem mostura de grãos'
  },
  {
    label: 'Mini-Mash', value: 'PartialMash',
    sub: 'Extrato + pequena mostura de grãos especiais'
  },
  {
    label: 'Bebida Fermentada', value: 'FermentedBeverage',
    sub: 'Sidra, Hidromél, Vinho — sem mostura de grãos'
  },
]

const setupTypeMap: Record<string, { icon: string; desc: string }> = {
  BIAB: { icon: 'mdi-pot-steam', desc: 'Uma panela para mostura e fervura. Com saco (BIAB). Ex: Grainfather, Brewzilla, Robobrew, Anvil Foundry.' },
  TwoVessel: { icon: 'mdi-silverware-variant', desc: '2 recipientes: Panela de Fervura + Mash Tun (cooler ou panela separada). Setup intermediário.' },
  ThreeVessel: { icon: 'mdi-factory', desc: '3 recipientes: HLT + MLT + Panela de Fervura. Setup clássico de nano-cervejaria ou homebrewer avançado (tri-bloc).' },
  Extract: { icon: 'mdi-flask', desc: 'Sem mostura. Apenas extrato de malte dissolvido em água quente + fervura com lúpulos.' },
  PartialMash: { icon: 'mdi-flask-plus', desc: 'Mini-Mash: pequena mostura de grãos especiais + complemento de extrato. Sem necessidade de HLT ou MLT completo.' },
  FermentedBeverage: { icon: 'mdi-glass-wine', desc: 'Sidra (maçã/pera), Hidromél (mel), Vinho. Sem mostura de grãos cereais. Fervura opcional.' },
}

const setupInfo = computed(() => setupTypeMap[form.value.setupType ?? 'BIAB'] ?? null)

// ── Métodos de lavagem / lauter ───────────────────────────────────────────
const lauterMethodOptions = [
  { label: 'Batch Sparge',               value: 'BatchSparge' },
  { label: 'Fly Sparge',                 value: 'FlySparge'   },
  { label: 'No Sparge (sem lavagem)',    value: 'NoSparge'    },
  { label: 'RIMS (recirculação inline)', value: 'RIMS'        },
  { label: 'HERMS (recirculação HLT)',   value: 'HERMS'       },
]
const lauterMethodMap: Record<string, { icon: string; desc: string }> = {
  BatchSparge: { icon: 'mdi-water-pump',   desc: 'Lavagem em batelada: toda a água de lavagem adicionada de uma vez, aguarda 10–15 min e drena. Método mais simples e rápido.' },
  FlySparge:   { icon: 'mdi-water-sync',   desc: 'Lavagem contínua: água quente adicionada lentamente enquanto o mosto drena. Maior eficiência, requer mais atenção.' },
  NoSparge:    { icon: 'mdi-water-off',    desc: 'Sem lavagem: toda a água na mostura, sem sparge. Menor eficiência, mais corpo e sabor de grão. Útil para cervejas encorpadas.' },
  RIMS:        { icon: 'mdi-reload',       desc: 'RIMS (Recirculating Infusion Mash System): mosto recircula pelo MLT aquecido por tubo inline. Temperatura precisa e mosto claro.' },
  HERMS:       { icon: 'mdi-heat-wave',    desc: 'HERMS (Heat Exchange Recirculating Mash System): recirculação com troca de calor via serpentina no HLT. Temperatura muito estável.' },
}
const lauterInfo = computed(() => lauterMethodMap[form.value.lauterMethod ?? 'BatchSparge'] ?? null)

// ── Flags de capacidade por setup ─────────────────────────────────────────
const isBIAB = computed(() => (form.value.setupType ?? 'BIAB') === 'BIAB')
const isTwoVessel = computed(() => form.value.setupType === 'TwoVessel')
const isThreeVessel = computed(() => form.value.setupType === 'ThreeVessel')
const hasMash = computed(() => ['BIAB', 'TwoVessel', 'ThreeVessel', 'PartialMash'].includes(form.value.setupType ?? 'BIAB'))
const hasBoil = computed(() => form.value.setupType !== 'FermentedBeverage')
const hasHops = computed(() => form.value.setupType !== 'FermentedBeverage')
const showTopUpInMain = computed(() =>
  ['Extract', 'PartialMash', 'FermentedBeverage'].includes(form.value.setupType ?? 'BIAB')
)

const mashSectionTitle = computed(() => {
  if (isBIAB.value) return 'Panela / Configuração BIAB'
  if (isTwoVessel.value) return 'Mash Tun'
  if (isThreeVessel.value) return 'HLT + MLT'
  return 'Recipiente de Mostura'
})

const batchTargetOptions = [
  { label: 'Fermentador', value: 'Fermentador' },
  { label: 'Panela (Pós-Fervura)', value: 'Panela' },
]
const batchVolumeLabel = computed(() =>
  form.value.batchVolumeTarget === 'Panela'
    ? 'Volume do Lote (Panela, Pós-Fervura)'
    : 'Volume do Lote (Fermentador)'
)

const fermenterTypeOptions = [
  { label: 'Fundo reto (balde / bombona)', value: 'FlatBottom' },
  { label: 'Cônico homebrew', value: 'Conical' },
  { label: 'Unitank / cônico pressurizado', value: 'Unitank' },
  { label: 'Personalizado', value: 'Custom' },
]

const fermenterLossHint = computed(() => {
  if (form.value.fermenterType === 'Custom') return 'Valor manual calibrado pelo seu processo'
  return 'Trub + levedura depositada no fundo; muda pelo tipo de fermentador'
})

const topUpWaterHint = computed(() => {
  if (showTopUpInMain.value) {
    return 'Água adicionada após a fervura para completar volume; comum em extrato, mostura parcial e bebidas fermentadas'
  }
  return 'Em all-grain normalmente deixe 0 L; use apenas para corrigir volume e sabendo que dilui OG, IBU, cor e sais'
})

// ── Defaults por setup ────────────────────────────────────────────────────
const defaultsBySetup: Record<string, Partial<ReturnType<typeof baseDefaults>>> = {
  BIAB: {
    deadSpace: 0.5, mashLoss: 0, spargeDeadSpace: 0,
    grainAbsorptionRate: 1.0, waterToGrainRatio: 3.5,
    efficiency: 70, mashEfficiency: 74,
    hopUtilization: 100, lauterMethod: 'BIAB',
  },
  TwoVessel: {
    deadSpace: 1, mashLoss: 0.5, spargeDeadSpace: 0.5,
    grainAbsorptionRate: 0.8, waterToGrainRatio: 3.0,
    efficiency: 72, mashEfficiency: 76,
    hopUtilization: 100, lauterMethod: 'BatchSparge',
  },
  ThreeVessel: {
    deadSpace: 2, mashLoss: 1.0, spargeDeadSpace: 1.0,
    grainAbsorptionRate: 0.8, waterToGrainRatio: 3.0,
    efficiency: 72, mashEfficiency: 76,
    hopUtilization: 100, lauterMethod: 'FlySparge',
  },
  Extract: {
    efficiency: 98, mashEfficiency: 98,
    deadSpace: 0, mashLoss: 0, spargeDeadSpace: 0,
    hopUtilization: 100,
  },
  PartialMash: {
    deadSpace: 0.5, mashLoss: 0, spargeDeadSpace: 0,
    grainAbsorptionRate: 0.9, waterToGrainRatio: 3.0,
    efficiency: 75, mashEfficiency: 78,
    hopUtilization: 100, lauterMethod: 'BatchSparge',
  },
  FermentedBeverage: {
    efficiency: 98, mashEfficiency: 98,
    deadSpace: 0, mashLoss: 0, spargeDeadSpace: 0,
    boilOffRate: 0, trubLoss: 0,
    hopUtilization: 100,
  },
}

function baseDefaults() {
  return {
    name: '',
    setupType: 'BIAB',
    batchVolumeTarget: 'Fermentador',
    fermenterType: 'FlatBottom',
    batchVolume: 20, preBoilVolume: 24, boilTime: 60,
    efficiency: 72, mashEfficiency: 76,
    boilTemperature: 100, boilOffRate: 4,
    trubLoss: 2, fermentorLoss: 1, deadSpace: 1,
    notes: '' as string | undefined,
    isDefault: false,
    mashTunVolume: 30,
    hltVolume: undefined as number | undefined,
    mashLoss: 0,
    spargeDeadSpace: undefined as number | undefined,
    fermenterWater: 0 as number | undefined,
    calculateBoilVolume: true,
    calculateMashEfficiency: false,
    hopUtilization: 100,
    aromaHopUtilization: 76,
    calculateAromaHopUtil: true,
    hopstandTemperature: 96,
    whirlpoolTime: 20,
    altitudeAdjust: false,
    altitude: undefined as number | undefined,
    boilExpansion: 4,
    grainAbsorptionRate: 0.8,
    waterToGrainRatio: 3.0,
    mashWaterMethod: 'Padrão',
    bagSqueeze: false,
    lauterMethod: 'BatchSparge',
  }
}

function defaultForm(setupType = 'BIAB') {
  return { ...baseDefaults(), ...(defaultsBySetup[setupType] ?? {}), setupType }
}

const form = ref(defaultForm())

// Quando troca o tipo, aplica os defaults do novo tipo mantendo nome, volume, etc.
watch(() => form.value.setupType, (newType, oldType) => {
  if (isHydratingForm.value) return
  if (!newType || newType === oldType) return
  const overrides = defaultsBySetup[newType] ?? {}
  const { name, batchVolume, batchVolumeTarget, fermenterType, notes, isDefault } = form.value
  form.value = { ...baseDefaults(), ...overrides, setupType: newType, name, batchVolume, batchVolumeTarget, fermenterType, notes, isDefault }
})

watch(() => props.modelValue, (v) => { if (v) initForm() }, { immediate: true })

function initForm() {
  isHydratingForm.value = true
  showAdvanced.value = false
  const base = props.baseProfile
  const sType = base?.setupType ?? base?.equipmentType ?? 'BIAB'

  try {
    if (base && !base.isDefault) {
      editingId.value = base.id
      form.value = { ...defaultForm(sType), ...base, fermenterType: base.fermenterType ?? 'FlatBottom', notes: base.notes ?? '' }
    } else if (base && base.isDefault) {
      editingId.value = null
      form.value = { ...defaultForm(sType), ...base, fermenterType: base.fermenterType ?? 'FlatBottom', name: base.name + ' (Meu)', notes: base.notes ?? '', isDefault: false }
    } else {
      editingId.value = null
      form.value = {
        ...defaultForm(),
        batchVolume:   recipe.value?.batchVolume   ?? 20,
        preBoilVolume: recipe.value?.preBoilVolume ?? 24,
        boilTime:      recipe.value?.boilTime      ?? 60,
        efficiency:    recipe.value?.efficiency    ?? 72,
      }
    }
  } finally {
    isHydratingForm.value = false
  }
}

// ── Computed de volumes ───────────────────────────────────────────────────
const expansionFactor = computed(() => 1 + (form.value.boilExpansion ?? 4) / 100)

function roundVolume(value: number, decimals = 2) {
  if (!Number.isFinite(value)) return 0
  return +Math.max(0, value).toFixed(decimals)
}

function scaleVolume(value: number | undefined, factor: number) {
  return typeof value === 'number' ? roundVolume(value * factor) : value
}

function calcFermentorLoss(volume: number, fermenterType?: string) {
  const presets: Record<string, { rate: number; min: number }> = {
    FlatBottom: { rate: 0.04, min: 0.5 },
    Conical: { rate: 0.025, min: 0.3 },
    Unitank: { rate: 0.015, min: 0.2 },
  }
  const preset = presets[fermenterType ?? 'FlatBottom']
  if (!preset) return form.value.fermentorLoss
  return roundVolume(Math.max(volume * preset.rate, preset.min), 1)
}

function calcVolumes(f: typeof form.value) {
  const evap = hasBoil.value ? ((f.boilOffRate ?? 0) * (f.boilTime ?? 0)) / 60 : 0
  const trubLoss = f.trubLoss ?? 0
  const fermentorLoss = f.fermentorLoss ?? 0
  const fermenterWater = f.fermenterWater ?? 0
  const isKettleTarget = f.batchVolumeTarget === 'Panela'
  const postBoilCold = isKettleTarget
    ? f.batchVolume
    : f.batchVolume + trubLoss
  const fermenterCold = isKettleTarget
    ? f.batchVolume - trubLoss + fermenterWater
    : f.batchVolume

  return {
    preBoil: roundVolume(postBoilCold + evap),
    postBoil: roundVolume(postBoilCold),
    fermenter: roundVolume(fermenterCold),
    bottling: roundVolume(fermenterCold - fermentorLoss),
  }
}

function scaleByBatchVolume(previous: number, next: number) {
  if (isHydratingForm.value || previous <= 0 || next <= 0 || previous === next) return
  const factor = next / previous
  form.value = {
    ...form.value,
    preBoilVolume: form.value.calculateBoilVolume ? form.value.preBoilVolume : scaleVolume(form.value.preBoilVolume, factor),
    boilOffRate: scaleVolume(form.value.boilOffRate, factor) ?? form.value.boilOffRate,
    trubLoss: scaleVolume(form.value.trubLoss, factor) ?? form.value.trubLoss,
    fermentorLoss: scaleVolume(form.value.fermentorLoss, factor) ?? form.value.fermentorLoss,
    fermenterWater: scaleVolume(form.value.fermenterWater, factor),
    deadSpace: scaleVolume(form.value.deadSpace, factor) ?? form.value.deadSpace,
    mashLoss: scaleVolume(form.value.mashLoss, factor),
    spargeDeadSpace: scaleVolume(form.value.spargeDeadSpace, factor),
    mashTunVolume: scaleVolume(form.value.mashTunVolume, factor) ?? form.value.mashTunVolume,
    hltVolume: scaleVolume(form.value.hltVolume, factor),
  }
}

const currentVolumes = computed(() => calcVolumes(form.value))
const calcPreBoilVol = computed(() => currentVolumes.value.preBoil)
const activePreBoil = computed(() =>
  form.value.calculateBoilVolume ? calcPreBoilVol.value : form.value.preBoilVolume
)
const preBoilHot = computed(() => +(activePreBoil.value * expansionFactor.value).toFixed(2))
const postBoilVol = computed(() => currentVolumes.value.postBoil)
const postBoilHot = computed(() => +(postBoilVol.value * expansionFactor.value).toFixed(2))
const fermenterVol = computed(() => currentVolumes.value.fermenter)
const bottlingVol = computed(() => currentVolumes.value.bottling)

// Absorção efetiva: BIAB espremendo reduz ~30%
const effectiveAbsorption = computed(() => {
  const abs = form.value.grainAbsorptionRate ?? 0.8
  return isBIAB.value && form.value.bagSqueeze ? +(abs * 0.7).toFixed(3) : abs
})

const mashWaterVol = computed(() => {
  const ratio = form.value.waterToGrainRatio ?? 3.0
  const absorption = effectiveAbsorption.value
  if (ratio <= absorption) return 0
  const estGrainKg = activePreBoil.value / (ratio - absorption)
  return +(estGrainKg * ratio).toFixed(2)
})
const spargeWaterVol = computed(() => {
  if (isBIAB.value) return 0 // BIAB não tem sparge
  if (form.value.lauterMethod === 'NoSparge') return 0 // sem lavagem
  const sparge = activePreBoil.value - mashWaterVol.value + (form.value.deadSpace ?? 0) + (form.value.mashLoss ?? 0)
  return Math.max(0, +sparge.toFixed(2))
})
const totalWaterVol = computed(() => +(mashWaterVol.value + spargeWaterVol.value).toFixed(2))

const evapPct = computed(() => {
  const preBoil = activePreBoil.value
  if (!preBoil) return 0
  const evap = (form.value.boilOffRate * form.value.boilTime) / 60
  return +(evap / preBoil * 100).toFixed(1)
})
const calcMashEff = computed(() => {
  const f = form.value
  const preBoil = activePreBoil.value
  if (!preBoil || !f.batchVolume) return f.mashEfficiency
  return +(f.efficiency * preBoil / f.batchVolume).toFixed(1)
})
const calcBoilTemp = computed(() =>
  +(100 - (form.value.altitude ?? 0) * 0.0034).toFixed(1)
)

watch(() => form.value.batchVolume, (next, previous) => {
  scaleByBatchVolume(previous, next)
})

watch(() => form.value.batchVolumeTarget, () => {
  if (isHydratingForm.value) return
  if (form.value.calculateBoilVolume) form.value.preBoilVolume = calcPreBoilVol.value
})

watch(() => form.value.fermenterType, (newType, oldType) => {
  if (isHydratingForm.value || !newType || newType === oldType || newType === 'Custom') return
  form.value.fermentorLoss = calcFermentorLoss(form.value.batchVolume, newType)
})

watch(calcPreBoilVol, (v) => {
  if (form.value.calculateBoilVolume) form.value.preBoilVolume = v
})

// ── Salvar ────────────────────────────────────────────────────────────────
async function save() {
  saving.value = true
  try {
    const payload = {
      ...form.value,
      preBoilVolume: form.value.calculateBoilVolume ? calcPreBoilVol.value : form.value.preBoilVolume,
      isDefault: false,
    }
    let saved: EquipmentProfile
    if (editingId.value) {
      saved = await equipStore.update(editingId.value, payload)
    } else {
      saved = await equipStore.create(payload)
    }
    emit('saved', saved)
    open.value = false
    $q.notify({ type: 'positive', message: editingId.value ? 'Perfil atualizado!' : 'Perfil criado!', timeout: 2000 })
  } catch (e) {
    $q.notify({ type: 'negative', message: 'Erro ao salvar perfil. Tente novamente.', timeout: 4000 })
    console.error('Erro ao salvar perfil de equipamento:', e)
  } finally {
    saving.value = false
  }
}

function copyEquip() {
  form.value.name = form.value.name + ' (Cópia)'
  editingId.value = null
}

// ── Export / Import ───────────────────────────────────────────────────────
function handleExport() {
  if (!editingId.value) return
  const profile = equipStore.profiles.find(p => p.id === editingId.value)
  if (profile) equipStore.exportProfile(profile)
}


</script>

<style scoped>
.eq-vol-summary {
  background: var(--bp-surface-alt);
  border: 1px solid var(--bp-border);
  border-radius: 8px;
  padding: 8px 12px 7px;
}

.eq-vol-summary__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 5px 10px;
  margin-bottom: 5px;
}

.eq-vol-item {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.eq-vol-label {
  font-size: 9px;
  font-weight: 500;
  color: var(--bp-text-muted);
  white-space: nowrap;
}

.eq-vol-temp {
  font-weight: 400;
  color: var(--bp-text-muted);
  opacity: 0.75;
}

.eq-vol-value {
  font-size: 11px;
  font-weight: 600;
  color: var(--bp-text-primary);
}

.eq-vol-value--highlight {
  color: var(--q-primary);
}

.eq-vol-note {
  font-size: 10px;
  color: var(--bp-text-muted);
  display: flex;
  align-items: center;
  gap: 4px;
  border-top: 1px solid var(--bp-border);
  padding-top: 5px;
  margin-top: 2px;
}

.eq-setup-info {
  font-size: 12px;
  color: var(--bp-text-muted);
  background: var(--bp-surface-alt);
  border: 1px solid var(--bp-border);
  border-radius: 6px;
  padding: 6px 10px;
  display: flex;
  align-items: center;
}

.eq-advanced-btn {
  border-style: dashed !important;
  font-size: 12px;
}

.eq-slide-enter-active,
.eq-slide-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.eq-slide-enter-from,
.eq-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
