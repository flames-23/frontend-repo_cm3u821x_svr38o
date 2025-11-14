import { useEffect, useState } from 'react'

function App() {
  const [prompt, setPrompt] = useState('Urban arterial near a school zone with frequent pedestrian crashes, operating speeds around 45 km/h')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)
  const [error, setError] = useState('')

  const backendBase = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

  const fetchRecommendations = async () => {
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
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-emerald-50">
      <div className="max-w-5xl mx-auto py-12 px-6">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Road Safety Intervention GPT</h1>
          <p className="text-gray-600 mt-2">Identify suitable, evidence-backed interventions for your road safety problems.</p>
        </header>

        <section className="bg-white rounded-xl shadow p-6 mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">Describe the road context and problems</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full h-28 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="e.g., Rural highway with sharp curves and frequent run-off-road crashes at 80 km/h"
          />
          <div className="mt-4 flex gap-3">
            <button onClick={fetchRecommendations} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50" disabled={loading}>
              {loading ? 'Analyzing...' : 'Get Recommendations'}
            </button>
            <a href="/test" className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">Check Backend/DB</a>
          </div>
          {error && <p className="text-red-600 mt-3">{error}</p>}
        </section>

        <section className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Results</h2>
          {!results && <p className="text-gray-500">Enter a description and click Get Recommendations.</p>}
          {results && (
            <div>
              <p className="text-sm text-gray-600 mb-4">Filters interpreted: {JSON.stringify(results.filters_used)}</p>
              <ul className="space-y-4">
                {results.items.map((item, idx) => (
                  <li key={idx} className="border p-4 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{item.name}</h3>
                        <p className="text-gray-700 mt-1">{item.description}</p>
                        <div className="mt-2 text-sm text-gray-600">
                          <p><span className="font-semibold">Why suggested:</span> {item.reasons?.join('; ') || 'Best overall match'}</p>
                          <p className="mt-1"><span className="font-semibold">Applicability:</span> {['road_types','issues','environments'].map(k => item.applicability?.[k]?.length ? `${k}: ${item.applicability[k].join(', ')}` : null).filter(Boolean).join(' | ')}</p>
                        </div>
                      </div>
                      <span className="ml-3 inline-flex items-center text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded">Score {item.score?.toFixed(2)}</span>
                    </div>

                    {item.references && item.references.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-semibold text-gray-800">References</p>
                        <ul className="list-disc ml-5 text-sm text-gray-700">
                          {item.references.map((r, i) => (
                            <li key={i}>
                              {r.title} {r.source ? `— ${r.source}` : ''} {r.url && <a className="text-blue-600 hover:underline" target="_blank" href={r.url}>link</a>}
                              {r.excerpt && <span className="block text-gray-500">“{r.excerpt}”</span>}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {item.constraints && item.constraints.length > 0 && (
                      <div className="mt-3 text-sm text-gray-700">
                        <span className="font-semibold">Constraints:</span> {item.constraints.join(', ')}
                      </div>
                    )}

                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default App
