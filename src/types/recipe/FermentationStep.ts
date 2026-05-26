export interface FermentationStep {
  id: string
  name: string
  temperature: number  // °C
  days: number
  sortOrder: number
}
