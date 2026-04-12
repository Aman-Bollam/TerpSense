'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

const proofPoints = [
  {
    icon: '⚡',
    title: 'Real-time intervention',
    body: 'Catches bad decisions before they happen — not after.',
    hover: 'hover:border-red-500/50',
  },
  {
    icon: '🧠',
    title: 'Behavior-aware AI',
    body: 'Analyzes your actual spending patterns, not generic averages.',
    hover: 'hover:border-yellow-500/50',
  },
  {
    icon: '🎯',
    title: 'Goal-linked insights',
    body: "Every purchase is measured against what you're saving for.",
    hover: 'hover:border-green-500/50',
  },
]

function TerpSenseLogo({ textClass }: { textClass: string }) {
  return (
    <div className="flex items-center gap-2">
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="10" fill="#DC2626" />
        {/* Turtle shell */}
        <ellipse cx="16" cy="16" rx="8" ry="6" fill="#FBBF24" />
        <ellipse cx="16" cy="16" rx="5" ry="4" fill="#D97706" />
        {/* Shell pattern */}
        <line x1="16" y1="12" x2="16" y2="20" stroke="#FBBF24" strokeWidth="0.8" />
        <line x1="11" y1="16" x2="21" y2="16" stroke="#FBBF24" strokeWidth="0.8" />
        <line x1="12" y1="13" x2="20" y2="19" stroke="#FBBF24" strokeWidth="0.8" />
        <line x1="20" y1="13" x2="12" y2="19" stroke="#FBBF24" strokeWidth="0.8" />
        {/* Head */}
        <ellipse cx="24" cy="14" rx="2.5" ry="2" fill="#FBBF24" />
        {/* Tail */}
        <ellipse cx="8.5" cy="17" rx="1.5" ry="1" fill="#FBBF24" />
        {/* Legs */}
        <ellipse cx="13" cy="22" rx="1.5" ry="1" fill="#FBBF24" />
        <ellipse cx="19" cy="22" rx="1.5" ry="1" fill="#FBBF24" />
        <ellipse cx="13" cy="10" rx="1.5" ry="1" fill="#FBBF24" />
        <ellipse cx="19" cy="10" rx="1.5" ry="1" fill="#FBBF24" />
      </svg>
      <span className="text-base font-black tracking-tight">
        <span className={textClass}>Terp</span>
        <span className="text-red-500">Sense</span>
      </span>
    </div>
  )
}

