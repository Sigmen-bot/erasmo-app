// Ranking uczelni partnerskich dla kierunku i semestru studenta.
import { useEffect, useMemo } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import Banner from '../components/Banner'
import { ErrorNote, Spinner } from '../components/Feedback'
import faleDol from '../assets/Grafika3.svg'
import { rankUniversities } from '../lib/assignment'
import { countryName, flag, programmeLabel, TERM_LABEL, termOfSemester } from '../lib/format'
import { useStudentData } from '../lib/useStudentData'

export default function SearchResultsPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const programmeId = params.get('program')
  const semester = params.get('semestr')
  const country = params.get('kraj') || ''

  useEffect(() => {
    if (!programmeId || !semester) navigate('/')
  }, [programmeId, semester, navigate])

  const { loading, error, programme, plan, universities, matches } = useStudentData(programmeId, semester)

  const ranking = useMemo(() => {
    const filtered = country ? matches.filter((m) => m.partner_country_code === country) : matches
    return rankUniversities(plan, filtered, universities)
  }, [plan, matches, universities, country])

  const withoutSyllabus = plan.filter((c) => !c.has_syllabus).length
  const term = TERM_LABEL[termOfSemester(semester)]

  return (
    <div className="w-full flex flex-col font-sans bg-white min-h-screen">
      <div className="max-w-6xl mx-auto w-full px-4 md:px-12 py-12">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-purple-600 transition-colors mb-12">
          <span>←</span> Wróć do wyszukiwarki
        </Link>

        {loading ? (
          <Spinner text="Porównujemy Twój plan studiów z ofertą uczelni partnerskich..." />
        ) : error ? (
          <ErrorNote>{error}</ErrorNote>
        ) : (
          <div className="flex flex-col lg:flex-row gap-16 items-start">
            <div className="w-full lg:w-1/2 flex flex-col gap-6">
              <div className="flex flex-col gap-3 mb-2">
                <h1 className="text-3xl font-black text-[#a420eb] uppercase tracking-widest">Wyniki:</h1>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-purple-50 text-purple-700 px-3 py-1 rounded-md text-xs font-bold border border-purple-100 uppercase tracking-wider">
                    {programmeLabel(programme)}
                  </span>
                  <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-md text-xs font-bold border border-gray-200 uppercase tracking-wider">
                    Semestr {semester} · {term}
                  </span>
                  {country && (
                    <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-md text-xs font-bold border border-gray-200 uppercase tracking-wider">
                      {flag(country)} {countryName(country)}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Przedmiotów w Twoim planie: <b>{plan.length}</b>
                  {withoutSyllabus > 0 && <> (w tym {withoutSyllabus} bez sylabusa w naszej bazie)</>}. Pokazujemy tylko
                  przedmioty zagraniczne prowadzone w semestrze {term.replace('semestr ', '')}m.
                </p>
              </div>

              {ranking.length === 0 ? (
                <p className="text-gray-500 italic">
                  Nie znaleźliśmy jeszcze dopasowań dla tego semestru{country ? ' w wybranym kraju' : ''}. Baza
                  sylabusów stale rośnie – zajrzyj ponownie albo wybierz inny semestr.
                </p>
              ) : (
                ranking.map((u) => (
                  <Link
                    key={u.id}
                    to={`/sylabusy?${new URLSearchParams({ program: programmeId, semestr: semester, uczelnia: u.id })}`}
                    className="group bg-white border border-gray-100 shadow-sm rounded-2xl p-6 flex items-center justify-between gap-6 hover:shadow-md hover:border-purple-300 transition-all cursor-pointer"
                  >
                    <div className="flex flex-col gap-2 min-w-0">
                      <span className="font-bold text-gray-900 text-lg group-hover:text-purple-700 transition-colors">
                        {u.name}
                      </span>
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                        {flag(u.country_code)} {countryName(u.country_code)}
                        {u.city ? ` · ${u.city}` : ''}
                      </span>
                      <div className="flex flex-wrap gap-2 text-[11px] font-bold">
                        <span className="bg-gray-50 text-gray-600 px-2 py-0.5 rounded border border-gray-200">
                          {u.covered} z {u.matchable} przedmiotów ma odpowiednik
                        </span>
                        {u.strong > 0 && (
                          <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded border border-green-200">
                            {u.strong} mocne
                          </span>
                        )}
                        {u.approved > 0 && (
                          <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded border border-green-200">
                            {u.approved} zatwierdzone
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end shrink-0">
                      <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1">Dopasowanie</span>
                      <span className="text-3xl font-black text-[#a420eb]">{u.percent}%</span>
                    </div>
                  </Link>
                ))
              )}

              {ranking.length > 0 && (
                <p className="text-xs text-gray-400 leading-relaxed">
                  Dopasowanie to średnia ocena zgodności sylabusów dla przedmiotów Twojego semestru przy najlepszym
                  układzie (jeden przedmiot zagraniczny zastępuje jeden przedmiot UEK). Część par to propozycje AI,
                  które nie zostały jeszcze zatwierdzone przez koordynatora – ostateczną decyzję podejmuje uczelnia.
                </p>
              )}
            </div>

            <div className="w-full lg:w-1/2 lg:sticky lg:top-32">
              <Banner lines={['ZNAJDŹ', 'WYMARZONEGO', 'ERASMUSA']} image={faleDol} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
