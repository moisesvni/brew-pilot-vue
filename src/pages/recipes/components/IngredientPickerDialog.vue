<template>
  <brew-pilot-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    :title="`Adicionar ${typeLabel}`"
    :icon="typeIcon"
    :icon-color="typeColor"
    width="560px"
  >
      <!-- ── PASSO 1: Busca ─────────────────────────────────────────────── -->
      <template v-if="step === 'search'">
        <q-card-section class="q-pb-xs">
          <brew-pilot-search-input
            v-model="query"
            ref="searchInputRef"
            autofocus
            :placeholder="`Buscar ${typeLabel.toLowerCase()} na base de dados...`"
            :loading="loading"
            :spinner-color="typeColor"
            @update:model-value="onQueryChange"
          />
        </q-card-section>

        <!-- Resultados -->
        <div class="col overflow-auto" style="min-height: 120px; max-height: 340px">
          <!-- Estado vazio / nenhum resultado -->
          <div v-if="!loading && !results.length && query.length > 1" class="text-center q-py-md text-grey-5">
            <q-icon name="search_off" size="36px" class="q-mb-xs" /><br>
            Nenhum resultado para "<strong>{{ query }}</strong>"
          </div>
          <div v-else-if="!query" class="text-center q-py-md text-grey-6 text-caption">
            Digite para buscar na base de dados
          </div>

          <q-list separator>
            <q-item
              v-for="r in results"
              :key="r.id"
              clickable v-ripple
              class="q-py-sm"
              @click="selectResult(r)"
            >
              <q-item-section>
                <q-item-label class="text-weight-medium" style="color: var(--bp-text-primary)">{{ r.name }}</q-item-label>
                <q-item-label caption class="text-grey-5">{{ resultCaption(r) }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-btn flat dense size="sm" label="Usar" :color="typeColor" icon="add" />
              </q-item-section>
            </q-item>
          </q-list>
        </div>

        <!-- Divisor Criar Novo -->
        <q-card-section class="q-pt-xs q-pb-sm">
          <q-btn
            flat
            class="full-width"
            icon="mdi-plus-circle-outline"
            label="Criar novo (não está na base)"
            color="grey-4"
            size="sm"
            @click="openCreateNew"
          />
        </q-card-section>
      </template>

      <!-- ── PASSO 2: Configurar quantidade ─────────────────────────────── -->
      <template v-else-if="step === 'configure'">
        <q-card-section class="q-pb-sm">
          <div class="row items-center q-mb-md">
            <q-btn flat round dense icon="arrow_back" size="sm" @click="step = 'search'" />
            <div class="q-ml-sm">
              <div class="text-body1 text-weight-bold" style="color: var(--bp-text-primary)">{{ selected!.name }}</div>
              <div class="text-caption text-grey-5">{{ resultCaption(selected!) }}</div>
            </div>
          </div>

          <!-- Campos de configuração por tipo -->
          <div class="row q-col-gutter-sm">

            <!-- FERMENTÁVEL -->
            <template v-if="type === 'Fermentable'">
              <q-input v-model.number="cfg.amount" type="number" label="Quantidade"
                suffix="kg" outlined dense class="col-12 col-sm-4" />
              <q-select v-model="cfg.use" :options="fermentableUseOpts" emit-value map-options
                label="Uso" outlined dense class="col-12 col-sm-4" />
              <q-input v-model.number="cfg.colorEbc" type="number" label="Cor"
                suffix="EBC" outlined dense class="col-12 col-sm-4" />
            </template>

            <!-- LÚPULO -->
            <template v-else-if="type === 'Hop'">
              <q-input v-model.number="cfg.amount" type="number" label="Quantidade"
                suffix="g" outlined dense class="col-12 col-sm-3" />
              <q-input v-model.number="cfg.alphaAcid" type="number" label="AA"
                suffix="%" outlined dense class="col-12 col-sm-3" />
              <q-select v-model="cfg.use" :options="hopUseOpts" emit-value map-options
                label="Uso" outlined dense class="col-12 col-sm-3"
                @update:model-value="onHopUseChange" />
              <q-input v-model.number="cfg.time" type="number"
                :label="cfg.use === 'DryHop' ? 'Dias' : 'Minutos'"
                :suffix="cfg.use === 'DryHop' ? 'dias' : 'min'"
                outlined dense class="col-12 col-sm-3" />
              <q-input v-if="cfg.use === 'Whirlpool' || cfg.use === 'Hopstand'"
                v-model.number="cfg.temperature" type="number"
                label="Temperatura" suffix="°C" outlined dense class="col-12 col-sm-4" />
            </template>

            <!-- LEVEDURA -->
            <template v-else-if="type === 'Yeast'">
              <q-input v-model="cfg.laboratory" label="Laboratório"
                outlined dense class="col-12 col-sm-4" />
              <q-select v-model="cfg.form" :options="yeastFormOpts" emit-value map-options
                label="Forma" outlined dense class="col-12 col-sm-4" />
              <q-input v-model.number="cfg.attenuation" type="number"
                label="Atenuação" suffix="%" outlined dense class="col-12 col-sm-4" />
              <q-input v-model.number="cfg.packages" type="number"
                label="Pacotes" outlined dense class="col-12 col-sm-4" />
              <q-input v-model.number="cfg.fermentationTemperature" type="number"
                label="Temp. Ferm." suffix="°C" outlined dense class="col-12 col-sm-4" />
            </template>

            <!-- DIVERSOS -->
            <template v-else>
              <q-input v-model.number="cfg.amount" type="number"
                label="Quantidade" outlined dense class="col-12 col-sm-3" />
              <q-select v-model="cfg.unit" :options="miscUnitOpts" emit-value map-options
                label="Unidade" outlined dense class="col-12 col-sm-3" />
              <q-select v-model="cfg.use" :options="miscUseOpts" emit-value map-options
                label="Uso" outlined dense class="col-12 col-sm-3" />
              <q-input v-if="cfg.use === 'Boil' || cfg.use === 'Mash'"
                v-model.number="cfg.time" type="number"
                label="Tempo" suffix="min" outlined dense class="col-12 col-sm-3" />
            </template>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-px-md q-pb-md">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn unelevated :color="typeColor" icon="add" label="Adicionar à receita" @click="confirmAdd" />
        </q-card-actions>
      </template>

      <!-- ── PASSO 3: Criar novo ─────────────────────────────────────────── -->
      <template v-else>
        <q-card-section class="q-pb-sm">
          <div class="row items-center q-mb-md">
            <q-btn flat round dense icon="arrow_back" size="sm" @click="step = 'search'" />
            <span class="text-body2 q-ml-sm" style="color: var(--bp-text-primary)">Novo {{ typeLabel }}</span>
          </div>

          <div class="row q-col-gutter-sm">
            <q-input v-model="cfg.name" label="Nome" outlined dense class="col-12"
              :placeholder="`Nome do ${typeLabel.toLowerCase()}`" autofocus />

            <template v-if="type === 'Fermentable'">
              <q-input v-model.number="cfg.amount" type="number" label="Quantidade"
                suffix="kg" outlined dense class="col-12 col-sm-4" />
              <q-select v-model="cfg.use" :options="fermentableUseOpts" emit-value map-options
                label="Uso" outlined dense class="col-12 col-sm-4" />
              <q-input v-model.number="cfg.colorEbc" type="number" label="Cor"
                suffix="EBC" outlined dense class="col-12 col-sm-4" />
              <q-input v-model.number="cfg.potential" type="number" label="PPG"
                outlined dense class="col-12 col-sm-4" />
              <q-select v-model="cfg.fermentableType" :options="fermentableTypeOpts" emit-value map-options
                label="Tipo" outlined dense class="col-12 col-sm-4" />
            </template>

            <template v-else-if="type === 'Hop'">
              <q-input v-model.number="cfg.amount" type="number" label="Quantidade"
                suffix="g" outlined dense class="col-12 col-sm-3" />
              <q-input v-model.number="cfg.alphaAcid" type="number" label="AA %"
                suffix="%" outlined dense class="col-12 col-sm-3" />
              <q-select v-model="cfg.use" :options="hopUseOpts" emit-value map-options
                label="Uso" outlined dense class="col-12 col-sm-3"
                @update:model-value="onHopUseChange" />
              <q-input v-model.number="cfg.time" type="number"
                :suffix="cfg.use === 'DryHop' ? 'dias' : 'min'"
                :label="cfg.use === 'DryHop' ? 'Dias' : 'Minutos'"
                outlined dense class="col-12 col-sm-3" />
            </template>

            <template v-else-if="type === 'Yeast'">
              <q-input v-model="cfg.laboratory" label="Laboratório"
                outlined dense class="col-12 col-sm-4" />
              <q-select v-model="cfg.form" :options="yeastFormOpts" emit-value map-options
                label="Forma" outlined dense class="col-12 col-sm-4" />
              <q-input v-model.number="cfg.attenuation" type="number"
                label="Atenuação" suffix="%" outlined dense class="col-12 col-sm-4" />
              <q-input v-model.number="cfg.packages" type="number"
                label="Pacotes" outlined dense class="col-12 col-sm-4" />
              <q-input v-model.number="cfg.fermentationTemperature" type="number"
                label="Temp. Ferm." suffix="°C" outlined dense class="col-12 col-sm-4" />
            </template>

            <template v-else>
              <q-input v-model.number="cfg.amount" type="number"
                label="Quantidade" outlined dense class="col-12 col-sm-3" />
              <q-select v-model="cfg.unit" :options="miscUnitOpts" emit-value map-options
                label="Unidade" outlined dense class="col-12 col-sm-3" />
              <q-select v-model="cfg.use" :options="miscUseOpts" emit-value map-options
                label="Uso" outlined dense class="col-12 col-sm-3" />
            </template>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-px-md q-pb-md">
          <q-btn flat label="Cancelar" @click="$emit('update:modelValue', false)" />
          <q-btn unelevated :color="typeColor" icon="add" label="Criar e adicionar"
            :disable="!cfg.name?.trim()" @click="confirmAdd" />
        </q-card-actions>
      </template>
  </brew-pilot-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import BrewPilotDialog from '@/components/BrewPilotDialog.vue'
import BrewPilotSearchInput from '@/components/shared/BrewPilotSearchInput.vue'
import { ingredientsService, type IngredientCategory, type IngredientResult } from '@/services/ingredients.service'
import type {
  RecipeFermentable, RecipeHop, RecipeYeast, RecipeMisc
} from '@/types/recipe'

// ── Props / Emits ────────────────────────────────────────────────────────────
const props = defineProps<{
  modelValue: boolean
  type: IngredientCategory
}>()

const emit = defineEmits<{
  'update:modelValue': [v: boolean]
  add: [item: RecipeFermentable | RecipeHop | RecipeYeast | RecipeMisc]
}>()

// ── State ────────────────────────────────────────────────────────────────────
type Step = 'search' | 'configure' | 'create'
const step = ref<Step>('search')
const query = ref('')
const results = ref<IngredientResult[]>([])
const loading = ref(false)
const selected = ref<IngredientResult | null>(null)

// cfg: holds all possible fields (only relevant ones used per type)
const cfg = ref(defaultCfg())

function defaultCfg () {
  return {
    name: '',
    // fermentable
    amount: 1 as number,
    use: 'Mash' as string,
    colorEbc: 5 as number,
    potential: 37 as number,
    yieldPercentage: 78 as number,
    fermentableType: 'Grain' as string,
    // hop
    alphaAcid: 10 as number,
    time: 60 as number,
    temperature: undefined as number | undefined,
    // yeast
    laboratory: '' as string,
    form: 'Dry' as string,
    attenuation: 75 as number,
    packages: 1 as number,
    fermentationTemperature: 20 as number,
    // misc
    unit: 'g' as string,
  }
}

// Resetar ao abrir
watch(() => props.modelValue, (open) => {
  if (open) {
    step.value = 'search'
    query.value = ''
    results.value = []
    selected.value = null
    cfg.value = defaultCfg()
    // defaults por tipo
    if (props.type === 'Hop') { cfg.value.use = 'Boil'; cfg.value.time = 60 }
    if (props.type === 'Misc') { cfg.value.use = 'Boil' }
  }
})

// ── Busca com debounce ───────────────────────────────────────────────────────
let debounceTimer: ReturnType<typeof setTimeout> | null = null

function onQueryChange (val: string | number | null) {
  const q = String(val ?? '').trim()
  if (debounceTimer) clearTimeout(debounceTimer)
  if (q.length < 2) { results.value = []; return }
  loading.value = true
  debounceTimer = setTimeout(async () => {
    try {
      results.value = await ingredientsService.search(props.type, q)
    } catch {
      results.value = []
    } finally {
      loading.value = false
    }
  }, 350)
}

// ── Selecionar resultado ─────────────────────────────────────────────────────
function selectResult (r: IngredientResult) {
  selected.value = r
  cfg.value = defaultCfg()
  // Pré-preencher com dados do ingrediente
  cfg.value.name = r.name
  if (r.colorEbc !== undefined)   cfg.value.colorEbc = r.colorEbc
  if (r.potential !== undefined)  cfg.value.potential = r.potential
  if (r.yieldPercentage !== undefined) cfg.value.yieldPercentage = r.yieldPercentage
  if (r.fermentableType)          cfg.value.fermentableType = r.fermentableType
  if (r.alphaAcid !== undefined)  cfg.value.alphaAcid = r.alphaAcid
  if (r.laboratory)               cfg.value.laboratory = r.laboratory
  if (r.yeastForm)                cfg.value.form = r.yeastForm
  if (r.attenuation !== undefined) cfg.value.attenuation = r.attenuation
  if (r.defaultUnit)              cfg.value.unit = r.defaultUnit
  if (props.type === 'Hop')       { cfg.value.use = 'Boil'; cfg.value.time = 60 }
  if (props.type === 'Misc')      cfg.value.use = 'Boil'
  step.value = 'configure'
}

function openCreateNew () {
  selected.value = null
  cfg.value = defaultCfg()
  if (props.type === 'Hop') { cfg.value.use = 'Boil'; cfg.value.time = 60 }
  if (props.type === 'Misc') cfg.value.use = 'Boil'
  step.value = 'create'
}

function onHopUseChange (use: string) {
  if (use === 'DryHop') cfg.value.time = 5
  else if (use === 'Whirlpool' || use === 'Hopstand') {
    cfg.value.time = 15
    cfg.value.temperature = 85
  } else {
    cfg.value.time = 60
    cfg.value.temperature = undefined
  }
}

// ── Confirmar adição ─────────────────────────────────────────────────────────
function confirmAdd () {
  const ingredientId = selected.value?.id
  let item: RecipeFermentable | RecipeHop | RecipeYeast | RecipeMisc

  if (props.type === 'Fermentable') {
    item = {
      id: crypto.randomUUID(),
      name: cfg.value.name,
      type: cfg.value.fermentableType as RecipeFermentable['type'],
      use: cfg.value.use as RecipeFermentable['use'],
      amount: cfg.value.amount,
      colorEbc: cfg.value.colorEbc,
      potential: cfg.value.potential,
      yieldPercentage: cfg.value.yieldPercentage,
      sortOrder: 0,
      ingredientId,
    } satisfies RecipeFermentable
  } else if (props.type === 'Hop') {
    item = {
      id: crypto.randomUUID(),
      name: cfg.value.name,
      use: cfg.value.use as RecipeHop['use'],
      amount: cfg.value.amount,
      alphaAcid: cfg.value.alphaAcid,
      time: cfg.value.time,
      temperature: cfg.value.temperature,
      sortOrder: 0,
      ingredientId,
    } satisfies RecipeHop
  } else if (props.type === 'Yeast') {
    item = {
      id: crypto.randomUUID(),
      name: cfg.value.name,
      laboratory: cfg.value.laboratory || undefined,
      form: cfg.value.form as RecipeYeast['form'],
      attenuation: cfg.value.attenuation,
      packages: cfg.value.packages,
      fermentationTemperature: cfg.value.fermentationTemperature,
      ingredientId,
    } satisfies RecipeYeast
  } else {
    item = {
      id: crypto.randomUUID(),
      name: cfg.value.name,
      use: cfg.value.use as RecipeMisc['use'],
      amount: cfg.value.amount,
      unit: cfg.value.unit,
      time: cfg.value.time || undefined,
      ingredientId,
    } satisfies RecipeMisc
  }

  emit('add', item)
  emit('update:modelValue', false)
}

// ── Helpers de exibição ──────────────────────────────────────────────────────
function resultCaption (r: IngredientResult): string {
  const parts: string[] = []
  if (r.producer) parts.push(r.producer)
  if (r.fermentableType) parts.push(r.fermentableType)
  if (r.colorEbc !== undefined) parts.push(`${r.colorEbc} EBC`)
  if (r.potential !== undefined) parts.push(`PPG ${r.potential}`)
  if (r.alphaAcid !== undefined) parts.push(`AA ${r.alphaAcid}%`)
  if (r.laboratory) parts.push(r.laboratory)
  if (r.attenuation !== undefined) parts.push(`Aten. ${r.attenuation}%`)
  return parts.join(' · ')
}

// ── Metadata por tipo ────────────────────────────────────────────────────────
const typeLabel = computed(() => ({
  Fermentable: 'Fermentável', Hop: 'Lúpulo', Yeast: 'Levedura', Misc: 'Diverso'
}[props.type]))

const typeIcon = computed(() => ({
  Fermentable: 'mdi-barley', Hop: 'mdi-hops', Yeast: 'mdi-flask', Misc: 'mdi-flask-outline'
}[props.type]))

const typeColor = computed(() => ({
  Fermentable: 'amber', Hop: 'green', Yeast: 'teal', Misc: 'blue-grey'
}[props.type]))

// ── Opções de select ─────────────────────────────────────────────────────────
const fermentableUseOpts = [
  { label: 'Mostura', value: 'Mash' },
  { label: 'Maceração', value: 'Steep' },
  { label: 'Fervura', value: 'Boil' },
  { label: 'Adição tardia', value: 'LateAddition' },
]

const fermentableTypeOpts = [
  { label: 'Grão', value: 'Grain' },
  { label: 'Extrato Seco', value: 'DryExtract' },
  { label: 'Extrato Líquido', value: 'LiquidExtract' },
  { label: 'Açúcar', value: 'Sugar' },
  { label: 'Mel', value: 'Honey' },
  { label: 'Adjunto', value: 'Adjunct' },
]

const hopUseOpts = [
  { label: 'Primeira Mostura', value: 'FirstWort' },
  { label: 'Fervura', value: 'Boil' },
  { label: 'Whirlpool', value: 'Whirlpool' },
  { label: 'Hopstand', value: 'Hopstand' },
  { label: 'Dry Hop', value: 'DryHop' },
]

const yeastFormOpts = [
  { label: 'Seca', value: 'Dry' },
  { label: 'Líquida', value: 'Liquid' },
  { label: 'Lama (Slurry)', value: 'Slurry' },
]

const miscUseOpts = [
  { label: 'Mostura', value: 'Mash' },
  { label: 'Fervura', value: 'Boil' },
  { label: 'Fermentação', value: 'Fermentation' },
  { label: 'Envase', value: 'Packaging' },
]

const miscUnitOpts = [
  { label: 'g', value: 'g' },
  { label: 'kg', value: 'kg' },
  { label: 'ml', value: 'ml' },
  { label: 'L', value: 'L' },
  { label: 'un', value: 'un' },
  { label: 'tsp', value: 'tsp' },
  { label: 'tbsp', value: 'tbsp' },
]
</script>
