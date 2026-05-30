import type { MashProfileStep } from './MashProfileStep'

export interface MashProfile {
  id: string
  name: string
  notes?: string
  isDefault?: boolean
  grainTemp?: number     // Temperatura inicial do grão (°C)
  tunTemp?: number       // Temperatura da tina (°C)
  spargeTemp?: number    // Temperatura de lavagem/sparging (°C)
  // Sparging
  batchSparge?: boolean
  batchSpargePercent?: number   // % de preenchimento por lote (padrão 100)
  equalBatchSizes?: boolean
  drainBeforeSparge?: boolean
  // BIAB
  biab?: boolean
  biabBoilVolume?: number       // Volume base de fervura (L)
  steps: MashProfileStep[]
  createdAt?: string
  updatedAt?: string
}
