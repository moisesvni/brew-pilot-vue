import type { BrewPilotParameters } from '@/core/types'

const styles = {
  install(_vue: any, parameters: BrewPilotParameters) {
    parameters.putComponent('styles-page', () => import('./StylesPage.vue'))
  }
}

export default styles
