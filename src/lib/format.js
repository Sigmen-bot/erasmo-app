// Etykiety i drobne formatowanie wspólne dla ekranów.

export const VERDICT = {
  strong: { label: 'Mocne dopasowanie', short: 'mocne', className: 'bg-green-50 text-green-700 border-green-200' },
  partial: { label: 'Częściowe dopasowanie', short: 'częściowe', className: 'bg-sky-50 text-sky-700 border-sky-200' },
}

export const STATUS = {
  approved: { label: 'Zatwierdzone przez koordynatora', className: 'bg-green-100 text-green-800 border-green-200' },
  proposed: { label: 'Propozycja AI – do potwierdzenia', className: 'bg-amber-50 text-amber-800 border-amber-200' },
}

export const TERM_LABEL = { winter: 'semestr zimowy', summer: 'semestr letni', both: 'oba semestry' }

const COUNTRY = {
  AT: 'Austria', BE: 'Belgia', CZ: 'Czechy', DE: 'Niemcy', DK: 'Dania', ES: 'Hiszpania', FI: 'Finlandia',
  FR: 'Francja', GR: 'Grecja', HR: 'Chorwacja', HU: 'Węgry', IE: 'Irlandia', IT: 'Włochy', LT: 'Litwa',
  LV: 'Łotwa', NL: 'Holandia', NO: 'Norwegia', PT: 'Portugalia', RO: 'Rumunia', SE: 'Szwecja', SI: 'Słowenia',
  SK: 'Słowacja', TR: 'Turcja', GB: 'Wielka Brytania', CH: 'Szwajcaria', EE: 'Estonia', BG: 'Bułgaria',
  CY: 'Cypr', MT: 'Malta', LU: 'Luksemburg', IS: 'Islandia',
}

const LANGUAGE = { en: 'angielski', es: 'hiszpański', fr: 'francuski', it: 'włoski', de: 'niemiecki', pt: 'portugalski', hr: 'chorwacki', el: 'grecki', pl: 'polski' }

export const countryName = (code) => COUNTRY[code] || code || ''
export const languageName = (code) => LANGUAGE[code] || code || ''

export function flag(code) {
  if (!code || !/^[A-Z]{2}$/.test(code)) return ''
  return String.fromCodePoint(...[...code].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65))
}

/** Semestr UEK → termin: nieparzysty = zimowy, parzysty = letni. */
export const termOfSemester = (semester) => (Number(semester) % 2 === 1 ? 'winter' : 'summer')

/** Czy przedmiot zagraniczny odbywa się w tym samym terminie co semestr studenta. */
export const termMatches = (partnerTerm, semester) =>
  partnerTerm === 'both' || partnerTerm === termOfSemester(semester)

export function programmeLabel(p) {
  if (!p) return ''
  const level = { I: 'I stopień', II: 'II stopień', JM: 'jednolite magisterskie' }[p.level] || p.level
  const extra = [level, p.study_mode, p.specialization].filter(Boolean).join(', ')
  return extra ? `${p.name} (${extra})` : p.name
}

export const ects = (value) => (value === null || value === undefined ? '–' : String(value).replace('.', ','))
