import type { MashStepType } from './MashStepType'

export interface RecipeMashStep {
  id: string
  name: string
  type: MashStepType
  temperature: number  // °C
  time: number         // minutos
  waterRatio?: number  // L/kg
  sortOrder: number
}
