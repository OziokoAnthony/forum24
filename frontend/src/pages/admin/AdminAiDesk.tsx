import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  CircleHelp,
  FileSearch,
  Gauge,
  Play,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Wand2,
} from 'lucide-react'
import { aiSources, factChecks, trendingTopics } from '../../data/content'
import { Button } from '../../components/ui/Button'

type Tab = 'trends' | 'research' | 'writer' | 'seo' | 'fact-check' | 'settings'

const tabs: { id: Tab; label: string }[] = [
  { id: 'trends', label: 'Trends' },
  { id: 'research', label: 'Research' },
  { id: 'writer', label: 'Draft writer' },
  { id: 'seo', label: 'SEO assistant' },
  { id: 'fact-check', label: 'Fact-check' },
  { id: 'settings', label: 'Agent settings' },
]

const urgencyStyles: Record<string, string> = {
  High: 'bg-red-100 text-red-800',
  Medium: 'bg-amber-100 text-amber-800',
  Low: 'bg-slate-100 text-slate-600',
}

const sourceStyles: Record<string, string> = {
  Confirmed: 'bg-green-100 text-green-800',
  Alleged: 'bg-amber-100 text-amber-800',
  Opinion: 'bg-slate-100 text-slate-600',
}

const factStyles = {
  danger: { box: 'border-red-200 bg-red-50', text: 'text-red-900', label: 'Unsupported' },
  warning: { box: 'border-amber-200 bg-amber-50', text: 'text-amber-900', label: 'Conflicting' },
  info: { box: 'border-sky-200 bg-sky-50', text: 'text-sky-900', label: 'Needs source' },
}

const keywords = [
  { term: 'nigeria ai startups', intent: 'Informational', difficulty: 'Medium' },
  { term: 'african ai infrastructure', intent: 'Informational', difficulty: 'Low' },
  { term: 'ai policy nigeria 2026', intent: 'News', difficulty: 'Low' },
  { term: 'lagos tech ecosystem', intent: 'Commercial', difficulty: 'High' },
]

