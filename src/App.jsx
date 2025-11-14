import { useEffect, useMemo, useState } from 'react'

function Chip({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="text-xs sm:text-sm px-3 py-1.5 rounded-full bg-white/70 hover:bg-white text-gray-700 shadow-sm border border-gray-200 transition"
    >
      {children}
    </button>
  )
}

function ScoreBar({ score = 0 }) {
  const pct = Math.max(0, Math.min(100, Math.round(score * 100)))
  const barColor = pct >= 80 ? 'bg-emerald-500' : pct >= 60 ? 'bg-lime-500' : pct >= 40 ? 'bg-amber-500' : 'bg-rose-500'
  return (
    <div className="mt-3">
      <div className="flex items-center justify-between text-xs text-gray-600">
        <span>Match score</span>
        <span className="font-semibold text-gray-800">{pct}%</span>
      </div>
      <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden mt-1">
        <div className={`h-full ${barColor} transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function Tag({ children }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 text-xs mr-2 mb-2 border border-sky-100">
      {children}
    </span>
  )
}

function SkeletonCard() {
  return (
    <div className="border rounded-xl p-5 bg-white/80 backdrop-blur animate-pulse">
      <div className="h-4 w-36 bg-gray-200 rounded" />
      <div className="h-3 w-64 bg-gray-200 rounded mt-3" />
      <div className="h-3 w-48 bg-gray-200 rounded mt-2" />
      <div className="h-2 w-full bg-gray-200 rounded mt-4" />
      <div className="h-2 w-5/6 bg-gray-200 rounded mt-2" />
    </div>
  )
}

function App() {
  const [prompt, setPrompt] = useState('Urban arterial near a school zone with frequent pedestrian crashes, operating speeds around 45 km/h')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)
  const [error, setError] = useState('')

  const backendBase = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

  const quickPrompts = useMemo(() => [
    'Rural highway with sharp curves and frequent run-off-road crashes at 80 km/h',
    'Urban intersection with high angle crashes and red-light running',
    'Suburban corridor near schools with speeding and pedestrian conflicts',
    'Two-lane road with overtaking crashes and poor sight distance'
  ], [])

  const fetchRecommendations = async () => {
    if (!prompt?.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${backendBase}/recommendations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, top_k: 5 })
      })
      if (!res.ok) throw new Error(`Request failed: ${res.status}`)
      const data = await res.json()
      setResults(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Auto-run a sample query on load
    fetchRecommendations()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-50 via-sky-50 to-emerald-50">
      {/* Top banner */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -right-20 w-72 h-72 rounded-full bg-amber-200/40 blur-3xl" />
          <div className="absolute -bottom-24 -left-10 w-72 h-72 rounded-full bg-sky-200/40 blur-3xl" />
        </div>
        <div className="max-w-6xl mx-auto px-6 pt-10 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-sm">
              <span className="text-xl">🚧</span>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-amber-700/80">Road Safety Intelligence</p>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900">Intervention Recommender</h1>
            </div>
          </div>
          <p className="mt-3 text-gray-600 max-w-3xl">Describe your site and safety problems. We’ll analyze the context and surface evidence-backed countermeasures with references.</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 pb-16">
        {/* Input card */}
        <section className="bg-white/80 backdrop-blur rounded-2xl shadow-sm border border-white/60 p-6 md:p-7 -mt-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Describe the road context and problems</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full h-28 p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400/70 focus:border-amber-300"
            placeholder="e.g., Rural highway with sharp curves and frequent run-off-road crashes at 80 km/h"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            {quickPrompts.map((qp, i) => (
              <Chip key={i} onClick={() => setPrompt(qp)}>{qp}</Chip>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              onClick={fetchRecommendations}
              className="px-4 py-2.5 bg-amber-600 text-white rounded-xl hover:bg-amber-700 disabled:opacity-60 shadow-sm"
              disabled={loading}
            >
              {loading ? 'Analyzing…' : 'Get Recommendations'}
            </button>
            <a href="/test" className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 border">Check Backend / DB</a>
            {error && <span className="text-rose-600 text-sm">{error}</span>}
          </div>
        </section>

        {/* Results */}
        <section className="mt-8">
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="text-lg md:text-xl font-semibold text-gray-800">Recommendations</h2>
            {results?.filters_used && (
              <div className="text-xs md:text-sm text-gray-600 bg-white/70 border border-white/60 rounded-full px-3 py-1">
                Parsed: {Object.entries(results.filters_used).map(([k,v]) => `${k}: ${Array.isArray(v)? v.join(', '): v}`).join(' | ')}
              </div>
            )}
          </div>

          {!results && (
            <div className="text-gray-600 text-sm">Enter a description and click Get Recommendations.</div>
          )}

          {loading && (
            <div className="grid gap-4 md:grid-cols-2">
              <SkeletonCard />
              <SkeletonCard />
            </div>
          )}

          {results && !loading && (
            <ul className="grid gap-5 md:grid-cols-2">
              {results.items.map((item, idx) => (
                <li key={idx} className="group relative">
                  <div className="absolute inset-y-0 left-0 w-1.5 rounded-l-xl bg-gradient-to-b from-amber-500 to-emerald-500 opacity-70" />
                  <div className="h-full border rounded-xl p-5 pl-6 bg-white/90 backdrop-blur shadow-sm hover:shadow-md transition overflow-hidden">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-base md:text-lg font-bold text-gray-900">{item.name}</h3>
                        <p className="text-gray-700 mt-1 text-sm">{item.description}</p>
                      </div>
                      <span className="ml-3 shrink-0 inline-flex items-center text-[10px] md:text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full border border-emerald-100">Score {item.score?.toFixed(2)}</span>
                    </div>

                    <ScoreBar score={item.score} />

                    <div className="mt-3 text-sm text-gray-700">
                      <p className="font-medium text-gray-800">Why suggested</p>
                      <p className="mt-1 text-gray-700">{item.reasons?.length ? item.reasons.join('; ') : 'Best overall match for described conditions.'}</p>
                    </div>

                    {(item.applicability?.road_types?.length || item.applicability?.issues?.length || item.applicability?.environments?.length) && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-gray-800 mb-1">Applicability</p>
                        <div className="-m-1">
                          {['road_types','issues','environments'].map((k) => (
                            (item.applicability?.[k] || []).map((t, i) => (
                              <Tag key={`${k}-${i}`}>{t}</Tag>
                            ))
                          ))}
                        </div>
                      </div>
                    )}

                    {item.references && item.references.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-gray-800">References</p>
                        <ul className="mt-1 space-y-1.5">
                          {item.references.map((r, i) => (
                            <li key={i} className="text-sm text-gray-700">
                              <span className="inline-flex items-center gap-2">
                                <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-amber-100 text-amber-700 text-[10px]">ref</span>
                                <span className="font-medium">{r.title}</span>
                                {r.source ? <span className="text-gray-500">— {r.source}</span> : null}
                                {r.url && (
                                  <a className="text-sky-700 hover:underline" target="_blank" rel="noreferrer" href={r.url}>
                                    link
                                  </a>
                                )}
                              </span>
                              {r.excerpt && <span className="block text-gray-500 mt-0.5">“{r.excerpt}”</span>}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {item.constraints && item.constraints.length > 0 && (
                      <div className="mt-3 text-sm text-gray-700">
                        <span className="font-medium">Constraints:</span> {item.constraints.join(', ')}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Footer */}
        <div className="mt-12 text-xs text-gray-500 flex items-center gap-2">
          <span>Built for safer streets</span>
          <span>•</span>
          <span>Evidence-led interventions</span>
        </div>
      </div>
    </div>
  )
}

export default App
