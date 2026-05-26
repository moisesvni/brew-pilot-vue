/**
 * Converte um valor EBC para uma cor hex representativa da cerveja.
 */
export function ebcToHex(ebc: number): string {
  const s = ebc / 1.97
  if (s <= 2) return '#F5F04B'
  if (s <= 4) return '#E3D73A'
  if (s <= 6) return '#CDB832'
  if (s <= 8) return '#B79928'
  if (s <= 10) return '#9F7A20'
  if (s <= 14) return '#8A5C18'
  if (s <= 18) return '#7A4A14'
  if (s <= 22) return '#6A3810'
  if (s <= 28) return '#572C0C'
  if (s <= 35) return '#3E1C07'
  return '#180C04'
}
