import type { BrewPilotParameters } from '@/core/types'

/**
 * Core module — registra todos os componentes UI compartilhados.
 */
const core = {
  install(_vue: any, parameters: BrewPilotParameters) {
    parameters.putComponent('brew-pilot-banner', () => import('@/core/components/shared/BrewPilotBanner.vue'))
    parameters.putComponent('brew-pilot-breadcrumbs', () => import('@/core/components/BrewPilotBreadcrumbs.vue'))
    parameters.putComponent('brew-pilot-button', () => import('@/core/components/shared/BrewPilotButton.vue'))
    parameters.putComponent('brew-pilot-dialog', () => import('@/core/components/shared/BrewPilotDialog.vue'))
    parameters.putComponent('brew-pilot-form-section', () => import('@/core/components/shared/BrewPilotFormSection.vue'))
    parameters.putComponent('brew-pilot-input', () => import('@/core/components/shared/BrewPilotInput.vue'))
    parameters.putComponent('brew-pilot-label', () => import('@/core/components/shared/BrewPilotLabel.vue'))
    parameters.putComponent('brew-pilot-page-header', () => import('@/core/components/shared/BrewPilotPageHeader.vue'))
    parameters.putComponent('brew-pilot-search-input', () => import('@/core/components/shared/BrewPilotSearchInput.vue'))
    parameters.putComponent('brew-pilot-select', () => import('@/core/components/shared/BrewPilotSelect.vue'))
    parameters.putComponent('equipment-card', () => import('@/core/components/shared/EquipmentCard.vue'))
    parameters.putComponent('stat-chip', () => import('@/core/components/shared/StatChip.vue'))
    parameters.putComponent('brew-pilot-user-avatar-menu', () => import('@/core/components/UserAvatarMenu.vue'))
  }
}

export default core
