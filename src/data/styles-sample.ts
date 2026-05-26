import type { StyleGuide } from '../types/recipe'

export const sampleStyles: StyleGuide[] = [
  {
    id: 'bjcp-21a',
    code: '21A',
    category: 'IPA',
    name: 'American IPA',
    ogMin: 1.056, ogMax: 1.070,
    fgMin: 1.008, fgMax: 1.014,
    abvMin: 5.5,  abvMax: 7.5,
    ibuMin: 40,   ibuMax: 70,
    ebcMin: 6,    ebcMax: 14,
    notes: 'Resina e aroma de frutas tropicais com lúpulo americano.'
  },
  {
    id: 'bjcp-5d',
    code: '5D',
    category: 'Pale Malty European Lager',
    name: 'German Pils',
    ogMin: 1.044, ogMax: 1.050,
    fgMin: 1.008, fgMax: 1.013,
    abvMin: 4.4,  abvMax: 5.2,
    ibuMin: 22,   ibuMax: 40,
    ebcMin: 4,    ebcMax: 8,
    notes: 'Lager alemã clara, seca, com amargor de lúpulo nobre e malte pilsner.'
  }
]
