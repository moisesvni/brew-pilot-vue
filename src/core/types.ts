export interface BrewPilotOptions {
  // reservado para configurações futuras
}

export interface BrewPilotParameters extends Partial<BrewPilotOptions> {
  putComponent: {
    (name: string, factory: () => Promise<any>): void
    (prefix: string, name: string, factory: () => Promise<any>): void
  }
  getComponent: (name: string) => (() => Promise<any>) | undefined
  beforeInit: Array<() => void>
}
