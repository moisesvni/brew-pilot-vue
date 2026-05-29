import type { BrewPilotParameters } from '@/core/types'

const library = {
  install(_vue: any, parameters: BrewPilotParameters) {
    parameters.putComponent('library-page', () => import('./LibraryPage.vue'))
  }
}

export default library
