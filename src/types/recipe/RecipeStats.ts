export interface RecipeStats {
  og: number
  fg: number
  abv: number
  ibu: number
  ebc: number
  srm: number
  buGuRatio: number
  calories: number
  caloriesPer100Ml: number
  energyKjPer100Ml: number
  carbsPer100Ml: number
  preBoilOg: number
  totalGrainWeight: number
  totalHopWeight: number
  fermentableContributions: Array<{ name: string; percentage: number; color: number }>
}
