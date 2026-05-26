import type { ValidationSeverity } from './ValidationSeverity'

export interface RecipeValidation {
  severity: ValidationSeverity
  message: string
  field?: string
}
