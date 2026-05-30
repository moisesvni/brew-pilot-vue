import type { BrewPilotParameters } from '@/core/types'

const profiles = {
  install(_vue: any, parameters: BrewPilotParameters) {
    parameters.putComponent('profiles-page', () => import('./ProfilesPage.vue'))
    parameters.putComponent('equipment-base-picker-dialog', () => import('./EquipmentBasePickerDialog.vue'))
    parameters.putComponent('mash-profiles-page', () => import('./MashProfilesPage.vue'))
  }
}

export default profiles
