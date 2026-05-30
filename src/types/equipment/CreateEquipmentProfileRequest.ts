import type { EquipmentProfile } from './EquipmentProfile'

export type CreateEquipmentProfileRequest = Omit<EquipmentProfile, 'id' | 'userId'>
