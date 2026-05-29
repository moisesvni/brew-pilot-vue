import type { BrewPilotParameters } from '@/core/types'

const batches = {
  install(_vue: any, parameters: BrewPilotParameters) {
    parameters.putComponent('batches-page', () => import('./BatchesPage.vue'))
  }
}

export default batches
