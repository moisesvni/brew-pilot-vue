import type { App } from 'vue'
import type { BrewPilotOptions, BrewPilotParameters } from '@/core/types'
import componentCore from '@/core/component'

import coreModule from '@/core'
import auth from '@/pages/auth'
import batches from '@/pages/batches'
import devices from '@/pages/devices'
import equipment from '@/pages/equipment'
import ingredients from '@/pages/ingredients'
import inventory from '@/pages/inventory'
import library from '@/pages/library'
import profiles from '@/pages/profiles'
import recipes from '@/pages/recipes'
import settings from '@/pages/settings'
import styles from '@/pages/styles'
import tools from '@/pages/tools'

const MODULES = [
  coreModule,
  auth,
  batches,
  devices,
  equipment,
  ingredients,
  inventory,
  library,
  profiles,
  recipes,
  settings,
  styles,
  tools,
]

const brewPilot = {
  install(app: App, options: Partial<BrewPilotOptions> = {}) {
    const parameters = { ...options } as BrewPilotParameters
    parameters.beforeInit = []

    // 1. Inicializa o sistema de registro de componentes (putComponent / getComponent)
    app.use(componentCore, parameters)

    // 2. Cada módulo registra seus componentes via putComponent
    for (const module of MODULES) {
      app.use(module, parameters)
    }

    // 3. Executa os callbacks beforeInit — registra os async components no Vue
    for (const fn of parameters.beforeInit) {
      fn()
    }
  }
}

export default brewPilot
export type { BrewPilotOptions }
export { putComponent, getComponent } from '@/core/component'
