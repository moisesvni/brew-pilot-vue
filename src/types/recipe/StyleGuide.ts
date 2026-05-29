export interface StyleGuide {
  id: string
  code: string
  categoryCode?: string
  category: string
  name: string
  ogMin: number; ogMax: number
  fgMin: number; fgMax: number
  abvMin: number; abvMax: number
  ibuMin: number; ibuMax: number
  srmMin?: number; srmMax?: number
  ebcMin: number; ebcMax: number
  notes?: string | null
  overallImpression?: string
  aroma?: string
  appearance?: string
  flavor?: string
  mouthfeel?: string
  comments?: string
  history?: string
  characteristicIngredients?: string
  styleComparison?: string
  commercialExamples?: string
  styleAttributes?: string
  source?: string
}
