import type { BrewPilotParameters } from '@/core/types'

const profiles = {
  install(_vue: any, parameters: BrewPilotParameters) {
    // Equipment — template usa brew-pilot- prefix (2-arg)
    parameters.putComponent('equipment-base-picker-dialog', () => import('./equipment/EquipmentBasePickerDialog.vue'))
    parameters.putComponent('edit-equipment-dialog', () => import('./equipment/EditEquipmentDialog.vue'))

    // Mash — template usa nomes sem brew-pilot- prefix (3-arg)
    parameters.putComponent('edit-mash-profile', 'dialog', () => import('./mash/EditMashProfileDialog.vue'))
    parameters.putComponent('mash-profile', 'card', () => import('./mash/MashProfileCard.vue'))
    parameters.putComponent('mash-guide', 'dialog', () => import('./mash/MashGuideDialog.vue'))
  }
}

export default profiles
