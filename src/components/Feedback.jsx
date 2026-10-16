// Wspólne stany: ładowanie i błąd.

export function Spinner({ text }) {
  return (
    <div className="w-full py-20 flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 border-4 border-gray-200 border-t-[#a420eb] rounded-full animate-spin"></div>
      {text && <p className="text-gray-500 font-bold animate-pulse">{text}</p>}
    </div>
  )
}

export function ErrorNote({ children }) {
  if (!children) return null
  return (
    <div className="w-full rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
      {children}
    </div>
  )
}
