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
