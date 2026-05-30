import type { MashStepType } from '@/types/recipe'

export interface MashProfileStep {
  id: string
  name: string
  description?: string          // Descrição/notas da etapa
  stepType: MashStepType        // 'Infusion' | 'Temperature' | 'Decoction'
  temperature: number           // Temperatura alvo (°C)
  time: number                  // Tempo de repouso (min)
  rampDuration?: number         // Tempo de rampa até a temperatura (min)
  waterRatio?: number           // Relação água/grão (L/kg)
  infuseAmount?: number         // Volume de água a adicionar (L) — só para Infusion
  infusionTemperature?: number  // Temperatura da água de infusão (°C) — só para Infusion
  endTemperature?: number       // Temperatura final esperada da etapa (°C) — BeerXML: END_TEMP
  stepNumber: number
}
