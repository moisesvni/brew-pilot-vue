import type { BrewPilotParameters } from '@/core/types'

const auth = {
  install(_vue: any, parameters: BrewPilotParameters) {
    parameters.putComponent('auth-login-page', () => import('./LoginPage.vue'))
    parameters.putComponent('auth-register-page', () => import('./RegisterPage.vue'))
  }
}

export default auth
