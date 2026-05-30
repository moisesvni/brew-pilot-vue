import type { BrewPilotParameters } from '@/core/types'

/**
 * Core module — registra todos os componentes UI compartilhados.
 */
const core = {
  install(_vue: any, parameters: BrewPilotParameters) {
    parameters.putComponent('banner', () => import('@/core/components/shared/BrewPilotBanner.vue'))
    parameters.putComponent('breadcrumbs', () => import('@/core/components/BrewPilotBreadcrumbs.vue'))
    parameters.putComponent('button', () => import('@/core/components/shared/BrewPilotButton.vue'))
    parameters.putComponent('dialog', () => import('@/core/components/shared/BrewPilotDialog.vue'))
    parameters.putComponent('form-section', () => import('@/core/components/shared/BrewPilotFormSection.vue'))
    parameters.putComponent('input', () => import('@/core/components/shared/BrewPilotInput.vue'))
    parameters.putComponent('label', () => import('@/core/components/shared/BrewPilotLabel.vue'))
    parameters.putComponent('page-header', () => import('@/core/components/shared/BrewPilotPageHeader.vue'))
    parameters.putComponent('search-input', () => import('@/core/components/shared/BrewPilotSearchInput.vue'))
    parameters.putComponent('select', () => import('@/core/components/shared/BrewPilotSelect.vue'))
    parameters.putComponent('equipment', 'card', () => import('@/core/components/shared/EquipmentCard.vue'))
    parameters.putComponent('stat', 'chip', () => import('@/core/components/shared/StatChip.vue'))
    parameters.putComponent('user-avatar-menu', () => import('@/core/components/UserAvatarMenu.vue'))
    parameters.putComponent('loading', () => import('@/core/components/shared/BrewPilotLoading.vue'))
    parameters.putComponent('page', () => import('@/core/components/shared/BrewPilotPage.vue'))
    parameters.putComponent('subscription-plan-button', () => import('@/core/components/shared/SubscriptionPlanButton.vue'))
  }
}

export default core
