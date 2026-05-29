import type { BrewPilotParameters } from '@/core/types'

const settings = {
  install(_vue: any, parameters: BrewPilotParameters) {
    parameters.putComponent('settings-page', () => import('./SettingsPage.vue'))
  }
}

export default settings
