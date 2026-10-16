// Przypisanie 1:1 przedmiotów UEK do przedmiotów zagranicznych.
//
// Jeden przedmiot zagraniczny może zastąpić najwyżej jeden przedmiot UEK (tak jak w Learning
// Agreement), a my szukamy układu z największą sumą wyników dla całego semestru. Przedmiot UEK
// może zostać bez odpowiednika, jeśli to daje lepszy wynik całości.
//
// Algorytm węgierski (O(n²·m)) – dokładny i szybki także przy kilkunastu przedmiotach,
// w przeciwieństwie do przeszukiwania z nawrotami, które rośnie wykładniczo.

/**
 * @param {number[][]} scores  macierz wyników [wiersz = przedmiot UEK][kolumna = przedmiot zagraniczny],
 *                             0 = brak dopasowania
 * @returns {number[]} dla każdego wiersza indeks kolumny albo -1 (bez odpowiednika)
 */
export function maxWeightAssignment(scores) {
  const n = scores.length
  if (n === 0) return []
  const m = Math.max(0, ...scores.map((row) => row.length))
  if (m === 0) return new Array(n).fill(-1)

  // Kolumny-zaślepki (po jednej na wiersz) z kosztem 0 = „bez odpowiednika”.
  // Koszt prawdziwej pary = −wynik, więc minimalny koszt = maksymalna suma wyników.
  const cols = m + n
  const cost = (i, j) => (j < m ? -(scores[i][j] || 0) : 0)

  // Klasyczna implementacja (indeksy od 1), wymaga n ≤ cols – spełnione.
  const INF = Number.POSITIVE_INFINITY
  const u = new Array(n + 1).fill(0)
  const v = new Array(cols + 1).fill(0)
  const p = new Array(cols + 1).fill(0) // p[j] = wiersz przypisany do kolumny j
  const way = new Array(cols + 1).fill(0)

  for (let i = 1; i <= n; i++) {
    p[0] = i
    let j0 = 0
    const minv = new Array(cols + 1).fill(INF)
    const used = new Array(cols + 1).fill(false)
    do {
      used[j0] = true
      const i0 = p[j0]
      let delta = INF
      let j1 = 0
      for (let j = 1; j <= cols; j++) {
        if (used[j]) continue
        const cur = cost(i0 - 1, j - 1) - u[i0] - v[j]
        if (cur < minv[j]) {
          minv[j] = cur
          way[j] = j0
        }
        if (minv[j] < delta) {
          delta = minv[j]
          j1 = j
        }
      }
      for (let j = 0; j <= cols; j++) {
        if (used[j]) {
          u[p[j]] += delta
          v[j] -= delta
        } else {
          minv[j] -= delta
        }
      }
      j0 = j1
    } while (p[j0] !== 0)
    do {
      const j1 = way[j0]
      p[j0] = p[j1]
      j0 = j1
    } while (j0)
  }

  const result = new Array(n).fill(-1)
  for (let j = 1; j <= m; j++) {
    const i = p[j]
    if (i > 0 && (scores[i - 1][j - 1] || 0) > 0) result[i - 1] = j - 1
  }
  return result
}

/**
 * Wynik dla jednej uczelni: najlepszy układ przedmiotów + alternatywy.
 *
 * @param {Array} plan     przedmioty z planu: { course_id, name, ects, has_syllabus, ... }
 * @param {Array} matches  widoczne dopasowania tej uczelni (wiersze student_matches)
 */
export function buildAgreement(plan, matches) {
  const partnerIds = [...new Set(matches.map((m) => m.partner_course_id))]
  const colOf = new Map(partnerIds.map((id, i) => [id, i]))
  const byHome = new Map()
  for (const m of matches) {
    if (!byHome.has(m.home_course_id)) byHome.set(m.home_course_id, [])
    byHome.get(m.home_course_id).push(m)
  }

  const scores = plan.map((course) => {
    const row = new Array(partnerIds.length).fill(0)
    for (const m of byHome.get(course.course_id) || []) {
      const j = colOf.get(m.partner_course_id)
      row[j] = Math.max(row[j], Number(m.score) || 0)
    }
    return row
  })
  const chosen = maxWeightAssignment(scores)

  const rows = plan.map((course, i) => {
    const options = (byHome.get(course.course_id) || [])
      .slice()
      .sort((a, b) => Number(b.score) - Number(a.score))
    const pickedCol = chosen[i]
    const match = pickedCol >= 0
      ? options.find((m) => colOf.get(m.partner_course_id) === pickedCol) || null
      : null
    return {
      course,
      match,
      alternatives: options.filter((m) => m !== match),
      // dlaczego brak: przedmiot bez sylabusa w bazie / są opcje, ale zajęte przez inne przedmioty / brak opcji
      reason: match ? null : !course.has_syllabus ? 'no_syllabus' : options.length ? 'taken' : 'no_match',
    }
  })

  const matchable = rows.filter((r) => r.course.has_syllabus)
  const covered = rows.filter((r) => r.match)
  const sum = covered.reduce((s, r) => s + (Number(r.match.score) || 0), 0)
  const ectsHome = covered.reduce((s, r) => s + (Number(r.course.ects) || 0), 0)
  const ectsPartner = covered.reduce((s, r) => s + (Number(r.match.partner_ects) || 0), 0)

  // Kolejność: dopasowane (od najlepszych), potem bez odpowiednika, na końcu bez sylabusa
  const order = { null: 0, taken: 1, no_match: 1, no_syllabus: 2 }
  rows.sort((a, b) => {
    const d = order[a.reason] - order[b.reason]
    if (d) return d
    return (Number(b.match?.score) || 0) - (Number(a.match?.score) || 0)
  })

  return {
    rows,
    covered: covered.length,
    matchable: matchable.length,
    total: rows.length,
    approved: covered.filter((r) => r.match.status === 'approved').length,
    strong: covered.filter((r) => r.match.verdict === 'strong').length,
    // średnia po przedmiotach, które dało się dopasować (brak odpowiednika liczy się jako 0)
    percent: matchable.length ? Math.round(sum / matchable.length) : 0,
    ectsHome,
    ectsPartner,
  }
}

/** Ranking uczelni dla planu semestru. Zwraca uczelnie z co najmniej jednym dopasowanym przedmiotem. */
export function rankUniversities(plan, matches, universities) {
  const byUni = new Map()
  for (const m of matches) {
    if (!byUni.has(m.partner_university_id)) byUni.set(m.partner_university_id, [])
    byUni.get(m.partner_university_id).push(m)
  }
  const ranking = []
  for (const [uniId, uniMatches] of byUni) {
    const agreement = buildAgreement(plan, uniMatches)
    if (!agreement.covered) continue
    const first = uniMatches[0]
    const info = universities.find((u) => u.id === uniId) || {}
    ranking.push({
      id: uniId,
      name: info.name || first.partner_university_name,
      country_code: info.country_code || first.partner_country_code,
      city: info.city || first.partner_city,
      ...agreement,
    })
  }
  return ranking.sort((a, b) => b.percent - a.percent || b.covered - a.covered || a.name.localeCompare(b.name))
}
