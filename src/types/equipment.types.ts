export interface EquipmentProfile {
  id: string
  name: string
  batchVolume: number
  preBoilVolume: number
  boilTime: number
  efficiency: number
  mashEfficiency: number
  boilOffRate: number
  trubLoss: number
  fermentorLoss: number
  deadSpace: number
  mashTunVolume: number
  boilTemperature: number
  notes?: string
  isDefault: boolean
  userId?: string
}

export type CreateEquipmentProfileRequest = Omit<EquipmentProfile, 'id' | 'isDefault' | 'userId'>
