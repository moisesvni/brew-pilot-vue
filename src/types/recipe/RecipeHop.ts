import type { HopUse } from './HopUse'

export interface RecipeHop {
  id: string
  name: string
  use: HopUse
  amount: number       // gramas
  alphaAcid: number    // %
  time: number         // minutos ou dias
  temperature?: number // °C para whirlpool/hopstand
  sortOrder: number
  ingredientId?: string
  // Calculado no frontend
  ibuContribution?: number
  gramsPerLiter?: number
}
