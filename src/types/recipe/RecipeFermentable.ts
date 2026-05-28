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

  // Identificação adicional
  category?: string    // Base, Crystal, Roasted, etc.
  origin?: string      // País de origem

  // Opções de uso
  excludeFromTotal?: boolean
  nonFermentable?: boolean

  // Anotações do usuário
  notes?: string

  // Dados do fabricante (populados ao selecionar da base)
  description?: string
  usedIn?: string
  substitutes?: string

  // Dados técnicos do fabricante
  moisture?: number          // %
  protein?: number           // %
  coarseFineGrind?: number   // % diferença fina/grossa
  fineGroundExtract?: number // % extrato pó base seca moagem fina
  acid?: number              // %
  friability?: number        // %
  freeAminoNitrogen?: number // mg/L (FAN)
  maxInBatch?: number        // % máxima recomendada na receita
}
