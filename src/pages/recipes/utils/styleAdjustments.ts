import {
  calculateEbc,
  calculateOg,
  calculateRecipeStats,
  totalIbu,
} from '@/composables/useBrewCalculator'
import type { Recipe, RecipeFermentable, RecipeHop } from '@/types/recipe'

export type StyleAdjustmentMetric = 'og' | 'ibu' | 'ebc'

export interface StyleAdjustmentIngredient {
  id: string
  name: string
  kind: 'fermentable' | 'hop'
  amount: number
  previewAmount: number
  unit: 'kg' | 'g'
  contributionPct: number
}

export interface StyleAdjustmentPlan {
  metric: StyleAdjustmentMetric
  current: number
  target: number
  achieved: number
  factor: number
  adjustable: boolean
  ingredientLabel: string
  reason?: string
  ingredients: StyleAdjustmentIngredient[]
}

export function getStyleAdjustmentPlan(
  recipe: Recipe,
  metric: StyleAdjustmentMetric,
  target: number,
): StyleAdjustmentPlan {
  if (metric === 'og') {
    return buildOgPlan(recipe, target)
  }

  if (metric === 'ibu') {
    return buildIbuPlan(recipe, target)
  }

  return buildEbcPlan(recipe, target)
}

export function applyStyleAdjustmentPlan(recipe: Recipe, plan: StyleAdjustmentPlan): StyleAdjustmentPlan {
  if (!plan.adjustable) {
    return plan
  }

  if (plan.metric === 'ibu') {
    const adjustedIds = new Set(plan.ingredients.map(ingredient => ingredient.id))
    recipe.hops.forEach(hop => {
      if (!adjustedIds.has(hop.id)) return
      hop.amount = roundAmount(hop.amount * plan.factor, 0)
    })
  } else {
    const adjustedIds = new Set(plan.ingredients.map(ingredient => ingredient.id))
    recipe.fermentables.forEach(fermentable => {
      if (!adjustedIds.has(fermentable.id)) return
      fermentable.amount = roundAmount(fermentable.amount * plan.factor, 3)
    })
  }

  const stats = calculateRecipeStats(recipe)
  const achieved = plan.metric === 'og'
    ? stats.og
    : plan.metric === 'ibu'
      ? stats.ibu
      : stats.ebc

  return {
    ...plan,
    achieved,
  }
}

function buildOgPlan(recipe: Recipe, target: number): StyleAdjustmentPlan {
  if (!recipe.fermentables.length) {
    return unavailablePlan('og', target, 1.0, 'Fermentáveis', 'Adicione fermentáveis para ajustar a OG da receita.')
  }

  const current = calculateOg(recipe)
  if (current <= 1 || target <= 1) {
    return unavailablePlan('og', target, current, 'Fermentáveis', 'Defina um alvo de OG acima de 1.000.')
  }

  const factor = clampFactor((target - 1) / (current - 1))
  const fermentables = recipe.fermentables.filter(fermentable => fermentable.amount > 0)
  const achieved = calculateOg({
    fermentables: fermentables.map(fermentable => ({
      ...fermentable,
      amount: roundAmount(fermentable.amount * factor, 3),
    })),
    batchVolume: recipe.batchVolume,
    efficiency: recipe.efficiency,
  })

  return {
    metric: 'og',
    current,
    target,
    achieved,
    factor,
    adjustable: true,
    ingredientLabel: 'Fermentáveis',
    ingredients: buildFermentableIngredients(recipe.fermentables, fermentableOgPoints, factor),
  }
}

function buildIbuPlan(recipe: Recipe, target: number): StyleAdjustmentPlan {
  const activeHops = recipe.hops.filter(hop => hopContributionIbu(hop, recipe) > 0)
  if (!activeHops.length) {
    return unavailablePlan('ibu', target, 0, 'Lúpulos', 'Adicione lúpulos com contribuição de amargor para ajustar o IBU.')
  }

  const current = totalIbu(recipe.hops, calculateOg(recipe), recipe.batchVolume)
  if (current <= 0) {
    return unavailablePlan('ibu', target, current, 'Lúpulos', 'A receita ainda não tem lúpulos que alterem o IBU.')
  }

  const factor = clampFactor(target <= 0 ? 0 : target / current)
  const adjustedHops = recipe.hops.map(hop => {
    if (!activeHops.some(activeHop => activeHop.id === hop.id)) return hop
    return {
      ...hop,
      amount: roundAmount(hop.amount * factor, 0),
    }
  })

  return {
    metric: 'ibu',
    current,
    target,
    achieved: totalIbu(adjustedHops, calculateOg(recipe), recipe.batchVolume),
    factor,
    adjustable: true,
    ingredientLabel: 'Lúpulos',
    ingredients: buildHopIngredients(activeHops, recipe, factor),
  }
}

