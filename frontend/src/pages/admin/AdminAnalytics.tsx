import { StatCard } from '../../components/admin/StatCard'

const daily = [
  { day: 'Mon', value: 48 },
  { day: 'Tue', value: 61 },
  { day: 'Wed', value: 55 },
  { day: 'Thu', value: 74 },
  { day: 'Fri', value: 69 },
  { day: 'Sat', value: 83 },
  { day: 'Sun', value: 76 },
]

const topCategories = [
  { name: 'Nigeria News', views: 128400, share: 31 },
  { name: 'Technology & AI', views: 96200, share: 23 },
  { name: 'Business & Finance', views: 74100, share: 18 },
  { name: 'Sports', views: 58900, share: 14 },
  { name: 'Entertainment', views: 55800, share: 14 },
]

const sources = [
  { name: 'Google search', share: 58 },
  { name: 'Direct', share: 19 },
  { name: 'Social', share: 14 },
  { name: 'Newsletter', share: 6 },
  { name: 'Referral', share: 3 },
]

export function AdminAnalytics() {
  return (
    <div className="grid grid-cols-1 gap-5">
      <div>
        <h2 className="text-xl font-extrabold">Analytics</h2>
        <p className="text-sm text-ink-muted">
          Audience and content performance. Figures are illustrative until the API is connected.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Page views" value="412,908" delta="+8.4% vs last week" />
        <StatCard label="Unique visitors" value="186,204" delta="+5.1% vs last week" />
        <StatCard label="Avg. reading time" value="3m 42s" delta="+12s vs last week" />
        <StatCard label="Newsletter growth" value="+214" delta="This month" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <section className="rounded-card border border-line bg-panel p-5 shadow-card">
          <h3 className="text-base font-extrabold">Page views · last 7 days</h3>
          <div className="mt-4 flex h-48 items-end gap-2" role="img" aria-label="Daily page views for the last seven days">
            {daily.map((item) => (
              <div key={item.day} className="flex flex-1 flex-col items-center gap-1.5">
                <div className="flex w-full flex-1 items-end">
                  <div
                    className="w-full rounded-t-md bg-sky-500"
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
          <h3 className="text-base font-extrabold">Traffic sources</h3>
          <ul className="mt-3 grid gap-2.5">
            {sources.map((source) => (
              <li key={source.name}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-ink-soft">{source.name}</span>
                  <span className="font-bold tabular-nums">{source.share}%</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-mist">
                  <div className="h-full rounded-full bg-sky-500" style={{ width: `${source.share}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="rounded-card border border-line bg-panel p-5 shadow-card">
        <h3 className="text-base font-extrabold">Top categories</h3>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-cloud text-left text-[11px] tracking-[0.05em] text-ink-muted uppercase">
                <th className="px-3 py-2 font-bold">Category</th>
                <th className="px-3 py-2 text-right font-bold">Views</th>
                <th className="px-3 py-2 font-bold">Share</th>
              </tr>
            </thead>
            <tbody>
              {topCategories.map((category) => (
                <tr key={category.name} className="border-t border-line">
                  <td className="px-3 py-2.5 font-semibold text-ink">{category.name}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-ink-soft">{category.views.toLocaleString()}</td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-28 overflow-hidden rounded-full bg-mist">
                        <div className="h-full rounded-full bg-sky-500" style={{ width: `${category.share}%` }} />
                      </div>
                      <span className="text-[12px] font-semibold tabular-nums text-ink-muted">{category.share}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="text-xs text-ink-muted">
        Analytics is designed to work with a privacy-friendly provider. No personal data is sold,
        and consent is respected before any non-essential tracking.
      </p>
    </div>
  )
}
