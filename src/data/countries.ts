/**
 * Lista de países — ISO 3166-1 alpha-2
 * code: sigla padrão internacional
 * label: nome em português
 */
export interface Country {
  code: string
  label: string
  emoji?: string
}

export const COUNTRIES: Country[] = [
  { code: 'BR', label: 'Brasil',               emoji: '🇧🇷' },
  { code: 'US', label: 'Estados Unidos',        emoji: '🇺🇸' },
  { code: 'DE', label: 'Alemanha',              emoji: '🇩🇪' },
  { code: 'AR', label: 'Argentina',             emoji: '🇦🇷' },
  { code: 'AU', label: 'Austrália',             emoji: '🇦🇺' },
  { code: 'AT', label: 'Áustria',               emoji: '🇦🇹' },
  { code: 'BE', label: 'Bélgica',               emoji: '🇧🇪' },
  { code: 'BO', label: 'Bolívia',               emoji: '🇧🇴' },
  { code: 'CA', label: 'Canadá',                emoji: '🇨🇦' },
  { code: 'CL', label: 'Chile',                 emoji: '🇨🇱' },
  { code: 'CN', label: 'China',                 emoji: '🇨🇳' },
  { code: 'CO', label: 'Colômbia',              emoji: '🇨🇴' },
  { code: 'KR', label: 'Coreia do Sul',         emoji: '🇰🇷' },
  { code: 'CR', label: 'Costa Rica',            emoji: '🇨🇷' },
  { code: 'HR', label: 'Croácia',               emoji: '🇭🇷' },
  { code: 'CZ', label: 'República Tcheca',      emoji: '🇨🇿' },
  { code: 'DK', label: 'Dinamarca',             emoji: '🇩🇰' },
  { code: 'EC', label: 'Equador',               emoji: '🇪🇨' },
  { code: 'EG', label: 'Egito',                 emoji: '🇪🇬' },
  { code: 'ES', label: 'Espanha',               emoji: '🇪🇸' },
  { code: 'FI', label: 'Finlândia',             emoji: '🇫🇮' },
  { code: 'FR', label: 'França',                emoji: '🇫🇷' },
  { code: 'GB', label: 'Reino Unido',           emoji: '🇬🇧' },
  { code: 'GR', label: 'Grécia',                emoji: '🇬🇷' },
  { code: 'GT', label: 'Guatemala',             emoji: '🇬🇹' },
  { code: 'HN', label: 'Honduras',              emoji: '🇭🇳' },
  { code: 'HU', label: 'Hungria',               emoji: '🇭🇺' },
  { code: 'IN', label: 'Índia',                 emoji: '🇮🇳' },
  { code: 'IE', label: 'Irlanda',               emoji: '🇮🇪' },
  { code: 'IL', label: 'Israel',                emoji: '🇮🇱' },
  { code: 'IT', label: 'Itália',                emoji: '🇮🇹' },
  { code: 'JP', label: 'Japão',                 emoji: '🇯🇵' },
  { code: 'MX', label: 'México',                emoji: '🇲🇽' },
  { code: 'NI', label: 'Nicarágua',             emoji: '🇳🇮' },
  { code: 'NO', label: 'Noruega',               emoji: '🇳🇴' },
  { code: 'NZ', label: 'Nova Zelândia',         emoji: '🇳🇿' },
  { code: 'PA', label: 'Panamá',                emoji: '🇵🇦' },
  { code: 'PY', label: 'Paraguai',              emoji: '🇵🇾' },
  { code: 'PE', label: 'Peru',                  emoji: '🇵🇪' },
  { code: 'PL', label: 'Polônia',               emoji: '🇵🇱' },
  { code: 'PT', label: 'Portugal',              emoji: '🇵🇹' },
  { code: 'RO', label: 'Romênia',               emoji: '🇷🇴' },
  { code: 'RU', label: 'Rússia',                emoji: '🇷🇺' },
  { code: 'SV', label: 'El Salvador',           emoji: '🇸🇻' },
  { code: 'SE', label: 'Suécia',                emoji: '🇸🇪' },
  { code: 'CH', label: 'Suíça',                 emoji: '🇨🇭' },
  { code: 'TH', label: 'Tailândia',             emoji: '🇹🇭' },
  { code: 'TW', label: 'Taiwan',                emoji: '🇹🇼' },
  { code: 'TR', label: 'Turquia',               emoji: '🇹🇷' },
  { code: 'UA', label: 'Ucrânia',               emoji: '🇺🇦' },
  { code: 'UY', label: 'Uruguai',               emoji: '🇺🇾' },
  { code: 'VE', label: 'Venezuela',             emoji: '🇻🇪' },
  { code: 'ZA', label: 'África do Sul',         emoji: '🇿🇦' },
]

/** Retorna o label (nome) de um código ISO. */
export function getCountryLabel(code: string): string {
  return COUNTRIES.find(c => c.code === code)?.label ?? code
}

/** Opções formatadas para q-select / q-autocomplete do Quasar. */
export const COUNTRY_OPTIONS = COUNTRIES.map(c => ({
  value: c.code,
  label: `${c.emoji ?? ''} ${c.label}`.trim(),
}))