function buildEbcPlan(recipe: Recipe, target: number): StyleAdjustmentPlan {
  if (!recipe.fermentables.length) {
    return unavailablePlan('ebc', target, 0, 'Fermentáveis', 'Adicione fermentáveis para ajustar a cor da receita.')
  }

  const current = calculateEbc(recipe.fermentables, recipe.batchVolume)
  const fermentables = recipe.fermentables.filter(fermentable => fermentable.amount > 0)
  const factor = solveFermentableFactor(fermentables, recipe.batchVolume, target)
  const achieved = calculateEbc(
    fermentables.map(fermentable => ({
      amount: roundAmount(fermentable.amount * factor, 3),
      colorEbc: fermentable.colorEbc,
    })),
    recipe.batchVolume,
  )

  return {
    metric: 'ebc',
    current,
    target,
    achieved,
    factor,
    adjustable: true,
    ingredientLabel: 'Fermentáveis',
    ingredients: buildFermentableIngredients(recipe.fermentables, fermentableColorLoad, factor),
  }
}

function unavailablePlan(
  metric: StyleAdjustmentMetric,
  target: number,
  current: number,
  ingredientLabel: string,
  reason: string,
): StyleAdjustmentPlan {
  return {
    metric,
    current,
    target,
    achieved: current,
    factor: 1,
    adjustable: false,
    ingredientLabel,
    reason,
    ingredients: [],
  }
}

function buildFermentableIngredients(
  fermentables: RecipeFermentable[],
  score: (fermentable: RecipeFermentable) => number,
  factor: number,
): StyleAdjustmentIngredient[] {
  const total = fermentables.reduce((sum, fermentable) => sum + score(fermentable), 0)

  return fermentables
    .filter(fermentable => fermentable.amount > 0)
    .map(fermentable => ({
      id: fermentable.id,
      name: fermentable.name,
      kind: 'fermentable' as const,
      amount: fermentable.amount,
      previewAmount: roundAmount(fermentable.amount * factor, 3),
      unit: 'kg' as const,
      contributionPct: total > 0 ? (score(fermentable) / total) * 100 : 0,
    }))
    .sort((left, right) => right.contributionPct - left.contributionPct)
}

function buildHopIngredients(hops: RecipeHop[], recipe: Recipe, factor: number): StyleAdjustmentIngredient[] {
  const total = hops.reduce((sum, hop) => sum + hopContributionIbu(hop, recipe), 0)

  return hops
    .map(hop => ({
      id: hop.id,
      name: hop.name,
      kind: 'hop' as const,
      amount: hop.amount,
      previewAmount: roundAmount(hop.amount * factor, 0),
      unit: 'g' as const,
      contributionPct: total > 0 ? (hopContributionIbu(hop, recipe) / total) * 100 : 0,
    }))
    .sort((left, right) => right.contributionPct - left.contributionPct)
}

function fermentableOgPoints(fermentable: RecipeFermentable): number {
  const ppg = fermentable.potential > 1 ? fermentable.potential : fermentable.potential * 46
  const amountLbs = fermentable.amount * 2.20462
  return amountLbs * ppg * (fermentable.yieldPercentage / 100)
}

function fermentableColorLoad(fermentable: RecipeFermentable): number {
  const lbs = fermentable.amount * 2.20462
  const srm = fermentable.colorEbc / 1.97
  return lbs * srm
}

function hopContributionIbu(hop: RecipeHop, recipe: Recipe): number {
  return totalIbu([hop], calculateOg(recipe), recipe.batchVolume)
}

function solveFermentableFactor(
  fermentables: RecipeFermentable[],
  batchVolume: number,
  target: number,
): number {
  if (!fermentables.length || target <= 0) return 0

  const measure = (factor: number) => calculateEbc(
    fermentables.map(fermentable => ({
      amount: fermentable.amount * factor,
      colorEbc: fermentable.colorEbc,
    })),
    batchVolume,
  )

  let low = 0
  let high = 1

  while (measure(high) < target && high < 64) {
    high *= 2
  }

  for (let index = 0; index < 40; index += 1) {
    const middle = (low + high) / 2
    if (measure(middle) < target) low = middle
    else high = middle
  }

  return clampFactor((low + high) / 2)
}

function clampFactor(value: number): number {
  if (!Number.isFinite(value)) return 1
  return Math.min(Math.max(value, 0), 64)
}

function roundAmount(value: number, decimals: number): number {
  return Number(value.toFixed(decimals))
}