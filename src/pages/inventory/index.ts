import type { BrewPilotParameters } from '@/core/types'

const inventory = {
  install(_vue: any, parameters: BrewPilotParameters) {
    parameters.putComponent('inventory-page', () => import('./InventoryPage.vue'))
  }
}

export default inventory
