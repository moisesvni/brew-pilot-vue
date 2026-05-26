import { ref } from 'vue'
import { ingredientsService, type IngredientCategory, type IngredientResult } from '../services/ingredients.service'

export type PickerCfg = {
  name: string
  // fermentable
  amount: number
  use: string
  colorEbc: number
  potential: number
  yieldPercentage: number
  fermentableType: string
  // hop
  alphaAcid: number
  time: number
  temperature: number | undefined
  // yeast
  laboratory: string
  form: string
  attenuation: number
  packages: number
  fermentationTemperature: number
  // misc
  unit: string
}

export type PickerStep = 'search' | 'configure' | 'create'

export function useIngredientPicker(category: IngredientCategory) {
  const step = ref<PickerStep>('search')
  const query = ref('')
  const results = ref<IngredientResult[]>([])
  const loading = ref(false)
  const selected = ref<IngredientResult | null>(null)
  const cfg = ref<PickerCfg>(makeCfg())

  function makeCfg(): PickerCfg {
    return {
      name: '',
      amount: 1,
      use: category === 'Hop' || category === 'Misc' ? 'Boil' : 'Mash',
      colorEbc: 5,
      potential: 37,
      yieldPercentage: 78,
      fermentableType: 'Grain',
      alphaAcid: 10,
      time: category === 'Hop' ? 60 : 0,
      temperature: undefined,
      laboratory: '',
      form: 'Dry',
      attenuation: 75,
      packages: 1,
      fermentationTemperature: 20,
      unit: 'g',
    }
  }

  function reset() {
    step.value = 'search'
    query.value = ''
    results.value = []
    loading.value = false
    selected.value = null
    cfg.value = makeCfg()
  }

  let debounceTimer: ReturnType<typeof setTimeout> | null = null

  function onQueryChange(val: string | number | null) {
    const q = String(val ?? '').trim()
    if (debounceTimer) clearTimeout(debounceTimer)
    if (q.length < 2) { results.value = []; return }
    loading.value = true
    debounceTimer = setTimeout(async () => {
      try {
        results.value = await ingredientsService.search(category, q)
      } catch {
        results.value = []
      } finally {
        loading.value = false
      }
    }, 350)
  }

  function selectResult(r: IngredientResult) {
    selected.value = r
    cfg.value = makeCfg()
    cfg.value.name = r.name
    if (r.colorEbc !== undefined)        cfg.value.colorEbc = r.colorEbc
    if (r.potential !== undefined)       cfg.value.potential = r.potential
    if (r.yieldPercentage !== undefined) cfg.value.yieldPercentage = r.yieldPercentage
    if (r.fermentableType)               cfg.value.fermentableType = r.fermentableType
    if (r.alphaAcid !== undefined)       cfg.value.alphaAcid = r.alphaAcid
    if (r.laboratory)                    cfg.value.laboratory = r.laboratory
    if (r.yeastForm)                     cfg.value.form = r.yeastForm
    if (r.attenuation !== undefined)     cfg.value.attenuation = r.attenuation
    if (r.defaultUnit)                   cfg.value.unit = r.defaultUnit
    step.value = 'configure'
  }

  function openCreateNew() {
    selected.value = null
    cfg.value = makeCfg()
    step.value = 'create'
  }

  function resultCaption(r: IngredientResult): string {
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

  return {
    step, query, results, loading, selected, cfg,
    reset, onQueryChange, selectResult, openCreateNew, resultCaption,
  }
}
