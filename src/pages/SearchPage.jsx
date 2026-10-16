// Tryb „Znajdź wymarzonego Erasmusa”: kierunek + semestr → ranking uczelni partnerskich.
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Banner from '../components/Banner'
import { ErrorNote } from '../components/Feedback'
import { HomeFields, selectClass, useCatalog } from '../components/StudentFields'
import { countryName, flag } from '../lib/format'

export default function SearchPage() {
  const navigate = useNavigate()
  const { programmes, universities, loading, error } = useCatalog()
  const [programmeId, setProgrammeId] = useState('')
  const [semester, setSemester] = useState('')
  const [country, setCountry] = useState('')

  const countries = useMemo(
    () => [...new Set(universities.map((u) => u.country_code))].sort((a, b) => countryName(a).localeCompare(countryName(b))),
    [universities],
  )

  const handleSubmit = (e) => {
    e.preventDefault()
    const params = new URLSearchParams({ program: programmeId, semestr: semester })
    if (country) params.set('kraj', country)
    navigate(`/wyniki?${params}`)
  }

  const disabled = !programmeId || !semester

  return (
    <div className="w-full flex flex-col lg:flex-row items-center gap-16">
      <div className="w-full lg:w-1/2 flex flex-col">
        <form onSubmit={handleSubmit} className="flex flex-col gap-10">
          <ErrorNote>{error}</ErrorNote>
          <div className="flex flex-col gap-5">
            <h2 className="text-2xl font-black text-[#a420eb] uppercase tracking-widest">Wymagane</h2>
            <HomeFields
              programmes={programmes}
              loading={loading}
              programmeId={programmeId}
              setProgrammeId={setProgrammeId}
              semester={semester}
              setSemester={setSemester}
            />
          </div>

          <div className="flex flex-col gap-5">
            <h2 className="text-2xl font-black text-gray-400 uppercase tracking-widest">Opcjonalnie</h2>
            <select value={country} onChange={(e) => setCountry(e.target.value)} disabled={loading} className={selectClass}>
              <option value="">Wszystkie kraje</option>
              {countries.map((c) => (
                <option key={c} value={c}>{flag(c)} {countryName(c)}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={disabled}
            className="w-full mt-4 bg-black hover:bg-gray-800 text-white font-black uppercase tracking-widest py-5 rounded-xl transition-all disabled:bg-gray-300 disabled:cursor-not-allowed shadow-lg"
          >
            Szukaj
          </button>
        </form>
      </div>

      <div className="w-full lg:w-1/2">
        <Banner lines={['ZNAJDŹ', 'WYMARZONEGO', 'ERASMUSA']} />
      </div>
    </div>
  )
}
