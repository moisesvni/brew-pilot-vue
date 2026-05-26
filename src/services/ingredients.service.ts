import apiClient from './apiClient'

export type IngredientCategory = 'Fermentable' | 'Hop' | 'Yeast' | 'Misc'

export interface IngredientResult {
  id: string
  name: string
  producer?: string
  notes?: string
  // Fermentable
  fermentableType?: string
  colorEbc?: number
  potential?: number
  yieldPercentage?: number
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
