export interface EquipmentProfile {
  id: string
  name: string
  /**
   * Tipo de setup físico do equipamento:
   * BIAB | TwoVessel | ThreeVessel | Extract | PartialMash | FermentedBeverage
   * (antigo equipmentType = AllGrain/Cider/etc. — mantido por compat. mas setupType tem precedência)
   */
  setupType?: string
  /** @deprecated use setupType */
  equipmentType?: string

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

  // Volume alvo: 'Fermentador' | 'Panela'
  batchVolumeTarget?: string

  // Tipo de fermentador: FlatBottom | Conical | Unitank | Custom
  fermenterType?: string

  // BIAB / Panela Única
  bagSqueeze?: boolean           // Espremer o saco (reduz absorção ~30%)

  // 3 Panelas / Tri-Bloc
  hltVolume?: number             // Volume do HLT (Hot Liquor Tank)

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
  /** Método de lavagem dos grãos: BatchSparge | FlySparge | NoSparge | RIMS | HERMS */
  lauterMethod?: string
}
