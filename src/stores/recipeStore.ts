import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Recipe, RecipeStats, RecipeValidation } from '@/types/recipe'
import { calculateRecipeStats } from '@/composables/useBrewCalculator'
import {
  applyStyleAdjustmentPlan,
  getStyleAdjustmentPlan,
  type StyleAdjustmentMetric,
  type StyleAdjustmentPlan,
} from '@/pages/recipes/utils/styleAdjustments'
import { getStyleMetricStatus } from '@/pages/recipes/utils/styleMetricStatus'
import { recipeService } from '@/services/recipe.service'

export const useRecipeStore = defineStore('recipe', () => {
  // ─── State ─────────────────────────────────────────────────────────────────
  const recipes = ref<Recipe[]>([])
  const currentRecipe = ref<Recipe | null>(null)
  const loading = ref(false)
  const saving = ref(false)

  // ─── Getters ───────────────────────────────────────────────────────────────
  const stats = computed<RecipeStats | null>(() => {
    if (!currentRecipe.value) return null
    return calculateRecipeStats(currentRecipe.value)
  })

  const validations = computed<RecipeValidation[]>(() => {
    if (!currentRecipe.value || !stats.value) return []
    return validateRecipe(currentRecipe.value, stats.value)
  })

  const hasErrors = computed(() => validations.value.some(v => v.severity === 'critical'))

  // ─── Actions ───────────────────────────────────────────────────────────────
  async function loadRecipes () {
    loading.value = true
    try {
      recipes.value = await recipeService.getAll()
    } finally {
      loading.value = false
    }
  }

  async function loadRecipe (id: string) {
    loading.value = true
    try {
      currentRecipe.value = await recipeService.getById(id)
    } finally {
      loading.value = false
    }
  }

  function newRecipe (): Recipe {
    const recipe: Recipe = {
      id: '',
      name: 'Nova Receita',
      version: 1,
      type: 'AllGrain',
      isPublic: false,
      batchVolume: 20,
      preBoilVolume: 24,
      boilTime: 60,
      efficiency: 72,
      styleGuideId: '',
      styleGuide: undefined,
      fermentables: [],
      hops: [],
      yeasts: [],
      mashSteps: [
        { id: crypto.randomUUID(), name: 'Sacarificação', type: 'Infusion', temperature: 67, time: 75, waterRatio: 3.0, sortOrder: 0 },
        { id: crypto.randomUUID(), name: 'MashOut', type: 'Temperature', temperature: 75, time: 10, sortOrder: 1 }
      ],
      miscs: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    currentRecipe.value = recipe
    return recipe
  }

  async function saveRecipe () {
    if (!currentRecipe.value) return
    saving.value = true
    try {
      if (currentRecipe.value.id) {
        currentRecipe.value = await recipeService.update(currentRecipe.value.id, currentRecipe.value)
      } else {
        const saved = await recipeService.create(currentRecipe.value)
        currentRecipe.value = saved
        recipes.value.unshift(saved)
      }
    } finally {
      saving.value = false
    }
  }

  async function deleteRecipe (id: string) {
    await recipeService.delete(id)
    recipes.value = recipes.value.filter(r => r.id !== id)
    if (currentRecipe.value?.id === id) currentRecipe.value = null
  }

  async function duplicateRecipe (id: string): Promise<Recipe> {
    const source = recipes.value.find(r => r.id === id) ?? await recipeService.getById(id)
    const copy: Recipe = {
      ...source,
      id: '',
      name: `${source.name} (Cópia)`,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      fermentables: source.fermentables.map(f => ({ ...f, id: crypto.randomUUID() })),
      hops: source.hops.map(h => ({ ...h, id: crypto.randomUUID() })),
      yeasts: source.yeasts.map(y => ({ ...y, id: crypto.randomUUID() })),
      mashSteps: source.mashSteps.map(m => ({ ...m, id: crypto.randomUUID() })),
      miscs: source.miscs.map(m => ({ ...m, id: crypto.randomUUID() }))
    }
    currentRecipe.value = copy
    return copy
  }

  function applyStyleMetricTarget(metric: StyleAdjustmentMetric, target: number): StyleAdjustmentPlan | null {
    if (!currentRecipe.value) return null

    const plan = getStyleAdjustmentPlan(currentRecipe.value, metric, target)
    if (!plan.adjustable) return plan

    const appliedPlan = applyStyleAdjustmentPlan(currentRecipe.value, plan)
    const now = new Date().toISOString()

    currentRecipe.value.updatedAt = now

    if (metric === 'og') currentRecipe.value.targetOg = target
    if (metric === 'ibu') currentRecipe.value.targetIbu = target
    if (metric === 'ebc') currentRecipe.value.targetEbc = target

    return appliedPlan
  }

  return {
    recipes,
    currentRecipe,
    loading,
    saving,
    stats,
    validations,
    hasErrors,
    loadRecipes,
    loadRecipe,
    newRecipe,
    saveRecipe,
    deleteRecipe,
    duplicateRecipe,
    applyStyleMetricTarget
  }
})

// ─── Validador de receita ─────────────────────────────────────────────────────
function validateRecipe (recipe: Recipe, stats: RecipeStats): RecipeValidation[] {
  const results: RecipeValidation[] = []

  // Aviso: sem estilo selecionado
  if (!recipe.styleGuide) {
    results.push({
      severity: 'warning',
      message: 'Nenhum estilo selecionado. Selecione um estilo para comparar os parâmetros da receita.',
      field: 'style',
    })
  }

  // Crítico (SEMPRE PRIMEIRO): sem perfil de equipamento
  if (!recipe.equipmentProfile) {
    results.push({
      severity: 'critical',
      message: 'Nenhum perfil de equipamento selecionado. Sem ele os cálculos de volume e eficiência ficam incorretos.',
      field: 'equipment',
    })
  }

  // Critico: sem fermentáveis
  if (!recipe.fermentables.length) {
    results.push({ severity: 'critical', message: 'Adicione pelo menos um fermentável à receita.', field: 'fermentables' })
  }

  // Critico: sem levedura
  if (!recipe.yeasts.length) {
    results.push({ severity: 'critical', message: 'Adicione uma levedura para calcular FG e ABV.', field: 'yeasts' })
  }

  // Aviso: volume da mostura excede capacidade do equipamento
  if (recipe.equipmentProfile) {
    const { mashTunVolume } = recipe.equipmentProfile
    const waterVolume = recipe.water?.mashWaterVolume ?? 0
    const grainVolumeL = stats.totalGrainWeight * 0.75  // ~0.75 L/kg de grão seco
    if (mashTunVolume > 0 && (waterVolume + grainVolumeL) > mashTunVolume) {
      results.push({ severity: 'critical', message: `Volume total da mostura (${(waterVolume + grainVolumeL).toFixed(1)} L) excede a capacidade do equipamento (${mashTunVolume} L).` })
    }
  }

  // Aviso: OG abaixo de 1.020
  if (stats.og < 1.020 && recipe.fermentables.length > 0) {
    results.push({ severity: 'warning', message: `OG estimada (${stats.og.toFixed(3)}) está muito baixa. Verifique a quantidade de malte.` })
  }

  // Aviso: BU/GU > 1.2 (cerveja muito amarga para o corpo)
  if (stats.buGuRatio > 1.2) {
    results.push({ severity: 'warning', message: `BU/GU de ${stats.buGuRatio} está alto. A cerveja pode ficar com amargor excessivo.` })
  }

  // Aviso: eficiência fora do range comum
  if (recipe.efficiency < 50 || recipe.efficiency > 95) {
    results.push({ severity: 'warning', message: `Eficiência de ${recipe.efficiency}% está fora do range típico (50–95%).`, field: 'efficiency' })
  }

  // Comparação com estilo
  const style = recipe.styleGuide
  const hasFermentables = recipe.fermentables.length > 0
  const hasYeast = recipe.yeasts.length > 0
  const hasIbuDrivers = recipe.hops.some(hop =>
    ['Boil', 'FirstWort', 'Whirlpool', 'Hopstand'].includes(hop.use) && hop.amount > 0,
  )

  if (style) {
    pushStyleValidation(results, 'ABV', stats.abv, style.abvMin, style.abvMax, '%', hasFermentables && hasYeast)
    pushStyleValidation(results, 'OG', stats.og, style.ogMin, style.ogMax, ' SG', hasFermentables)
    pushStyleValidation(results, 'FG', stats.fg, style.fgMin, style.fgMax, ' SG', hasFermentables && hasYeast)
    pushStyleValidation(results, 'EBC', stats.ebc, style.ebcMin, style.ebcMax, ' EBC', hasFermentables)
    pushStyleValidation(results, 'IBU', stats.ibu, style.ibuMin, style.ibuMax, ' IBU', hasIbuDrivers)

    const buguMin = style.ibuMin / ((style.ogMin - 1) * 1000)
    const buguMax = style.ibuMax / ((style.ogMax - 1) * 1000)
    pushStyleValidation(results, 'BU/GU', stats.buGuRatio, buguMin, buguMax, '', hasFermentables && hasIbuDrivers)
  }

  // Sugestão: sem mostura definida para All Grain
  if (recipe.type === 'AllGrain' && recipe.mashSteps.length === 0) {
    results.push({ severity: 'suggestion', message: 'Adicione etapas de mostura para receitas All Grain.' })
  }

  return results
}

function pushStyleValidation(
  results: RecipeValidation[],
  label: string,
  current: number,
  min: number,
  max: number,
  unit: string,
  enabled: boolean,
) {
  if (!enabled) return

  const status = getStyleMetricStatus(current, min, max)
  if (status === 'ok') return

  const formattedCurrent = unit === '%'
    ? `${current.toFixed(1)}${unit}`
    : unit
      ? `${current.toFixed(unit.includes('SG') ? 3 : unit.includes('EBC') ? 1 : unit.includes('IBU') ? 0 : 2)}${unit}`
      : current.toFixed(2)

  const formattedRange = unit === '%'
    ? `${min.toFixed(1)}–${max.toFixed(1)}${unit}`
    : unit
      ? `${min.toFixed(unit.includes('SG') ? 3 : unit.includes('EBC') ? 1 : unit.includes('IBU') ? 0 : 2)}–${max.toFixed(unit.includes('SG') ? 3 : unit.includes('EBC') ? 1 : unit.includes('IBU') ? 0 : 2)}${unit}`
      : `${min.toFixed(2)}–${max.toFixed(2)}`

  results.push({
    severity: status === 'warning' ? 'warning' : 'suggestion',
    message: status === 'warning'
      ? `${label} de ${formattedCurrent} está perto do limite da faixa do estilo (${formattedRange}).`
      : `${label} de ${formattedCurrent} está fora da faixa do estilo (${formattedRange}).`,
    field: 'style',
  })
}
