/**
 * Motor de cálculos cervejeiros
 * Fórmulas usadas: Tinseth (IBU), Morey (EBC/SRM), e padrão HBD
 */
import type { Recipe, RecipeStats } from '../types/recipe.types'
import bjcpRefs from '../assets/bjcp-references.json'

// ─── Tipos de referência BJCP ─────────────────────────────────────────────────
export interface SrmColor {
  srmMin: number
  srmMax: number
  name: string
  hex: string
}

export interface StyleTagInfo {
  label: string
  category: 'strength' | 'color' | 'fermentation' | 'region' | 'family' | 'era' | 'flavor'
  meaning: string
  descriptionPt: string
  abvMin?: number
  abvMax?: number
  srmMin?: number
  srmMax?: number
}

export interface ParsedStyleTag extends StyleTagInfo {
  key: string
}

// ─── SRM → Cor ────────────────────────────────────────────────────────────────
/**
 * Retorna o nome e hex da cor para um valor SRM.
 * Exemplo: srmToColor(8) → { name: 'Âmbar', hex: '#BF7A15', ... }
 */
export function srmToColor (srm: number): SrmColor {
  const colors = bjcpRefs.srmColors as SrmColor[]
  const match = colors.find(c => srm >= c.srmMin && srm <= c.srmMax)
  return match ?? colors[colors.length - 1]!
}

/**
 * Retorna o hex diretamente para uso inline em estilos.
 */
export function srmToHex (srm: number): string {
  return srmToColor(srm).hex
}

// ─── Style Attribute Tags ─────────────────────────────────────────────────────
const tagMap = bjcpRefs.styleAttributeTags as Record<string, StyleTagInfo>

/**
 * Converte a string de atributos do BJCP em objetos tipados.
 * Exemplo: parseStyleTags("malty, bottom-fermented, north-america, pale-color")
 */
export function parseStyleTags (styleAttributes: string | null | undefined): ParsedStyleTag[] {
  if (!styleAttributes) return []
  return styleAttributes
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
    .map(key => {
      const info = tagMap[key]
      return info ? { key, ...info } : { key, label: key, category: 'flavor' as const }
    })
}

/**
 * Filtra tags por categoria.
 * Exemplo: filterTags(tags, 'flavor') → só os tags de sabor dominante
 */
export function filterTags (tags: ParsedStyleTag[], category: StyleTagInfo['category']): ParsedStyleTag[] {
  return tags.filter(t => t.category === category)
}

/**
 * Verifica se um estilo (OG/FG/ABV) está dentro das faixas definidas pelas tags de força.
 * Útil para sugerir estilo ou validar receita.
 */
export function abvMatchesStrength (abv: number, styleAttributes: string): boolean {
  const strengthTags = parseStyleTags(styleAttributes).filter(t => t.category === 'strength')
  if (!strengthTags.length) return true
  return strengthTags.some(t => {
    const min = t.abvMin ?? 0
    const max = t.abvMax ?? 100
    return abv >= min && abv <= max
  })
}

// ─── OG ─────────────────────────────────────────────────────────────────────
/**
 * Calcula a Original Gravity (OG) usando pontos de extrato.
 * Formula: OG = Σ(amount_kg × yield% × potential_ppg) / batchVolume_L × efficiency
 */
export function calculateOg (recipe: Pick<Recipe, 'fermentables' | 'batchVolume' | 'efficiency'>): number {
  if (!recipe.fermentables.length || !recipe.batchVolume) return 1.000

  const gallons = recipe.batchVolume * 0.264172

  const points = recipe.fermentables.reduce((sum, f) => {
    // potential em PPG (pounds per gallon), yield em 0-100
    const ppg = f.potential > 1 ? f.potential : f.potential * 46  // aceita PPG direto ou HWE
    const amountLbs = f.amount * 2.20462
    return sum + (amountLbs * ppg * (f.yieldPercentage / 100))
  }, 0)

  const og = 1 + ((points * (recipe.efficiency / 100)) / gallons) / 1000
  return parseFloat(og.toFixed(4))
}

// ─── FG ─────────────────────────────────────────────────────────────────────
export function calculateFg (og: number, attenuation: number): number {
  const fg = og - ((og - 1.000) * (attenuation / 100))
  return parseFloat(fg.toFixed(4))
}

// ─── ABV ─────────────────────────────────────────────────────────────────────
export function calculateAbv (og: number, fg: number): number {
  return parseFloat(((og - fg) * 131.25).toFixed(2))
}

// ─── IBU (Tinseth) ──────────────────────────────────────────────────────────
export function calculateIbuTinseth (
  amount: number,     // gramas
  alphaAcid: number,  // % (ex: 10 para 10%)
  time: number,       // minutos
  og: number,         // OG do mosto na fervura
  batchVolume: number // litros
): number {
  if (time <= 0 || ['DryHop'].includes('')) return 0

  const bignessFactor = 1.65 * Math.pow(0.000125, og - 1)
  const boilTimeFactor = (1 - Math.exp(-0.04 * time)) / 4.15
  const utilization = bignessFactor * boilTimeFactor
  const ibu = (alphaAcid / 100 * amount * utilization * 1000) / batchVolume

  return parseFloat(ibu.toFixed(1))
}

