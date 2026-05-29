import type { BrewPilotParameters } from '@/core/types'

const tools = {
  install(_vue: any, parameters: BrewPilotParameters) {
    parameters.putComponent('tools-page', () => import('./ToolsPage.vue'))
  }
}

export default tools
