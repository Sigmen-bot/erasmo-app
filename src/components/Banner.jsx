// Kwadratowy baner w stylu Erasmo: gradient niebieski → fiolet, ziarno i fale z grafiki.
import fale from '../assets/Grafika4.svg'

const noiseTexture = "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")"

export default function Banner({ lines, image = fale, className = '' }) {
  return (
    <div className={`aspect-square w-full max-w-[500px] mx-auto rounded-[3rem] bg-gradient-to-br from-[#2470ff] via-[#2470ff] to-[#a420eb] via-[70%] relative flex items-center justify-end px-12 overflow-hidden shadow-2xl ${className}`}>
      <div className="absolute inset-0 opacity-[0.45] mix-blend-overlay pointer-events-none" style={{ backgroundImage: noiseTexture }}></div>
      <div className="absolute inset-0 bg-cover bg-center opacity-30 pointer-events-none" style={{ backgroundImage: `url(${image})` }}></div>
      <h2 className="relative z-10 text-white font-black text-4xl md:text-5xl text-right leading-[1.1] tracking-tight">
        {lines.map((line, i) => (
          <span key={i}>
            {line}
            {i < lines.length - 1 && <br />}
          </span>
        ))}
      </h2>
    </div>
  )
}
