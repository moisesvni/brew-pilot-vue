import type { BrewPilotParameters } from '@/core/types'

const equipment = {
  install(_vue: any, parameters: BrewPilotParameters) {
    parameters.putComponent('equipment-page', () => import('./EquipmentPage.vue'))
  }
}

export default equipment
