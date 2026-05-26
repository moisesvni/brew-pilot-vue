import type { YeastForm } from './YeastForm'

export interface RecipeYeast {
  id: string
  name: string
  laboratory?: string
  form: YeastForm
  attenuation: number
  packages: number
  fermentationTemperature?: number
  starterVolume?: number
  starterGravity?: number
  cellsPerGram?: number      // bilhões/grama (dry yeast)
  excessCells?: number       // bilhões de células excedente
  ingredientId?: string
}
