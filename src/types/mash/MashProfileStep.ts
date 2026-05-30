import type { MashStepType } from '@/types/recipe'

export interface MashProfileStep {
  id: string
  name: string
  description?: string      // Descrição/notas da etapa
  type: MashStepType        // 'Infusion' | 'Temperature' | 'Decoction'
  temperature: number       // Temperatura alvo (°C)
  time: number              // Tempo de repouso (min)
  rampTime?: number         // Tempo de rampa até a temperatura (min)
  waterRatio?: number       // Relação água/grão (L/kg)
  waterToAdd?: number       // Volume de água a adicionar (L) — só para Infusion
  infusionTemp?: number     // Temperatura da água de infusão (°C) — só para Infusion
  sortOrder: number
}
