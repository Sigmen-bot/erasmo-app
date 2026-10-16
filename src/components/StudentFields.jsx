// Pola formularza wspólne dla obu trybów: uczelnia macierzysta, kierunek, semestr.
import { useEffect, useState } from 'react'
import { fetchProgrammes, fetchUniversities } from '../lib/data'
import { programmeLabel, TERM_LABEL, termOfSemester } from '../lib/format'

export const selectClass =
  'w-full bg-white border border-gray-200 rounded-lg p-3.5 text-sm text-gray-800 outline-none focus:border-[#2470ff] transition-all disabled:text-gray-400'

/** Kierunki UEK i uczelnie partnerskie z bazy. */
export function useCatalog() {
  const [programmes, setProgrammes] = useState([])
  const [universities, setUniversities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    Promise.all([fetchProgrammes(), fetchUniversities()])
      .then(([p, u]) => {
        if (!active) return
        setProgrammes(p)
        setUniversities(u)
      })
      .catch((e) => active && setError(e.message))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [])

  return { programmes, universities, loading, error }
}

export function HomeFields({ programmes, loading, programmeId, setProgrammeId, semester, setSemester }) {
  const programme = programmes.find((p) => p.id === programmeId)
  const semesters = programme?.semesters || []

  return (
    <>
      <input
        type="text"
        value="Uniwersytet Ekonomiczny w Krakowie"
        disabled
        className="w-full bg-white border border-gray-200 rounded-lg p-3.5 text-sm text-gray-400 cursor-not-allowed outline-none"
      />
      <select
        value={programmeId}
        onChange={(e) => {
          setProgrammeId(e.target.value)
          setSemester('')
        }}
        disabled={loading}
        className={selectClass}
      >
        <option value="" disabled>{loading ? 'Wczytywanie kierunków…' : '-- Wybierz kierunek --'}</option>
        {programmes.map((p) => (
          <option key={p.id} value={p.id}>{programmeLabel(p)}</option>
        ))}
      </select>
      <select value={semester} onChange={(e) => setSemester(e.target.value)} disabled={!programmeId} className={selectClass}>
        <option value="" disabled>-- Wybierz semestr wyjazdu --</option>
        {semesters.map((s) => (
          <option key={s} value={s}>Semestr {s} ({TERM_LABEL[termOfSemester(s)]})</option>
        ))}
      </select>
    </>
  )
}
