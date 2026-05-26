import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Recipe, RecipeStats, RecipeValidation } from '../types/recipe'
import { calculateRecipeStats } from '../composables/useBrewCalculator'
import { recipeService } from '../services/recipe.service'
import { sampleStyles } from '../data/styles-sample'

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
      styleGuideId: sampleStyles[0].id,
      styleGuide: sampleStyles[0],
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
    duplicateRecipe
  }
})

// ─── Validador de receita ─────────────────────────────────────────────────────
function validateRecipe (recipe: Recipe, stats: RecipeStats): RecipeValidation[] {
  const results: RecipeValidation[] = []

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
  if (style && stats.og > 1.010) {
    if (stats.abv < style.abvMin || stats.abv > style.abvMax) {
      results.push({ severity: 'suggestion', message: `ABV de ${stats.abv}% está fora da faixa do estilo ${style.name} (${style.abvMin}–${style.abvMax}%).` })
    }
    if (stats.ibu < style.ibuMin || stats.ibu > style.ibuMax) {
      results.push({ severity: 'suggestion', message: `IBU de ${stats.ibu} está fora da faixa do estilo (${style.ibuMin}–${style.ibuMax} IBU).` })
    }
  }

  // Sugestão: sem mostura definida para All Grain
  if (recipe.type === 'AllGrain' && recipe.mashSteps.length === 0) {
    results.push({ severity: 'suggestion', message: 'Adicione etapas de mostura para receitas All Grain.' })
  }

  return results
}