export default function LandingPage() {
  const [visible, setVisible] = useState(false)
  const [showPopup, setShowPopup] = useState(false)
  const [flashRed, setFlashRed] = useState(false)
  const [shake, setShake] = useState(false)
  const [demoOutcome, setDemoOutcome] = useState<null | 'saved' | 'continued'>(null)
  const [dark, setDark] = useState(false)

  useEffect(() => {
    setTimeout(() => setVisible(true), 100)
  }, [])

  const handleAddToCart = () => {
    setFlashRed(true)
    setTimeout(() => setFlashRed(false), 400)
    setTimeout(() => {
      setShake(true)
      setTimeout(() => setShake(false), 600)
    }, 200)
    setTimeout(() => setShowPopup(true), 350)
  }

  const bg = dark ? 'bg-gray-950' : 'animated-gradient'
  const text = dark ? 'text-white' : 'text-black'
  const subtext = dark ? 'text-gray-400' : 'text-gray-500'
  const card = dark ? 'bg-gray-900 border-gray-800' : 'bg-white/70 backdrop-blur-sm border-gray-200'
  const cardInner = dark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
  const btn2 = dark ? 'bg-gray-800 hover:bg-gray-700 text-white' : 'bg-gray-100 hover:bg-gray-200 text-black'

  return (
    <main className={`min-h-screen ${bg} ${text} overflow-hidden relative transition-all duration-700 ease-in-out ${shake ? 'animate-shake' : ''}`}>

      {flashRed && (
        <div className="fixed inset-0 bg-red-600 z-40 pointer-events-none animate-flash" />
      )}

      {!dark && (
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-red-100 opacity-40 rounded-full blur-3xl pointer-events-none" />
      )}

      {/* Logo */}
      <div className="fixed top-4 left-4 z-50">
        <TerpSenseLogo textClass={text} />
      </div>

      {/* Dark mode toggle */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={() => setDark(!dark)}
          className={`relative w-16 h-8 rounded-full transition-all duration-500 ease-in-out ${dark ? 'bg-gray-700' : 'bg-gray-200'}`}>
          <span className={`absolute top-1 left-1 w-6 h-6 rounded-full flex items-center justify-center text-sm transition-all duration-500 ease-in-out shadow-md ${dark ? 'translate-x-8 bg-gray-900' : 'translate-x-0 bg-white'}`}>
            {dark ? '🌙' : '☀️'}
          </span>
        </button>
      </div>

      <section className="flex flex-col items-center justify-center text-center px-6 pt-32 pb-24">

        <div className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="mb-8 inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-full px-4 py-1.5 text-sm text-red-500 font-medium">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            AI Financial Intervention Agent
          </div>
        </div>

        <h1 className={`text-5xl sm:text-6xl font-bold text-center leading-tight max-w-2xl tracking-tight transition-all duration-700 delay-100 ${text} ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          What if your bank account could{' '}
          <span className="text-red-600">stop you</span> before you made a bad decision?
        </h1>

        <p className={`mt-6 text-lg text-center max-w-lg leading-relaxed transition-all duration-700 delay-200 ${subtext} ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          TerpSense doesn't track your money.{' '}
          <span className={`${text} font-medium`}>It changes your behavior.</span> Real-time AI analysis before every purchase — not a report after the damage is done.
        </p>

        <div className={`mt-10 flex flex-col sm:flex-row gap-3 transition-all duration-700 delay-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white font-semibold px-8 py-4 rounded-xl text-base shadow-lg shadow-red-500/25 transition-all duration-150 hover:scale-105">
            Try TerpSense
            <span className="text-lg">→</span>
          </Link>
        </div>
      </section>

      <section className="px-6 pb-24 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className={`text-3xl font-black mb-3 ${text}`}>Try it yourself</h2>
          <p className={subtext}>Click Add to Cart and see what happens 👀</p>
        </div>

        <div className="max-w-sm mx-auto">
          {!demoOutcome ? (
            <div className={`${card} border rounded-2xl p-6 shadow-sm`}>
              <div className="flex items-center gap-4 mb-6">
                <div className={`${dark ? 'bg-gray-800' : 'bg-gray-100'} rounded-xl w-20 h-20 flex items-center justify-center text-4xl`}>👟</div>
                <div>
                  <p className={`${text} font-bold`}>Nike Air Max 270</p>
                  <p className={`${subtext} text-sm`}>Men's Shoes · Size 10</p>
                  <p className={`text-2xl font-black ${text} mt-1`}>$150.00</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-yellow-400 hover:bg-yellow-300 text-black font-black py-3 rounded-xl transition hover:scale-105 active:scale-95">
                  Add to Cart
                </button>
                <button className={`flex-1 ${btn2} font-bold py-3 rounded-xl transition`}>
                  Wishlist
                </button>
              </div>
            </div>
          ) : demoOutcome === 'saved' ? (
            <div className={`${card} border border-green-500/30 rounded-2xl p-6 text-center animate-slide-up shadow-sm`}>
              <div className="text-5xl mb-3">🎉</div>
              <h3 className="text-green-500 font-black text-2xl mb-2">$150 saved!</h3>
              <p className={`${subtext} mb-6`}>That money is now working for you.</p>
              <div className={`${cardInner} border rounded-xl p-4 text-left space-y-2 text-sm mb-6`}>
                <div className="flex justify-between">
                  <span className={subtext}>Added to savings</span>
                  <span className={`${text} font-bold`}>$150.00</span>
                </div>
                <div className="flex justify-between">
                  <span className={subtext}>HYSA (1 year)</span>
                  <span className="text-green-500 font-bold">$156.75</span>
                </div>
                <div className="flex justify-between">
                  <span className={subtext}>S&P 500 (10 years)</span>
                  <span className="text-yellow-500 font-bold">~$389.00</span>
                </div>
              </div>
              <button
                onClick={() => { setDemoOutcome(null); setShowPopup(false) }}
                className={`w-full ${btn2} font-bold py-3 rounded-xl transition`}>
                Try again →
              </button>
            </div>
          ) : (
            <div className={`${card} border rounded-2xl p-6 text-center animate-slide-up shadow-sm`}>
              <div className="text-5xl mb-3">📦</div>
              <h3 className={`${text} font-black text-2xl mb-2`}>Order placed.</h3>
              <p className={`${subtext} mb-2`}>Your Nike Air Max 270 is on the way.</p>
              <p className="text-red-500 text-sm mb-6">You ignored the intervention. TerpSense will be there next time.</p>
              <button
                onClick={() => { setDemoOutcome(null); setShowPopup(false) }}
                className={`w-full ${btn2} font-bold py-3 rounded-xl transition`}>
                Try again →
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="px-6 pb-24 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className={`text-3xl font-black mb-3 ${text}`}>Why other apps fail</h2>
          <p className={`${subtext} max-w-lg mx-auto`}>They treat overspending as an information problem. It's not. It's a behavior problem.</p>
        </div>
        <div className="grid sm:grid-cols-3 gap-5 max-w-2xl w-full mx-auto">
          {proofPoints.map((p) => (
            <div
              key={p.title}
              className={`${card} border ${p.hover} rounded-2xl p-5 transition-all duration-300 hover:scale-105 shadow-sm`}>
              <div className="text-2xl mb-3">{p.icon}</div>
              <h3 className={`text-sm font-bold ${text} mb-1`}>{p.title}</h3>
              <p className={`text-sm ${subtext} leading-relaxed`}>{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 pb-32 text-center">
        <h2 className={`text-4xl font-black mb-4 ${text}`}>One intervention.<br />One better decision.</h2>
        <p className={`${subtext} mb-8`}>That's all it takes to change the pattern.</p>
        <Link
          href="/dashboard"
          className={`inline-flex items-center gap-2 ${dark ? 'bg-white text-black hover:bg-gray-100' : 'bg-black text-white hover:bg-gray-900'} font-black px-12 py-4 rounded-2xl text-lg transition-all duration-300 hover:scale-105 shadow-lg`}>
          Launch TerpSense →
        </Link>
        <p className={`mt-8 text-xs ${subtext}`}>
          Demo uses Capital One Nessie mock data · Powered by Azure OpenAI
        </p>
      </section>

      {showPopup && !demoOutcome && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-6 animate-fade-in">
          <div className={`${dark ? 'bg-gray-900' : 'bg-white'} border-2 border-red-600 rounded-2xl p-8 w-full max-w-md shadow-2xl shadow-red-600/30 animate-slam`}>
            <div className="text-4xl mb-3">🚨</div>
            <h2 className="text-3xl font-black text-red-600 mb-1">Hold on.</h2>
            <p className={`${subtext} text-sm mb-5`}>TerpSense flagged this purchase before you committed.</p>

            <div className="space-y-3 mb-6">
              <div className={`${cardInner} border rounded-xl p-3 text-sm ${dark ? 'text-gray-300' : 'text-gray-700'}`}>
                💸 You've spent <span className={`${text} font-bold`}>$284</span> on clothing this month
              </div>
              <div className={`${cardInner} border rounded-xl p-3 text-sm ${dark ? 'text-gray-300' : 'text-gray-700'}`}>
                📅 This delays your savings goal by <span className={`${text} font-bold`}>11 days</span>
              </div>
              <div className={`${cardInner} border rounded-xl p-3 text-sm ${dark ? 'text-gray-300' : 'text-gray-700'}`}>
                📈 HYSA (1yr): <span className="text-green-500 font-bold">$156.75</span> · S&P 500 (10yr): <span className="text-yellow-500 font-bold">~$389</span>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => { setDemoOutcome('saved'); setShowPopup(false) }}
                className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-black py-3 rounded-xl transition hover:scale-105 active:scale-95">
                ✅ Save it instead
              </button>
              <button
                onClick={() => { setDemoOutcome('continued'); setShowPopup(false) }}
                className="w-full bg-transparent border border-gray-500 hover:border-gray-400 text-gray-400 font-bold py-3 rounded-xl transition">
                Continue purchase anyway
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes flash {
          0% { opacity: 0.8; }
          100% { opacity: 0; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          15% { transform: translateX(-8px) rotate(-1deg); }
          30% { transform: translateX(8px) rotate(1deg); }
          45% { transform: translateX(-6px) rotate(-0.5deg); }
          60% { transform: translateX(6px) rotate(0.5deg); }
          75% { transform: translateX(-3px); }
          90% { transform: translateX(3px); }
        }
        @keyframes slam {
          0% { opacity: 0; transform: translateY(-60px) scale(1.05); }
          60% { transform: translateY(8px) scale(0.98); }
          80% { transform: translateY(-4px) scale(1.01); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-flash { animation: flash 0.4s ease-out forwards; }
        .animate-shake { animation: shake 0.6s ease-out; }
        .animate-slam { animation: slam 0.4s cubic-bezier(0.22, 1, 0.36, 1); }
        .animate-fade-in { animation: fade-in 0.2s ease-out; }
        .animate-slide-up { animation: slide-up 0.3s ease-out; }
      `}</style>
    </main>
  )
}