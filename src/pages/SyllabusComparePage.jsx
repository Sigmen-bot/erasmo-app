// Learning Agreement dla wybranej uczelni: przedmiot z planu UEK ↔ najlepszy przedmiot zagraniczny.
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ErrorNote, Spinner } from '../components/Feedback'
import { buildAgreement } from '../lib/assignment'
import { countryName, ects, flag, programmeLabel, STATUS, TERM_LABEL, termOfSemester, VERDICT } from '../lib/format'
import { useStudentData } from '../lib/useStudentData'

function Badge({ className, children }) {
  return (
    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold border uppercase tracking-wider ${className}`}>
      {children}
    </span>
  )
}

function MatchDetails({ match, alternatives, usedElsewhere }) {
  const matched = Array.isArray(match?.matched) ? match.matched : []
  const missing = Array.isArray(match?.missing) ? match.missing : []
  return (
    <div className="flex flex-col gap-4 pt-3 border-t border-gray-100 text-xs text-gray-600">
      {matched.length > 0 && (
        <div>
          <p className="font-bold text-gray-700 mb-2 uppercase tracking-wider text-[10px]">Co się pokrywa</p>
          <ul className="flex flex-col gap-1.5">
            {matched.map((p, i) => (
              <li key={i} className="grid grid-cols-1 md:grid-cols-2 gap-1 md:gap-4">
                <span>{p.home}</span>
                <span className="text-[#a420eb]">{p.foreign}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {missing.length > 0 && (
        <div>
          <p className="font-bold text-gray-700 mb-1 uppercase tracking-wider text-[10px]">Czego brakuje w przedmiocie zagranicznym</p>
          <p>{missing.join(' · ')}</p>
        </div>
      )}
      {match?.partner_syllabus_url && (
        <a
          href={match.partner_syllabus_url}
          target="_blank"
          rel="noreferrer"
          className="w-max font-bold text-[#2470ff] hover:underline underline-offset-4"
        >
          Sylabus przedmiotu zagranicznego ↗
        </a>
      )}
      {alternatives.length > 0 && (
        <div>
          <p className="font-bold text-gray-700 mb-2 uppercase tracking-wider text-[10px]">Inne możliwości na tej uczelni</p>
          <ul className="flex flex-col gap-1.5">
            {alternatives.map((alt) => (
              <li key={alt.match_id} className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-gray-800">{alt.partner_course_name}</span>
                <span className="text-gray-400">{ects(alt.partner_ects)} ECTS</span>
                <span className="font-black text-[#a420eb]">{Math.round(alt.score)}%</span>
                {usedElsewhere.has(alt.partner_course_id) && (
                  <span className="text-gray-400 italic">– wykorzystany przy innym przedmiocie</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function AgreementRow({ row, usedElsewhere, term, locked }) {
  const [open, setOpen] = useState(false)
  const { course, match, alternatives, reason } = row

  if (!match) {
    const info = {
      no_syllabus: 'Ten przedmiot nie ma jeszcze sylabusa w naszej bazie, więc nie mogliśmy go porównać.',
      taken: 'Pasujące przedmioty tej uczelni lepiej zastępują inne przedmioty z Twojego planu – każdy przedmiot zagraniczny można wykorzystać tylko raz.',
      no_match: `Na tej uczelni nie znaleźliśmy odpowiednika wśród przedmiotów prowadzonych w semestrze ${term.replace('semestr ', '')}m.`,
    }[reason]
    return (
      <div className={`bg-white p-5 rounded-xl border border-red-100 shadow-sm flex flex-col gap-4 transition-all duration-500 ${locked ? 'blur-[6px] opacity-40 select-none pointer-events-none' : ''}`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex flex-col gap-1 flex-1">
            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Wymóg (UEK) · {ects(course.ects)} ECTS</span>
            <span className="text-gray-700 font-bold uppercase">{course.name}</span>
          </div>
          <div className="text-red-200 font-black hidden md:block">→</div>
          <div className="flex flex-col gap-1 flex-1">
            <span className="text-[10px] text-red-400 uppercase tracking-wider font-bold">Propozycja (Zagranica)</span>
            <span className="text-red-600 font-bold uppercase">{reason === 'no_syllabus' ? 'Brak sylabusa w bazie' : 'Brak odpowiednika'}</span>
          </div>
          <div className="flex flex-col items-center justify-center bg-white px-4 py-3 rounded-lg border border-red-200 w-full md:w-auto shrink-0 shadow-sm">
            <span className="text-2xl font-black text-red-500">⚠</span>
            <span className="text-[10px] text-red-500 uppercase tracking-widest font-bold">Brak</span>
          </div>
        </div>
        <div className="pt-3 border-t border-red-100 flex flex-col gap-3">
          <p className="text-xs text-gray-600 italic leading-relaxed">
            <span className="font-bold text-red-500 not-italic">Informacja: </span>
            {info}
          </p>
          {alternatives.length > 0 && (
            <MatchDetails match={null} alternatives={alternatives} usedElsewhere={usedElsewhere} />
          )}
        </div>
      </div>
    )
  }

  const verdict = VERDICT[match.verdict]
  const status = STATUS[match.status] || STATUS.proposed
  return (
    <div className={`bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-4 transition-all duration-500 ${locked ? 'blur-[6px] opacity-40 select-none pointer-events-none' : 'hover:border-purple-300'}`}>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex flex-col gap-1 flex-1">
          <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Wymóg (UEK) · {ects(course.ects)} ECTS</span>
          <span className="text-gray-900 font-bold uppercase">{course.name}</span>
        </div>
        <div className="text-gray-300 font-black hidden md:block">→</div>
        <div className="flex flex-col gap-1 flex-1">
          <span className="text-[10px] text-[#2470ff] uppercase tracking-wider font-bold">
            Propozycja (Zagranica) · {ects(match.partner_ects)} ECTS · {TERM_LABEL[match.partner_term] || ''}
          </span>
          <span className="text-[#a420eb] font-bold uppercase">{match.partner_course_name}</span>
        </div>
        <div className="flex flex-col items-center justify-center bg-gray-50 px-4 py-3 rounded-lg border border-gray-200 w-full md:w-auto shrink-0 shadow-sm">
          <span className={`text-2xl font-black ${match.verdict === 'strong' ? 'text-green-600' : 'text-sky-600'}`}>
            {Math.round(match.score)}%
          </span>
          <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Zgodność</span>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {verdict && <Badge className={verdict.className}>{verdict.label}</Badge>}
        <Badge className={status.className}>{status.label}</Badge>
      </div>
      <div className="pt-3 border-t border-gray-100 flex flex-col gap-3">
        {match.rationale && (
          <p className="text-xs text-gray-500 italic leading-relaxed">
            <span className="font-bold text-gray-700 not-italic">Uzasadnienie AI: </span>
            {match.rationale}
          </p>
        )}
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="w-max text-xs font-bold text-gray-500 hover:text-purple-600 uppercase tracking-wider"
        >
          {open ? '▴ Zwiń szczegóły' : '▾ Szczegóły i inne możliwości'}
        </button>
        {open && <MatchDetails match={match} alternatives={alternatives} usedElsewhere={usedElsewhere} />}
      </div>
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-2xl font-black text-[#a420eb]">{value}</span>
      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</span>
    </div>
  )
}

export default function SyllabusComparePage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const programmeId = params.get('program')
  const semester = params.get('semestr')
  const universityId = params.get('uczelnia')

  // Paywall pod prezentację (DEMO) – bez prawdziwej płatności
  const [isPremium, setIsPremium] = useState(false)

  useEffect(() => {
    if (!programmeId || !semester || !universityId) navigate('/')
  }, [programmeId, semester, universityId, navigate])

  const { loading, error, programme, plan, universities, matches } = useStudentData(programmeId, semester, universityId)
  const university = universities.find((u) => u.id === universityId)
  const agreement = useMemo(() => buildAgreement(plan, matches), [plan, matches])
  const usedElsewhere = useMemo(
    () => new Set(agreement.rows.filter((r) => r.match).map((r) => r.match.partner_course_id)),
    [agreement],
  )
  const term = TERM_LABEL[termOfSemester(semester)]

  return (
    <div className="w-full px-4 md:px-12 py-10 flex flex-col gap-8 relative font-sans bg-white min-h-screen">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-purple-600 transition-colors w-max"
      >
        <span>←</span> Wróć
      </button>

      <div className="max-w-5xl mx-auto w-full space-y-8 mt-4">
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex flex-col gap-3">
            <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-4">
              Twój Learning Agreement
              {isPremium && (
                <span className="bg-gradient-to-r from-amber-200 to-yellow-400 text-yellow-900 text-[10px] uppercase tracking-widest px-3 py-1 rounded-full shadow-sm">
                  PRO
                </span>
              )}
            </h1>
            <div className="flex flex-wrap gap-2">
              <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-md text-xs font-bold border border-gray-200 uppercase tracking-wider">UEK</span>
              <span className="bg-purple-50 text-purple-700 px-3 py-1 rounded-md text-xs font-bold border border-purple-100 uppercase tracking-wider">
                {programmeLabel(programme)} · Sem. {semester} ({term})
              </span>
            </div>
          </div>
          <div className="flex flex-col items-start md:items-end gap-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Uczelnia Docelowa</span>
            <span className="text-xl font-black text-[#2470ff]">{university?.name || '…'}</span>
            {university && (
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                {flag(university.country_code)} {countryName(university.country_code)}
                {university.city ? ` · ${university.city}` : ''}
              </span>
            )}
            {university?.website && (
              <a href={university.website} target="_blank" rel="noreferrer" className="text-xs font-bold text-[#a420eb] hover:underline underline-offset-4">
                Strona uczelni ↗
              </a>
            )}
          </div>
        </div>

        {loading ? (
          <Spinner text="Dobieramy odpowiedniki przedmiotów..." />
        ) : error ? (
          <ErrorNote>{error}</ErrorNote>
        ) : (
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6 relative overflow-hidden">
            <h2 className="text-xl font-black text-gray-900 flex items-center gap-3">
              <span className="bg-green-100 text-green-700 w-8 h-8 rounded-full flex items-center justify-center text-sm border border-green-200">✓</span>
              Zoptymalizowane Odpowiedniki
            </h2>

            {agreement.total === 0 ? (
              <p className="text-gray-500 italic p-4">Nie znaleźliśmy przedmiotów w planie tego kierunku dla wybranego semestru.</p>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-6 border-b border-gray-100">
                  <Stat label="Dopasowanie" value={`${agreement.percent}%`} />
                  <Stat label="Przedmioty z odpowiednikiem" value={`${agreement.covered} / ${agreement.matchable}`} />
                  <Stat label="ECTS UEK (pokryte)" value={ects(agreement.ectsHome)} />
                  <Stat label="ECTS za granicą" value={ects(agreement.ectsPartner)} />
                </div>

                <div className="relative">
                  <div className="space-y-4 relative z-0">
                    {agreement.rows.map((row, index) => (
                      <AgreementRow
                        key={row.course.course_id}
                        row={row}
                        usedElsewhere={usedElsewhere}
                        term={term}
                        locked={!isPremium && index > 0}
                      />
                    ))}
                  </div>

                  {!isPremium && agreement.rows.length > 1 && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center pt-32">
                      <div className="bg-white/80 backdrop-blur-md p-8 md:p-12 rounded-[2rem] border border-gray-100 shadow-2xl flex flex-col items-center text-center max-w-lg mx-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-amber-300 to-yellow-500 rounded-2xl flex items-center justify-center shadow-inner mb-6 text-2xl">
                          🔒
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 mb-2">Odblokuj pełny potencjał</h3>
                        <p className="text-gray-500 font-medium leading-relaxed mb-8">
                          Dobraliśmy odpowiedniki dla całego Twojego semestru. Uzyskaj dostęp do wszystkich przedmiotów,
                          uzasadnień i alternatyw, gotowych do wpisania w Learning Agreement.
                        </p>
                        <button
                          onClick={() => setIsPremium(true)}
                          className="w-full bg-gradient-to-r from-[#2470ff] to-[#a420eb] text-white font-black uppercase tracking-widest py-4 px-8 rounded-xl hover:shadow-lg transition-all hover:scale-[1.02] active:scale-95"
                        >
                          Zapłać 29,99 PLN (Demo)
                        </button>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-4">
                          Wersja demonstracyjna – płatność nie jest pobierana
                        </span>
                      </div>
                      <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
                    </div>
                  )}
                </div>

                <p className="text-xs text-gray-400 leading-relaxed">
                  Zgodność to ocena AI porównująca efekty uczenia się i tematy obu sylabusów. Pary oznaczone jako
                  „Propozycja AI” nie zostały jeszcze zatwierdzone przez koordynatora – przed podpisaniem Learning
                  Agreement skonsultuj je z koordynatorem Erasmusa na swoim wydziale.
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
