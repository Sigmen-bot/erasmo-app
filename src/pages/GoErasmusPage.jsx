// Tryb „Jestem już zakwalifikowany/a”: kierunek + semestr + konkretna uczelnia → Learning Agreement.
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Banner from '../components/Banner'
import { ErrorNote } from '../components/Feedback'
import { HomeFields, selectClass, useCatalog } from '../components/StudentFields'
import { countryName, flag } from '../lib/format'

export default function GoErasmusPage() {
  const navigate = useNavigate()
  const { programmes, universities, loading, error } = useCatalog()
  const [programmeId, setProgrammeId] = useState('')
  const [semester, setSemester] = useState('')
  const [universityId, setUniversityId] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    const params = new URLSearchParams({ program: programmeId, semestr: semester, uczelnia: universityId })
    navigate(`/sylabusy?${params}`)
  }

  const disabled = !programmeId || !semester || !universityId

  return (
    <div className="w-full flex flex-col lg:flex-row items-center gap-16">
      <div className="w-full lg:w-1/2 flex flex-col">
        <form onSubmit={handleSubmit} className="flex flex-col gap-10">
          <ErrorNote>{error}</ErrorNote>
          <div className="flex flex-col gap-5">
            <h2 className="text-2xl font-black text-[#a420eb] uppercase tracking-widest">Uczelnia Macierzysta</h2>
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
            <h2 className="text-2xl font-black text-gray-400 uppercase tracking-widest">Uczelnia Partnerska</h2>
            <select
              value={universityId}
              onChange={(e) => setUniversityId(e.target.value)}
              disabled={loading}
              className={selectClass.replace('focus:border-[#2470ff]', 'focus:border-[#a420eb]')}
            >
              <option value="" disabled>-- Wybierz docelową uczelnię --</option>
              {universities.map((u) => (
                <option key={u.id} value={u.id}>
                  {flag(u.country_code)} {u.name} – {countryName(u.country_code)}
                </option>
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
        <Banner lines={['JADĘ NA', 'ERASMUSA!']} />
      </div>
    </div>
  )
}
