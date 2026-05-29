import bjcpData from '@/data/bjcp-styles.pt-BR.json'
import baData from '@/data/brewers-association-styles.pt-BR.json'
import type { StyleGuide } from '@/types/recipe'

/** SRM → EBC: EBC = SRM × 1.97 */
function srmToEbc(srm: number): number {
  return Math.round(srm * 1.97 * 10) / 10
}

type RawStyle = {
  categoryCode: string
  code: string
  name: string
  ogMin: number; ogMax: number
  fgMin: number; fgMax: number
  abvMin: number; abvMax: number
  ibuMin: number; ibuMax: number
  srmMin?: number; srmMax?: number
  ebcMin?: number; ebcMax?: number
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

function buildStyles(
  data: { categories: { code: string; name: string; source?: string }[]; styles: RawStyle[] },
  prefix: string
): StyleGuide[] {
  const catMap = new Map<string, { name: string; source?: string }>(
    data.categories.map(c => [c.code, { name: c.name, source: c.source }])
  )
  return (data.styles as RawStyle[]).map(s => {
    const nameSlug = s.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    const uniqueId = `${prefix}-${s.code.toLowerCase()}-${nameSlug}`
    return ({
    id: uniqueId,
    code: s.code,
    categoryCode: s.categoryCode,
    category: catMap.get(s.categoryCode)?.name ?? s.categoryCode,
    source: s.source ?? catMap.get(s.categoryCode)?.source,
    name: s.name,
    ogMin: s.ogMin,
    ogMax: s.ogMax,
    fgMin: s.fgMin,
    fgMax: s.fgMax,
    abvMin: s.abvMin,
    abvMax: s.abvMax,
    ibuMin: s.ibuMin,
    ibuMax: s.ibuMax,
    srmMin: s.srmMin,
    srmMax: s.srmMax,
    ebcMin: s.ebcMin ?? (s.srmMin != null ? srmToEbc(s.srmMin) : 0),
    ebcMax: s.ebcMax ?? (s.srmMax != null ? srmToEbc(s.srmMax) : 0),
    notes: s.notes,
    overallImpression: s.overallImpression,
    aroma: s.aroma,
    appearance: s.appearance,
    flavor: s.flavor,
    mouthfeel: s.mouthfeel,
    comments: s.comments,
    history: s.history,
    characteristicIngredients: s.characteristicIngredients,
    styleComparison: s.styleComparison,
    commercialExamples: s.commercialExamples,
    styleAttributes: s.styleAttributes,
  })})
}

const _bjcpStyles = buildStyles(
  bjcpData as { categories: { code: string; name: string; source?: string }[]; styles: RawStyle[] },
  'bjcp'
)
const _baStyles = buildStyles(
  baData as { categories: { code: string; name: string; source?: string }[]; styles: RawStyle[] },
  'ba'
)
const _allStyles: StyleGuide[] = [..._bjcpStyles, ..._baStyles]

export const stylesService = {
  getAll: (): StyleGuide[] => _allStyles,
  getByCode: (code: string): StyleGuide | undefined =>
    _allStyles.find(s => s.code.toLowerCase() === code.toLowerCase()),
  getByCategory: (categoryCode: string): StyleGuide[] =>
    _allStyles.filter(s => s.categoryCode === categoryCode),
}

