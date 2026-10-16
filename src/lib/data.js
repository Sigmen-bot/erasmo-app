// Zapytania do bazy Erasmo (tylko odczyt, przez widoki przygotowane dla aplikacji studenta:
// student_programmes, student_plan, student_universities, student_matches, public_stats).
import { supabase, configError } from './supabase'
import { termMatches } from './format'

function check(error) {
  if (error) throw new Error(error.message || 'Błąd połączenia z bazą')
}

function ensureClient() {
  if (configError) throw new Error(configError)
}

export async function fetchStats() {
  ensureClient()
  const { data, error } = await supabase.rpc('public_stats')
  check(error)
  return data || {}
}

export async function fetchProgrammes() {
  ensureClient()
  const { data, error } = await supabase.from('student_programmes').select('*').order('name')
  check(error)
  return data || []
}

export async function fetchUniversities() {
  ensureClient()
  const { data, error } = await supabase.from('student_universities').select('*').order('name')
  check(error)
  return data || []
}

/** Przedmioty z planu kierunku w danym semestrze. */
export async function fetchPlan(programmeId, semester) {
  ensureClient()
  const { data, error } = await supabase
    .from('student_plan')
    .select('*')
    .eq('programme_id', programmeId)
    .eq('semester', semester)
    .order('name')
  check(error)
  return data || []
}

/**
 * Dopasowania dla przedmiotów z planu – tylko przedmioty zagraniczne z tego samego terminu
 * (zimowy / letni) co semestr studenta. Opcjonalnie zawężone do jednej uczelni.
 */
export async function fetchMatches(courseIds, semester, universityId = null) {
  ensureClient()
  if (!courseIds.length) return []
  const PAGE = 1000
  const rows = []
  for (let from = 0; ; from += PAGE) {
    let query = supabase
      .from('student_matches')
      .select('*')
      .in('home_course_id', courseIds)
      .order('match_id')
      .range(from, from + PAGE - 1)
    if (universityId) query = query.eq('partner_university_id', universityId)
    const { data, error } = await query
    check(error)
    rows.push(...(data || []))
    if (!data || data.length < PAGE) break
  }
  return rows.filter((m) => termMatches(m.partner_term, semester))
}
