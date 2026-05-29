import type { BrewPilotParameters } from '@/core/types'

const devices = {
  install(_vue: any, parameters: BrewPilotParameters) {
    parameters.putComponent('devices-page', () => import('./DevicesPage.vue'))
  }
}

export default devices
