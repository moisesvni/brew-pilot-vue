import { ref } from 'vue'
import { ingredientsService, type IngredientCategory, type IngredientResult } from '@/services/ingredients.service'

// ── localStorage helpers para "top 5 mais pesquisados" ───────────────────────
const TOP_COUNT = 5
const storageKey = (cat: IngredientCategory) => `bp_top_searched_${cat}`

type StoredResult = IngredientResult & { _count: number }

function loadTopSearched(cat: IngredientCategory): IngredientResult[] {
  try {
    const raw = localStorage.getItem(storageKey(cat))
    if (!raw) return []
    const arr: StoredResult[] = JSON.parse(raw)
    return arr
      .sort((a, b) => b._count - a._count)
      .slice(0, TOP_COUNT)
      .map(({ _count: _c, ...r }) => r)
  } catch { return [] }
}

function recordSearched(cat: IngredientCategory, r: IngredientResult) {
  try {
    const key = storageKey(cat)
    const raw = localStorage.getItem(key)
    const arr: StoredResult[] = raw ? JSON.parse(raw) : []
    const existing = arr.find(x => x.id === r.id)
    if (existing) {
      existing._count++
      Object.assign(existing, r) // atualiza dados do item
    } else {
      arr.push({ ...r, _count: 1 })
    }
    arr.sort((a, b) => b._count - a._count)
    localStorage.setItem(key, JSON.stringify(arr.slice(0, 50)))
  } catch { /* silencioso */ }
}

export type PickerCfg = {
  name: string
  // fermentable
  amount: number
  use: string
  colorEbc: number
  potential: number
  yieldPercentage: number
  fermentableType: string
  category: string
  origin: string
  diastaticPower: number | undefined
  notes: string
  excludeFromTotal: boolean
  nonFermentable: boolean
  description: string
  usedIn: string
  substitutes: string
  moisture: number | undefined
  protein: number | undefined
  coarseFineGrind: number | undefined
  fineGroundExtract: number | undefined
  acid: number | undefined
  friability: number | undefined
  freeAminoNitrogen: number | undefined
  maxInBatch: number | undefined
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
  const isShowingTopSearched = ref(false)

  function makeCfg(): PickerCfg {
    return {
      name: '',
      amount: 1,
      use: category === 'Hop' || category === 'Misc' ? 'Boil' : 'Mash',
      colorEbc: 5,
      potential: 37,
      yieldPercentage: 78,
      fermentableType: 'Grain',
      category: '',
      origin: '',
      diastaticPower: undefined,
      notes: '',
      excludeFromTotal: false,
      nonFermentable: false,
      description: '',
      usedIn: '',
      substitutes: '',
      moisture: undefined,
      protein: undefined,
      coarseFineGrind: undefined,
      fineGroundExtract: undefined,
      acid: undefined,
      friability: undefined,
      freeAminoNitrogen: undefined,
      maxInBatch: undefined,
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
    loading.value = false
    selected.value = null
    cfg.value = makeCfg()
    const top = loadTopSearched(category)
    results.value = top
    isShowingTopSearched.value = top.length > 0
  }

  let debounceTimer: ReturnType<typeof setTimeout> | null = null

  function onQueryChange(val: string | number | null) {
    const q = String(val ?? '').trim()
    if (debounceTimer) clearTimeout(debounceTimer)
    if (q.length < 2) {
      const top = loadTopSearched(category)
      results.value = top
      isShowingTopSearched.value = top.length > 0
      loading.value = false
      return
    }
    isShowingTopSearched.value = false
    loading.value = true
    debounceTimer = setTimeout(async () => {
      try {
        results.value = await ingredientsService.search(category, q)
      } catch {
        results.value = []
      } finally {
        loading.value = false
      }
    }, 1000)
  }

  function selectResult(r: IngredientResult) {
    recordSearched(category, r)
    selected.value = r
    cfg.value = makeCfg()
    cfg.value.name = r.name
    if (r.colorEbc !== undefined)           cfg.value.colorEbc = r.colorEbc
    if (r.potential !== undefined)          cfg.value.potential = r.potential
    if (r.yieldPercentage !== undefined)    cfg.value.yieldPercentage = r.yieldPercentage
    if (r.fermentableType)                  cfg.value.fermentableType = r.fermentableType
    if (r.category)                         cfg.value.category = r.category
    if (r.origin)                           cfg.value.origin = r.origin
    if (r.diastaticPower !== undefined)     cfg.value.diastaticPower = r.diastaticPower
    if (r.description)                      cfg.value.description = r.description
    if (r.usedIn)                           cfg.value.usedIn = r.usedIn
    if (r.substitutes)                      cfg.value.substitutes = r.substitutes
    if (r.moisture !== undefined)           cfg.value.moisture = r.moisture
    if (r.protein !== undefined)            cfg.value.protein = r.protein
    if (r.coarseFineGrind !== undefined)    cfg.value.coarseFineGrind = r.coarseFineGrind
    if (r.fineGroundExtract !== undefined)  cfg.value.fineGroundExtract = r.fineGroundExtract
    if (r.acid !== undefined)               cfg.value.acid = r.acid
    if (r.friability !== undefined)         cfg.value.friability = r.friability
    if (r.freeAminoNitrogen !== undefined)  cfg.value.freeAminoNitrogen = r.freeAminoNitrogen
    if (r.maxInBatch !== undefined)         cfg.value.maxInBatch = r.maxInBatch
    if (r.alphaAcid !== undefined)          cfg.value.alphaAcid = r.alphaAcid
    if (r.laboratory)                       cfg.value.laboratory = r.laboratory
    if (r.yeastForm)                        cfg.value.form = r.yeastForm
    if (r.attenuation !== undefined)        cfg.value.attenuation = r.attenuation
    if (r.defaultUnit)                      cfg.value.unit = r.defaultUnit
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
    step, query, results, loading, selected, cfg, isShowingTopSearched,
    reset, onQueryChange, selectResult, openCreateNew, resultCaption,
  }
}
