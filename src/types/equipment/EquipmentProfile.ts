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
  // Volumes avançados
  mashLoss?: number
  spargeDeadSpace?: number
  fermenterWater?: number
  calculateBoilVolume?: boolean
  // Eficiência
  calculateMashEfficiency?: boolean
  // Lúpulo / Hopstand
  hopUtilization?: number
  aromaHopUtilization?: number
  calculateAromaHopUtil?: boolean
  hopstandTemperature?: number
  whirlpoolTime?: number
  // Altitude / Fervura
  altitudeAdjust?: boolean
  altitude?: number
  boilExpansion?: number
  // Água de mostura
  grainAbsorptionRate?: number
  waterToGrainRatio?: number
  mashWaterMethod?: string
}
