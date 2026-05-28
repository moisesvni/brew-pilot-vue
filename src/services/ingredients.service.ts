import apiClient from './apiClient'

export type IngredientCategory = 'Fermentable' | 'Hop' | 'Yeast' | 'Misc'

export interface IngredientResult {
  id: string
  name: string
  producer?: string
  notes?: string
  // Fermentable
  fermentableType?: string
  category?: string
  origin?: string
  colorEbc?: number
  potential?: number
  yieldPercentage?: number
  diastaticPower?: number
  description?: string
  usedIn?: string
  substitutes?: string
  moisture?: number
  protein?: number
  coarseFineGrind?: number
  fineGroundExtract?: number
  acid?: number
  friability?: number
  freeAminoNitrogen?: number
  maxInBatch?: number
  // Hop
  alphaAcid?: number
  // Yeast
  laboratory?: string
  yeastForm?: string
  attenuation?: number
  // Misc
  defaultUnit?: string
}

export const ingredientsService = {
  search: (category: IngredientCategory, q: string) =>
    apiClient
      .get<IngredientResult[]>('/ingredients', { params: { category, q, limit: 25 } })
      .then(r => r.data)
}