export function AdminAiDesk() {
  const [tab, setTab] = useState<Tab>('trends')
  const [topic, setTopic] = useState('Nigeria AI policy draft')
  const [toggles, setToggles] = useState({
    trends: true,
    research: true,
    writer: true,
    seo: true,
    factCheck: true,
  })
  const navigate = useNavigate()

  return (
    <div className="grid grid-cols-1 gap-5">
      <div>
        <h2 className="text-xl font-extrabold">AI editorial assistant</h2>
        <p className="text-sm text-ink-muted">
          AI assists with discovery, research and drafting. A human editor always approves.
        </p>
      </div>

      <div className="flex flex-wrap gap-1 rounded-control border border-line bg-panel p-1">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`min-h-10 rounded-[9px] px-3 text-sm font-bold transition-colors ${
              tab === item.id ? 'bg-sky-600 text-white shadow-[inset_0_1px_0_rgb(255_255_255_/_0.35),0_2px_0_#0d3f7d]' : 'text-ink-soft hover:bg-sky-50 hover:text-sky-700'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === 'trends' && (
        <section className="rounded-card border border-line bg-panel shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line p-4">
            <div>
              <h3 className="flex items-center gap-2 text-base font-extrabold">
                <TrendingUp size={17} aria-hidden="true" className="text-sky-600" />
                Trending topics
              </h3>
              <p className="text-[13px] text-ink-muted">Nigeria and Africa · last 24 hours</p>
            </div>
            <Button variant="secondary">
              <RefreshCw size={15} aria-hidden="true" />
              Refresh
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-cloud text-left text-[11px] tracking-[0.05em] text-ink-muted uppercase">
                  <th className="px-4 py-2.5 font-bold">Topic</th>
                  <th className="px-4 py-2.5 font-bold">Region</th>
                  <th className="px-4 py-2.5 font-bold">Category</th>
                  <th className="px-4 py-2.5 font-bold">Momentum</th>
                  <th className="px-4 py-2.5 font-bold">Urgency</th>
                  <th className="px-4 py-2.5 text-right font-bold">Action</th>
                </tr>
              </thead>
              <tbody>
                {trendingTopics.map((item) => (
                  <tr key={item.topic} className="border-t border-line hover:bg-sky-50">
                    <td className="px-4 py-3 font-semibold text-ink">{item.topic}</td>
                    <td className="px-4 py-3 text-ink-soft">{item.region}</td>
                    <td className="px-4 py-3 text-ink-soft">{item.category}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-mist">
                          <div className="h-full rounded-full bg-sky-500" style={{ width: `${item.momentum}%` }} />
                        </div>
                        <span className="text-[12px] font-semibold tabular-nums text-ink-muted">{item.momentum}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${urgencyStyles[item.urgency]}`}>
                        {item.urgency}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setTopic(item.topic)
                          setTab('writer')
                        }}
                        className="inline-flex items-center gap-1 rounded-control border border-line bg-panel px-2.5 py-1.5 text-[12px] font-bold text-sky-700 hover:bg-sky-50"
                      >
                        Start draft
                        <ChevronRight size={12} aria-hidden="true" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {tab === 'research' && (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
          <section className="rounded-card border border-line bg-panel p-5 shadow-card">
            <h3 className="flex items-center gap-2 text-base font-extrabold">
              <FileSearch size={17} aria-hidden="true" className="text-sky-600" />
              Research
            </h3>
            <p className="text-[13px] text-ink-muted">Sources are collected for editorial verification, not published as truth.</p>

            <label htmlFor="research-topic" className="mt-4 block text-[12px] font-bold text-ink">
              Topic
            </label>
            <div className="mt-1 flex gap-2">
              <input
                id="research-topic"
                value={topic}
                onChange={(event) => setTopic(event.target.value)}
                className="min-h-11 flex-1 rounded-control border border-line bg-panel px-3 text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-500/25 focus:outline-none"
              />
              <Button>
                <Play size={15} aria-hidden="true" />
                Run
              </Button>
            </div>

            <h4 className="mt-5 text-sm font-extrabold">Sources found</h4>
            <ul className="mt-2 grid gap-2">
              {aiSources.map((source) => (
                <li key={source.title} className="rounded-control border border-line bg-cloud p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[12px] font-bold text-sky-700">{source.domain}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${sourceStyles[source.status]}`}>
                      {source.status}
                    </span>
                    <span className="ml-auto text-[11px] text-ink-muted">{source.date}</span>
                  </div>
                  <p className="mt-1 text-sm font-semibold text-ink">{source.title}</p>
                </li>
              ))}
            </ul>
          </section>

          <aside className="grid content-start gap-4">
            <div className="rounded-card border border-line bg-panel p-4 shadow-card">
              <h3 className="text-sm font-extrabold tracking-[0.04em] text-ink-muted uppercase">Run status</h3>
              <p className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-green-800">
                <CheckCircle2 size={16} aria-hidden="true" />
                Completed · 4 sources
              </p>
              <p className="mt-1 text-[12px] text-ink-muted">Took 38 seconds · 6,210 tokens</p>
            </div>
            <div className="rounded-card border border-line bg-panel p-4 shadow-card">
              <h3 className="text-sm font-extrabold tracking-[0.04em] text-ink-muted uppercase">Editor’s note</h3>
              <p className="mt-2 text-sm text-ink-soft">
                One claim is unverified and one has conflicting dates. Open the Fact-check tab
                before using this research.
              </p>
            </div>
          </aside>
        </div>
      )}

      {tab === 'writer' && (
        <div className="grid gap-5 xl:grid-cols-2">
          <section className="rounded-card border border-line bg-panel p-5 shadow-card">
            <h3 className="flex items-center gap-2 text-base font-extrabold">
              <Wand2 size={17} aria-hidden="true" className="text-sky-600" />
              Generate a draft
            </h3>

            <label htmlFor="writer-topic" className="mt-4 block text-[12px] font-bold text-ink">
              Topic
            </label>
            <input
              id="writer-topic"
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              className="mt-1 w-full rounded-control border border-line bg-panel px-3 py-2 text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-500/25 focus:outline-none"
            />

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="writer-audience" className="block text-[12px] font-bold text-ink">
                  Audience
                </label>
                <select
                  id="writer-audience"
                  className="mt-1 w-full rounded-control border border-line bg-panel px-2.5 py-2 text-sm"
                >
                  <option>General readers</option>
                  <option>Young professionals</option>
                  <option>Technology enthusiasts</option>
                  <option>Entrepreneurs</option>
                </select>
              </div>
              <div>
                <label htmlFor="writer-length" className="block text-[12px] font-bold text-ink">
                  Length
                </label>
                <select
                  id="writer-length"
                  className="mt-1 w-full rounded-control border border-line bg-panel px-2.5 py-2 text-sm"
                >
                  <option>Short (600–800)</option>
                  <option>Standard (900–1,100)</option>
                  <option>Long (1,200–1,500)</option>
                </select>
              </div>
            </div>

            <div className="mt-4 rounded-control border border-line bg-cloud p-3">
              <p className="text-[11px] font-bold tracking-[0.05em] text-ink-muted uppercase">Outline</p>
              <ol className="mt-2 grid gap-1.5 text-sm text-ink-soft">
                <li>1. Why this moment matters</li>
                <li>2. What is actually changing</li>
                <li>3. What still stands in the way</li>
                <li>4. What happens next</li>
              </ol>
            </div>

            <Button className="mt-4 w-full">
              <Sparkles size={16} aria-hidden="true" />
              Generate draft
            </Button>
            <p className="mt-2 text-[11px] text-ink-muted">
              Generation runs in the background. You can leave this page; the draft will appear
              in the queue.
            </p>
          </section>

          <section className="rounded-card border border-line bg-mist p-5 shadow-card">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-base font-extrabold">AI draft — needs review</h3>
              <span className="rounded-full bg-panel px-2 py-0.5 text-[11px] font-bold text-sky-800">
                Not publishable
              </span>
            </div>
            <div className="mt-3 rounded-control bg-panel p-4">
              <h4 className="text-lg font-extrabold">Nigeria’s AI policy draft: what changes for builders</h4>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                A draft policy circulating in Abuja would change how AI products are registered
                and reviewed in Nigeria. This draft summarises the published sections, flags the
                claims that still need a primary source, and suggests questions for the
                regulator.
              </p>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                Every paragraph is editable. Nothing here is presented as verified fact until an
                editor has checked the source list.
              </p>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button onClick={() => navigate('/admin/articles/new')}>
                <ChevronRight size={15} aria-hidden="true" />
                Insert into editor
              </Button>
              <Button variant="secondary">Save as draft</Button>
              <Button variant="ghost">Discard</Button>
            </div>
          </section>
        </div>
      )}

      {tab === 'seo' && (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
          <section className="rounded-card border border-line bg-panel p-5 shadow-card">
            <h3 className="flex items-center gap-2 text-base font-extrabold">
              <Gauge size={17} aria-hidden="true" className="text-sky-600" />
              Keyword plan
            </h3>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-cloud text-left text-[11px] tracking-[0.05em] text-ink-muted uppercase">
                    <th className="px-3 py-2 font-bold">Keyword</th>
                    <th className="px-3 py-2 font-bold">Intent</th>
                    <th className="px-3 py-2 font-bold">Difficulty</th>
                    <th className="px-3 py-2 text-right font-bold">Use</th>
                  </tr>
                </thead>
                <tbody>
                  {keywords.map((item) => (
                    <tr key={item.term} className="border-t border-line">
                      <td className="px-3 py-2.5 font-semibold text-ink">{item.term}</td>
                      <td className="px-3 py-2.5 text-ink-soft">{item.intent}</td>
                      <td className="px-3 py-2.5">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                            item.difficulty === 'Low'
                              ? 'bg-green-100 text-green-800'
                              : item.difficulty === 'Medium'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {item.difficulty}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <button type="button" className="text-[12px] font-bold text-sky-700 hover:underline">
                          Copy
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <aside className="grid content-start gap-4">
            <div className="rounded-card border border-line bg-panel p-4 shadow-card">
              <h3 className="text-sm font-extrabold tracking-[0.04em] text-ink-muted uppercase">SEO title</h3>
              <p className="mt-2 text-sm font-semibold text-ink">Nigeria’s AI policy draft: what changes for builders</p>
              <p className="mt-1 text-[11px] text-ink-muted">52/60 characters</p>
            </div>
            <div className="rounded-card border border-line bg-panel p-4 shadow-card">
              <h3 className="text-sm font-extrabold tracking-[0.04em] text-ink-muted uppercase">Internal links</h3>
              <div className="mt-2 grid gap-1.5">
                {['AfCFTA enters a new phase…', 'Lagos rail line ridership', 'Beginner’s Guide to Python'].map(
                  (item) => (
                    <span key={item} className="rounded-control bg-cloud px-2.5 py-1.5 text-[12px] font-semibold text-ink-soft">
                      {item}
                    </span>
                  ),
                )}
              </div>
            </div>
          </aside>
        </div>
      )}

      {tab === 'fact-check' && (
        <section className="grid gap-4">
          <div className="rounded-card border border-line bg-panel p-5 shadow-card">
            <h3 className="flex items-center gap-2 text-base font-extrabold">
              <ShieldCheck size={17} aria-hidden="true" className="text-sky-600" />
              Claims to verify
            </h3>
            <p className="text-[13px] text-ink-muted">
              AI flags, an editor decides. Flags are never a guarantee that a claim is true or
              false.
            </p>
          </div>

          {factChecks.map((check) => {
            const style = factStyles[check.severity]
            return (
              <article key={check.claim} className={`rounded-card border p-4 shadow-card ${style.box}`}>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`inline-flex items-center gap-1 text-[12px] font-bold ${style.text}`}>
                    {check.severity === 'danger' ? (
                      <CircleAlert size={14} aria-hidden="true" />
                    ) : check.severity === 'warning' ? (
                      <CircleHelp size={14} aria-hidden="true" />
                    ) : (
                      <ShieldCheck size={14} aria-hidden="true" />
                    )}
                    {style.label}
                  </span>
                  <div className="ml-auto flex gap-2">
                    <button type="button" className="rounded-control border border-line bg-panel px-2.5 py-1 text-[11px] font-bold text-sky-700 hover:bg-sky-50">
                      Mark verified
                    </button>
                    <button type="button" className="rounded-control border border-line bg-panel px-2.5 py-1 text-[11px] font-bold text-red-700 hover:bg-red-50">
                      Remove claim
                    </button>
                  </div>
                </div>
                <p className={`mt-2 text-sm font-semibold ${style.text}`}>{check.claim}</p>
                <p className="mt-1 text-[13px] text-ink-soft">{check.note}</p>
              </article>
            )
          })}
        </section>
      )}

      {tab === 'settings' && (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
          <section className="rounded-card border border-line bg-panel p-5 shadow-card">
            <h3 className="text-base font-extrabold">Provider &amp; model</h3>

            <label htmlFor="ai-provider" className="mt-4 block text-[12px] font-bold text-ink">
              Provider
            </label>
            <select id="ai-provider" className="mt-1 w-full rounded-control border border-line bg-panel px-2.5 py-2 text-sm">
              <option>OpenAI</option>
              <option>Anthropic</option>
              <option>Google Gemini</option>
            </select>

            <label htmlFor="ai-key" className="mt-3 block text-[12px] font-bold text-ink">
              API key
            </label>
            <input
              id="ai-key"
              type="password"
              value="sk-live-xxxxxxxxxxxxxxxx"
              readOnly
              className="mt-1 w-full rounded-control border border-line bg-panel px-2.5 py-2 text-sm"
            />
            <p className="mt-1 text-[11px] text-ink-muted">
              Stored encrypted. The value is write-only and never shown again after saving.
            </p>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="ai-model" className="block text-[12px] font-bold text-ink">
                  Model
                </label>
                <input
                  id="ai-model"
                  defaultValue="gpt-4.1"
                  className="mt-1 w-full rounded-control border border-line bg-panel px-2.5 py-2 text-sm"
                />
              </div>
              <div>
                <label htmlFor="ai-budget" className="block text-[12px] font-bold text-ink">
                  Monthly budget (USD)
                </label>
                <input
                  id="ai-budget"
                  type="number"
                  defaultValue={250}
                  className="mt-1 w-full rounded-control border border-line bg-panel px-2.5 py-2 text-sm"
                />
              </div>
            </div>

            <label htmlFor="ai-temp" className="mt-3 block text-[12px] font-bold text-ink">
              Temperature: 0.4
            </label>
            <input id="ai-temp" type="range" min={0} max={1} step={0.1} defaultValue={0.4} className="mt-1 w-full accent-sky-600" />

            <h4 className="mt-5 text-sm font-extrabold">Functions</h4>
            <div className="mt-2 grid gap-2">
              {(
                [
                  ['trends', 'Trend discovery'],
                  ['research', 'Research assistant'],
                  ['writer', 'AI article writer'],
                  ['seo', 'SEO assistant'],
                  ['factCheck', 'Fact-checking'],
                ] as const
              ).map(([key, label]) => (
                <label
                  key={key}
                  className="flex cursor-pointer items-center justify-between rounded-control border border-line bg-cloud px-3 py-2 text-sm font-semibold"
                >
                  {label}
                  <input
                    type="checkbox"
                    checked={toggles[key]}
                    onChange={(event) => setToggles({ ...toggles, [key]: event.target.checked })}
                    className="h-4 w-4 accent-sky-600"
                  />
                </label>
              ))}
            </div>
          </section>

          <aside className="grid content-start gap-4">
            <div className="rounded-card border border-line bg-panel p-4 shadow-card">
              <h3 className="text-sm font-extrabold tracking-[0.04em] text-ink-muted uppercase">Usage this month</h3>
              <p className="mt-2 text-2xl font-extrabold tabular-nums">$118.40</p>
              <p className="text-[12px] text-ink-muted">of $250 budget · 47%</p>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-mist">
                <div className="h-full w-[47%] rounded-full bg-sky-500" />
              </div>
              <dl className="mt-3 grid gap-1 text-[13px]">
                <div className="flex justify-between"><dt className="text-ink-muted">Tasks</dt><dd className="font-semibold">1,284</dd></div>
                <div className="flex justify-between"><dt className="text-ink-muted">Failed</dt><dd className="font-semibold text-red-700">37</dd></div>
                <div className="flex justify-between"><dt className="text-ink-muted">Tokens</dt><dd className="font-semibold">8.4M</dd></div>
              </dl>
              <Button variant="secondary" className="mt-3 w-full">
                <RefreshCw size={15} aria-hidden="true" />
                Retry failed tasks
              </Button>
            </div>

            <div className="rounded-card border border-line bg-sky-50 p-4">
              <h3 className="text-sm font-extrabold text-sky-900">Compliance note</h3>
              <p className="mt-1 text-[12px] text-sky-900/80">
                AI output is a draft. Editors must verify sources before publication. Generated
                content is never published automatically.
              </p>
            </div>
          </aside>
        </div>
      )}
    </div>
  )
}
