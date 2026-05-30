/**
 * Brew Pilot — Global Components Type Declarations
 *
 * Augmenta a interface GlobalComponents do Vue para que o Volar/VS Code
 * reconheça os componentes registrados globalmente (brew-components boot).
 *
 * Benefícios:
 *   - Autocomplete de props e eventos nos templates
 *   - "Go to Definition" (Ctrl+Click) no nome do componente
 *   - Zero erros de tipo sem import manual
 *
 * Ao adicionar um novo componente em shared/index.ts, adicione também aqui.
 */

import type BrewPilotBanner from '@/core/components/shared/BrewPilotBanner.vue'
import type BrewPilotBreadcrumbs from '@/core/components/BrewPilotBreadcrumbs.vue'
import type BrewPilotButton from '@/core/components/shared/BrewPilotButton.vue'
import type BrewPilotDialog from '@/core/components/shared/BrewPilotDialog.vue'
import type BrewPilotFormSection from '@/core/components/shared/BrewPilotFormSection.vue'
import type BrewPilotInput from '@/core/components/shared/BrewPilotInput.vue'
import type BrewPilotLabel from '@/core/components/shared/BrewPilotLabel.vue'
import type BrewPilotPageHeader from '@/core/components/shared/BrewPilotPageHeader.vue'
import type BrewPilotSearchInput from '@/core/components/shared/BrewPilotSearchInput.vue'
import type BrewPilotSelect from '@/core/components/shared/BrewPilotSelect.vue'
import type EquipmentCard from '@/core/components/shared/EquipmentCard.vue'
import type StatChip from '@/core/components/shared/StatChip.vue'
import type BrewPilotLoading from '@/core/components/shared/BrewPilotLoading.vue'
import type UpgradeButton from '@/core/components/shared/UpgradeButton.vue'
// Profiles module
import type BrewPilotEquipmentBasePickerDialog from '@/pages/profiles/equipment/EquipmentBasePickerDialog.vue'
import type BrewPilotEditEquipmentDialog from '@/pages/profiles/equipment/EditEquipmentDialog.vue'
import type EditMashProfileDialog from '@/pages/profiles/mash/EditMashProfileDialog.vue'
import type MashProfileCard from '@/pages/profiles/mash/MashProfileCard.vue'
import type MashGuideDialog from '@/pages/profiles/mash/MashGuideDialog.vue'

declare module 'vue' {
  export interface GlobalComponents {
    BrewPilotBanner: typeof BrewPilotBanner
    BrewPilotBreadcrumbs: typeof BrewPilotBreadcrumbs
    BrewPilotLoading: typeof BrewPilotLoading
    BrewPilotButton: typeof BrewPilotButton
    BrewPilotDialog: typeof BrewPilotDialog
    BrewPilotFormSection: typeof BrewPilotFormSection
    BrewPilotInput: typeof BrewPilotInput
    BrewPilotLabel: typeof BrewPilotLabel
    BrewPilotPageHeader: typeof BrewPilotPageHeader
    BrewPilotSearchInput: typeof BrewPilotSearchInput
    BrewPilotSelect: typeof BrewPilotSelect
    EquipmentCard: typeof EquipmentCard
    StatChip: typeof StatChip
    UpgradeButton: typeof UpgradeButton
    // Profiles module
    BrewPilotEquipmentBasePickerDialog: typeof BrewPilotEquipmentBasePickerDialog
    BrewPilotEditEquipmentDialog: typeof BrewPilotEditEquipmentDialog
    EditMashProfileDialog: typeof EditMashProfileDialog
    MashProfileCard: typeof MashProfileCard
    MashGuideDialog: typeof MashGuideDialog
  }
}
