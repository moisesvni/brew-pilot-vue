import type { RecipeType } from './RecipeType'
import type { StyleGuide } from './StyleGuide'
import type { EquipmentProfile } from '../equipment/EquipmentProfile'
import type { RecipeFermentable } from './RecipeFermentable'
import type { RecipeHop } from './RecipeHop'
import type { RecipeYeast } from './RecipeYeast'
import type { RecipeMashStep } from './RecipeMashStep'
import type { FermentationStep } from './FermentationStep'
import type { RecipeMisc } from './RecipeMisc'
import type { RecipeWater } from './RecipeWater'
import type { WaterProfile } from './WaterProfile'
import type { WaterMinerals } from './WaterMinerals'

export interface Recipe {
  id: string
  name: string
  author?: string
  imageUrl?: string
  version: number
  type: RecipeType
  notes?: string
  tags?: string[]
  isPublic: boolean
  batchVolume: number
  preBoilVolume: number
  boilTime: number
  efficiency: number
  targetOg?: number
  targetFg?: number
  targetAbv?: number
  targetIbu?: number
  targetEbc?: number
  styleGuideId?: string
  styleGuide?: StyleGuide
  equipmentProfileId?: string
  equipmentProfile?: EquipmentProfile
  fermentables: RecipeFermentable[]
  hops: RecipeHop[]
  yeasts: RecipeYeast[]
  mashSteps: RecipeMashStep[]
  fermentationSteps?: FermentationStep[]
  carbonationMin?: number
  carbonationMax?: number
  measuredFg?: number
  sourceWater?: WaterProfile
  targetWater?: WaterProfile
  waterMinerals?: WaterMinerals
  miscs: RecipeMisc[]
  water?: RecipeWater
  createdAt: string
  updatedAt: string
}
