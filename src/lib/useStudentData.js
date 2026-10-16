// Wczytuje wszystko, czego potrzebują ekrany wyników: kierunek, plan semestru, uczelnie i dopasowania.
import { useEffect, useState } from 'react'
import { fetchMatches, fetchPlan, fetchProgrammes, fetchUniversities } from './data'

export function useStudentData(programmeId, semester, universityId = null) {
  const [state, setState] = useState({ loading: true, error: '', programme: null, plan: [], universities: [], matches: [] })

  useEffect(() => {
    if (!programmeId || !semester) return
    let active = true
    setState((s) => ({ ...s, loading: true, error: '' }))
    ;(async () => {
      try {
        const [programmes, universities, plan] = await Promise.all([
          fetchProgrammes(),
          fetchUniversities(),
          fetchPlan(programmeId, semester),
        ])
        const matches = await fetchMatches(plan.map((c) => c.course_id), semester, universityId)
        if (!active) return
        setState({
          loading: false,
          error: '',
          programme: programmes.find((p) => p.id === programmeId) || null,
          plan,
          universities,
          matches,
        })
      } catch (e) {
        if (active) setState((s) => ({ ...s, loading: false, error: e.message }))
      }
    })()
    return () => {
      active = false
    }
  }, [programmeId, semester, universityId])

  return state
}
