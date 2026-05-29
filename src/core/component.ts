import { defineAsyncComponent } from 'vue'
import type { App } from 'vue'
import type { BrewPilotParameters } from '@/core/types'

const DEFAULT_PREFIX = 'BrewPilot'
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

function convertName(prefix: string, name: string): string {
  const formatted = name
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')
  if (!prefix) return formatted
  return formatted.startsWith(prefix)
    ? formatted
    : `${prefix}${formatted.charAt(0).toUpperCase()}${formatted.slice(1)}`
}

export function putComponent(
  prefixOrName: string,
  nameOrFactory: string | (() => Promise<any>),
  factory?: () => Promise<any>
): void {
  let prefix = prefixOrName
  let name: string

  if (typeof nameOrFactory === 'function') {
    factory = nameOrFactory
    name = prefixOrName
    prefix = ''
  } else {
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
