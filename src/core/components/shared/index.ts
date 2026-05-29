/**
 * Brew Pilot — Shared Components Registry
 *
 * Todos os componentes exportados aqui são registrados globalmente via
 * src/boot/brew-components.ts. Nenhum import manual é necessário nos SFCs.
 *
 * Para adicionar um novo componente compartilhado:
 *   1. Crie o arquivo em src/components/shared/
 *   2. Adicione o export abaixo
 *   3. Adicione a declaração de tipo em src/components/brew-pilot.d.ts
 */

export { default as BrewPilotBanner } from './BrewPilotBanner.vue'
export { default as BrewPilotButton } from './BrewPilotButton.vue'
export { default as BrewPilotFormSection } from './BrewPilotFormSection.vue'
export { default as BrewPilotInput } from './BrewPilotInput.vue'
export { default as BrewPilotLabel } from './BrewPilotLabel.vue'
export { default as BrewPilotPageHeader } from './BrewPilotPageHeader.vue'
export { default as BrewPilotSearchInput } from './BrewPilotSearchInput.vue'
export { default as BrewPilotSelect } from './BrewPilotSelect.vue'
export { default as EquipmentCard } from './EquipmentCard.vue'
export { default as StatChip } from './StatChip.vue'
