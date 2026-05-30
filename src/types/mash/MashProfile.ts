import type { MashProfileStep } from './MashProfileStep'

export interface MashProfile {
  id: string
  name: string
  notes?: string
  isDefault?: boolean
  grainTemperature?: number    // Temperatura inicial do grão (°C) — BeerXML: GRAIN_TEMP
  tunTemperature?: number      // Temperatura da tina (°C) — BeerXML: TUN_TEMP
  spargeTemperature?: number   // Temperatura de lavagem/sparging (°C) — BeerXML: SPARGE_TEMP
  targetPh?: number            // pH alvo da mostura (4.4–5.5) — BeerXML: PH
  spargeType?: string          // Enum: 'Default' | 'BatchSparge' | 'NoSparge' | 'NoBoilExpansion' | 'Custom'
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
