import type { BrewPilotParameters } from '@/core/types'

const ingredients = {
  install(_vue: any, parameters: BrewPilotParameters) {
    parameters.putComponent('ingredients-page', () => import('./IngredientsPage.vue'))
  }
}

export default ingredients
