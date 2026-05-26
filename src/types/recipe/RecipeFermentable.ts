import type { FermentableType } from './FermentableType'
import type { FermentableUse } from './FermentableUse'

export interface RecipeFermentable {
  id: string
  name: string
  supplier?: string
  type: FermentableType
  use: FermentableUse
  amount: number       // kg
  colorEbc: number
  potential: number
  yieldPercentage: number
  diastaticPower?: number  // °Lintner
  sortOrder: number
  ingredientId?: string
}
