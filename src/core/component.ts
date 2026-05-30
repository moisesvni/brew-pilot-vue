import { defineAsyncComponent } from 'vue'
import type { App } from 'vue'
import type { BrewPilotParameters } from '@/core/types'

const DEFAULT_PREFIX = 'brew-pilot'
const _components: Record<string, () => Promise<any>> = {}

const component = {
  install(app: App, parameters: BrewPilotParameters) {
    parameters.putComponent = putComponent
    parameters.getComponent = getComponent

    const beforeInit = (parameters.beforeInit ??= [])
    beforeInit.push(() => {
      Object.entries(_components).forEach(([key, factory]) => {
        app.component(key, defineAsyncComponent({
          loader: factory,
          suspensible: false
        }))
      })
    })
  }
}

function toPascal(str: string): string {
  return str.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('')
}

function convertName(prefix: string, name: string): string {
  const formattedName = toPascal(name)
  if (!prefix) return formattedName
  const formattedPrefix = toPascal(prefix)
  return formattedName.startsWith(formattedPrefix)
    ? formattedName
    : `${formattedPrefix}${formattedName}`
}

export function putComponent(
  prefixOrName: string,
  nameOrFactory: string | (() => Promise<any>),
  factory?: () => Promise<any>
): void {
  let prefix: string
  let name: string

  if (typeof nameOrFactory === 'function') {
    // putComponent('grid', factory) → auto-prefix brew-pilot → BrewPilotGrid
    factory = nameOrFactory
    name = prefixOrName
    prefix = DEFAULT_PREFIX
  } else {
    // putComponent('grid', 'body', factory) → prefix=grid → GridBody
    prefix = prefixOrName
    name = nameOrFactory
  }

  const formattedName = convertName(prefix, name)
  if (typeof factory !== 'function') {
    console.warn(`[BrewPilot] factory de ${formattedName} deve ser uma função`)
    return
  }
  if (_components[formattedName] && process.env.NODE_ENV !== 'production') {
    console.warn(`[BrewPilot] componente ${formattedName} foi sobrescrito`)
  }
  _components[formattedName] = factory
}

export function getComponent(name: string): (() => Promise<any>) | undefined {
  const formattedName = convertName('', name)
  return _components[formattedName]
}

export default component