// Whirlpool / Hopstand (utilização reduzida por temperatura)
export function calculateIbuWhirlpool (
  amount: number,
  alphaAcid: number,
  time: number,       // minutos de hopstand
  temperature: number, // °C
  batchVolume: number
): number {
  // Fator de temperatura: acima de 79°C tem isomerização significativa
  let tempFactor = 0
  if (temperature >= 100) tempFactor = 0.21
  else if (temperature >= 90) tempFactor = 0.15
  else if (temperature >= 80) tempFactor = 0.09
  else if (temperature >= 70) tempFactor = 0.03

  const ibu = (alphaAcid / 100 * amount * tempFactor * (time / 60) * 1000) / batchVolume
  return parseFloat(ibu.toFixed(1))
}

// ─── EBC / SRM (Fórmula de Morey) ───────────────────────────────────────────
export function calculateEbc (
  fermentables: Array<{ amount: number; colorEbc: number }>,
  batchVolume: number
): number {
  if (!fermentables.length || !batchVolume) return 0

  const mcu = fermentables.reduce((sum, f) => {
    const lbs = f.amount * 2.20462
    const srm = f.colorEbc / 1.97  // EBC → SRM
    const gallons = batchVolume * 0.264172
    return sum + (lbs * srm / gallons)
  }, 0)

  const srm = 1.4922 * Math.pow(mcu, 0.6859)
  const ebc = srm * 1.97
  return parseFloat(ebc.toFixed(1))
}

export function ebcToSrm (ebc: number): number {
  return parseFloat((ebc / 1.97).toFixed(1))
}

// ─── BU:GU Ratio ─────────────────────────────────────────────────────────────
export function calculateBuGu (ibu: number, og: number): number {
  const gu = (og - 1) * 1000
  if (!gu) return 0
  return parseFloat((ibu / gu).toFixed(2))
}

// ─── Calorias estimadas ──────────────────────────────────────────────────────
export function calculateCalories (og: number, fg: number, servingMl = 355): number {
  const servingOz = servingMl / 29.5735
  const abv = calculateAbv(og, fg)
  const realExtract = (0.1808 * og + 0.8192 * fg - 1.0) * 1000
  const calories = servingOz * ((6.9 * abv) + 4.0 * (realExtract - 0.1))
  return Math.round(calories)
}

// ─── IBU total da receita ─────────────────────────────────────────────────────
import type { RecipeHop } from '../types/recipe.types'

export function totalIbu (hops: RecipeHop[], og: number, batchVolume: number): number {
  return hops.reduce((sum, hop) => {
    if (hop.use === 'DryHop') return sum
    if (hop.use === 'Boil' || hop.use === 'FirstWort') {
      return sum + calculateIbuTinseth(hop.amount, hop.alphaAcid, hop.time, og, batchVolume)
    }
    if (hop.use === 'Whirlpool' || hop.use === 'Hopstand') {
      return sum + calculateIbuWhirlpool(hop.amount, hop.alphaAcid, hop.time, hop.temperature ?? 85, batchVolume)
    }
    return sum
  }, 0)
}

// ─── Cálculo completo da receita ─────────────────────────────────────────────
export function calculateRecipeStats (recipe: Recipe): RecipeStats {
  const og = calculateOg(recipe)
  const attenuation = recipe.yeasts[0]?.attenuation ?? 75
  const fg = calculateFg(og, attenuation)
  const abv = calculateAbv(og, fg)
  const ebc = calculateEbc(recipe.fermentables, recipe.batchVolume)
  const srm = ebcToSrm(ebc)
  const ibu = totalIbu(recipe.hops, og, recipe.batchVolume)
  const buGu = calculateBuGu(ibu, og)
  const calories = calculateCalories(og, fg)

  const totalGrainWeight = recipe.fermentables.reduce((s, f) => s + f.amount, 0)
  const totalHopWeight = recipe.hops.reduce((s, h) => s + h.amount, 0)

  const fermentableContributions = recipe.fermentables.map(f => ({
    name: f.name,
    percentage: totalGrainWeight ? parseFloat(((f.amount / totalGrainWeight) * 100).toFixed(1)) : 0,
    color: f.colorEbc
  }))

  const preBoilPoints = (og - 1) * 1000 * recipe.batchVolume
  const preBoilOg = recipe.preBoilVolume
    ? parseFloat((1 + preBoilPoints / recipe.preBoilVolume / 1000).toFixed(4))
    : og

  return { og, fg, abv, ibu, ebc, srm, buGuRatio: buGu, calories, preBoilOg, totalGrainWeight, totalHopWeight, fermentableContributions }
}
