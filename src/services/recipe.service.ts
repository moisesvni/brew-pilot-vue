import apiClient from './apiClient'
import type { Recipe } from '@/types/recipe'

export const recipeService = {
  getAll: () => apiClient.get<Recipe[]>('/recipes').then(r => r.data),
  getById: (id: string) => apiClient.get<Recipe>(`/recipes/${id}`).then(r => r.data),
  create: (recipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>) =>
    apiClient.post<Recipe>('/recipes', recipe).then(r => r.data),
  update: (id: string, recipe: Partial<Recipe>) =>
    apiClient.put<Recipe>(`/recipes/${id}`, recipe).then(r => r.data),
  delete: (id: string) => apiClient.delete(`/recipes/${id}`)
}
