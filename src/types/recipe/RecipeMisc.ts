import type { MiscUse } from './MiscUse'

export interface RecipeMisc {
  id: string
  name: string
  use: MiscUse
  amount: number
  unit: string
  time?: number
  ingredientId?: string
}
