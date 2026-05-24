import axios from 'axios'
import type { Recipe } from '../types/recipe.types'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  timeout: 10000
})

export const recipeService = {
  getAll: () => api.get<Recipe[]>('/recipes').then(r => r.data),
  getById: (id: string) => api.get<Recipe>(`/recipes/${id}`).then(r => r.data),
  create: (recipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>) =>
    api.post<Recipe>('/recipes', recipe).then(r => r.data),
  update: (id: string, recipe: Partial<Recipe>) =>
    api.put<Recipe>(`/recipes/${id}`, recipe).then(r => r.data),
  delete: (id: string) => api.delete(`/recipes/${id}`)
}
