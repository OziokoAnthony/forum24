import { Link } from 'react-router-dom'
import { ArrowUpRight, CheckCircle2, RefreshCw, TriangleAlert } from 'lucide-react'
import { adminArticles, adminStats, articles } from '../../data/content'
import { StatCard } from '../../components/admin/StatCard'
import { StatusPill } from '../../components/ui/StatusPill'

const views = [
  { day: 'Mon', value: 42 },
  { day: 'Tue', value: 58 },
  { day: 'Wed', value: 49 },
  { day: 'Thu', value: 72 },
  { day: 'Fri', value: 66 },
  { day: 'Sat', value: 81 },
  { day: 'Sun', value: 74 },
]

const activity = [
  { text: 'Adaeze Okonkwo approved “Nigeria’s AI startups…”', time: '09:42' },
  { text: 'AI research task #4821 completed with 6 sources', time: '09:20' },
  { text: 'Tunde Bakare submitted “AfCFTA enters a new phase…” for review', time: '08:10' },
  { text: 'Halima Bello scheduled “2027 scholarship round opens…”', time: 'Yesterday' },
  { text: 'Video processing failed for “Afrobeats Production Breakdown”', time: 'Yesterday' },
]

export function AdminOverview() {
  const mostRead = [...articles].sort((a, b) => b.views - a.views).slice(0, 5)

  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {adminStats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="grid gap-6">
          <section className="rounded-card border border-line bg-panel p-5 shadow-card">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div>
                <h2 className="text-lg font-extrabold">Page views</h2>
                <p className="text-sm text-ink-muted">Last 7 days · all published content</p>
              </div>
              <p className="text-2xl font-extrabold tabular-nums">
                412,908 <span className="text-sm font-semibold text-green-700">+8.4%</span>
              </p>
            </div>

            <div className="mt-5 flex h-40 items-end gap-2" role="img" aria-label="Page views for the last seven days">
              {views.map((item) => (
                <div key={item.day} className="flex flex-1 flex-col items-center gap-1.5">
                  <div className="flex w-full flex-1 items-end">
                    <div
                      className="w-full rounded-t-md bg-sky-500 transition-[height] duration-500"
                      style={{ height: `${item.value}%` }}
                      title={`${item.day}: ${item.value}k views`}
                    />
                  </div>
                  <span className="text-[11px] font-semibold text-ink-muted">{item.day}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-card border border-line bg-panel p-5 shadow-card">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold">Most read</h2>
              <Link to="/admin/articles" className="inline-flex items-center gap-1 text-sm font-bold text-sky-700 hover:underline">
                All articles <ArrowUpRight size={14} aria-hidden="true" />
              </Link>
            </div>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="text-left text-[11px] tracking-[0.05em] text-ink-muted uppercase">
                    <th className="py-2 pr-3 font-bold">Article</th>
                    <th className="px-3 py-2 font-bold">Status</th>
                    <th className="py-2 pl-3 text-right font-bold">Views</th>
                  </tr>
                </thead>
                <tbody>
                  {mostRead.map((article) => (
                    <tr key={article.slug} className="border-t border-line">
                      <td className="max-w-[380px] py-2.5 pr-3">
                        <Link to={`/news/${article.slug}`} className="line-clamp-1 font-semibold text-ink hover:text-sky-700">
                          {article.title}
                        </Link>
                      </td>
                      <td className="px-3 py-2.5">
                        <StatusPill status="Published" />
                      </td>
                      <td className="py-2.5 pl-3 text-right font-semibold tabular-nums">
                        {article.views.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <div className="grid gap-6">
          <section className="rounded-card border border-line bg-panel p-5 shadow-card">
            <h2 className="text-lg font-extrabold">AI task health</h2>
            <p className="text-sm text-ink-muted">Today · all functions</p>

            <div className="mt-4 grid gap-3">
              <div className="flex items-center justify-between rounded-control bg-green-50 px-3 py-2.5">
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-green-800">
                  <CheckCircle2 size={16} aria-hidden="true" />
                  Completed
                </span>
                <span className="font-extrabold tabular-nums text-green-900">1,284</span>
              </div>
              <div className="flex items-center justify-between rounded-control bg-red-50 px-3 py-2.5">
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-red-800">
                  <TriangleAlert size={16} aria-hidden="true" />
                  Failed
                </span>
                <span className="font-extrabold tabular-nums text-red-900">37</span>
              </div>
              <div className="flex items-center justify-between rounded-control bg-sky-50 px-3 py-2.5">
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-sky-800">
                  <RefreshCw size={16} aria-hidden="true" />
                  Retried
                </span>
                <span className="font-extrabold tabular-nums text-sky-900">12</span>
              </div>
            </div>

            <Link
              to="/admin/ai"
              className="mt-4 inline-flex min-h-10 w-full items-center justify-center rounded-control btn-3d px-3 text-sm font-bold"
            >
              Open the AI desk
            </Link>
          </section>

          <section className="rounded-card border border-line bg-panel p-5 shadow-card">
            <h2 className="text-lg font-extrabold">Latest activity</h2>
            <ul className="mt-3 grid gap-3">
              {activity.map((item) => (
                <li key={item.text} className="flex gap-2.5 text-sm">
                  <span aria-hidden="true" className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-400" />
                  <span>
                    <span className="text-ink-soft">{item.text}</span>
                    <span className="mt-0.5 block text-[11px] font-medium text-ink-muted">{item.time}</span>
                  </span>
                </li>
              ))}
            </ul>
            <Link to="/admin/settings" className="mt-3 inline-block text-sm font-bold text-sky-700 hover:underline">
              View the audit log →
            </Link>
          </section>
        </div>
      </div>

      <section className="rounded-card border border-line bg-panel p-5 shadow-card">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold">Needs attention</h2>
          <Link to="/admin/articles" className="text-sm font-bold text-sky-700 hover:underline">
            Review queue
          </Link>
        </div>
        <div className="mt-3 grid grid-cols-1 gap-2">
          {adminArticles
            .filter((article) => article.status === 'Pending Review' || article.status === 'Draft')
            .map((article) => (
              <div
                key={article.id}
                className="flex flex-wrap items-center gap-3 rounded-control border border-line bg-cloud px-3 py-2.5"
              >
                <StatusPill status={article.status} />
                <span className="min-w-0 flex-1 truncate text-sm font-semibold text-ink">{article.title}</span>
                <span className="text-[12px] font-medium text-ink-muted">{article.updated}</span>
                <Link
                  to={`/admin/articles/${article.id}`}
                  className="rounded-control border border-line bg-panel px-2.5 py-1.5 text-[12px] font-bold text-sky-700 hover:bg-sky-50"
                >
                  Open
                </Link>
              </div>
            ))}
        </div>
      </section>
    </div>
  )
}
