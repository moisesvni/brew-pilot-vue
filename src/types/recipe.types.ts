// ─── Enums ────────────────────────────────────────────────────────────────────
export type RecipeType = 'AllGrain' | 'PartialMash' | 'Extract'
export type HopUse = 'FirstWort' | 'Boil' | 'Whirlpool' | 'Hopstand' | 'DryHop'
export type FermentableUse = 'Mash' | 'Steep' | 'Boil' | 'LateAddition'
export type FermentableType = 'Grain' | 'Sugar' | 'DryExtract' | 'LiquidExtract' | 'Honey' | 'Juice' | 'Adjunct'
export type YeastForm = 'Dry' | 'Liquid' | 'Slurry'
export type MashStepType = 'Infusion' | 'Temperature' | 'Decoction'
export type MiscUse = 'Mash' | 'Boil' | 'Fermentation' | 'Packaging'

// ─── Estilo BJCP ─────────────────────────────────────────────────────────────
export interface StyleGuide {
  id: string
  code: string
  category: string
  name: string
  ogMin: number; ogMax: number
  fgMin: number; fgMax: number
  abvMin: number; abvMax: number
  ibuMin: number; ibuMax: number
  ebcMin: number; ebcMax: number
  notes?: string
}

// ─── Perfil de equipamento ───────────────────────────────────────────────────
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
}

// ─── Itens da receita ─────────────────────────────────────────────────────────
export interface RecipeFermentable {
  id: string
  name: string
  type: FermentableType
  use: FermentableUse
  amount: number       // kg
  colorEbc: number
  potential: number
  yieldPercentage: number
  sortOrder: number
  ingredientId?: string
}

export interface RecipeHop {
  id: string
  name: string
  use: HopUse
  amount: number       // gramas
  alphaAcid: number    // %
  time: number         // minutos ou dias
  temperature?: number // °C para whirlpool/hopstand
  sortOrder: number
  ingredientId?: string
  // Calculado no frontend
  ibuContribution?: number
  gramsPerLiter?: number
}

export interface RecipeYeast {
  id: string
  name: string
  laboratory?: string
  form: YeastForm
  attenuation: number
  packages: number
  fermentationTemperature?: number
  starterVolume?: number
  ingredientId?: string
}

export interface RecipeMashStep {
  id: string
  name: string
  type: MashStepType
  temperature: number  // °C
  time: number         // minutos
  waterRatio?: number  // L/kg
  sortOrder: number
}

export interface RecipeMisc {
  id: string
  name: string
  use: MiscUse
  amount: number
  unit: string
  time?: number
  ingredientId?: string
}

export interface RecipeWater {
  mashWaterVolume: number
  spargeWaterVolume: number
  totalWaterVolume: number
  targetPh?: number
  estimatedPh?: number
  notes?: string
}

// ─── Receita ─────────────────────────────────────────────────────────────────
export interface Recipe {
  id: string
  name: string
  version: number
  type: RecipeType
  notes?: string
  isPublic: boolean
  batchVolume: number
  preBoilVolume: number
  boilTime: number
  efficiency: number
  targetOg?: number
  targetFg?: number
  targetAbv?: number
  targetIbu?: number
  targetEbc?: number
  styleGuideId?: string
  styleGuide?: StyleGuide
  equipmentProfileId?: string
  equipmentProfile?: EquipmentProfile
  fermentables: RecipeFermentable[]
  hops: RecipeHop[]
  yeasts: RecipeYeast[]
  mashSteps: RecipeMashStep[]
  miscs: RecipeMisc[]
  water?: RecipeWater
  createdAt: string
  updatedAt: string
}

// ─── Stats calculados (motor cervejeiro) ─────────────────────────────────────
export interface RecipeStats {
  og: number
  fg: number
  abv: number
  ibu: number
  ebc: number
  srm: number
  buGuRatio: number
  calories: number
  preBoilOg: number
  totalGrainWeight: number
  totalHopWeight: number
  fermentableContributions: Array<{ name: string; percentage: number; color: number }>
}

// ─── Validação ───────────────────────────────────────────────────────────────
export type ValidationSeverity = 'critical' | 'warning' | 'suggestion'
export interface RecipeValidation {
  severity: ValidationSeverity
  message: string
  field?: string
}
