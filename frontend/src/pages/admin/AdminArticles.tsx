import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Pencil, Plus, RefreshCw, Search } from 'lucide-react'
import type { ArticleStatus } from '../../data/content'
import { StatusPill } from '../../components/ui/StatusPill'
import { Button, buttonClass } from '../../components/ui/Button'
import { ApiError, apiEnabled } from '../../lib/api'
import {
  listAdminArticles,
  scheduleArticle,
  transitionArticle,
  type AdminArticleRecord,
  type ArticleAction,
  type TransitionResult,
} from '../../lib/adminApi'
import { demoAdminArticles } from '../../lib/adminMock'

type Filter = 'All' | ArticleStatus

const filters: Filter[] = [
  'All',
  'Draft',
  'Pending Review',
  'Approved',
  'Scheduled',
  'Published',
  'Archived',
]

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

/** A sensible default slot: tomorrow at 07:00 in the editor's timezone. */
function defaultScheduleValue(): string {
  const slot = new Date()
  slot.setDate(slot.getDate() + 1)
  slot.setHours(7, 0, 0, 0)
  return `${slot.getFullYear()}-${pad(slot.getMonth() + 1)}-${pad(slot.getDate())}T${pad(slot.getHours())}:${pad(slot.getMinutes())}`
}

function formatSlot(iso: string | null): string {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function AdminArticles() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState<Filter>('All')
  const [query, setQuery] = useState('')
  const [records, setRecords] = useState<AdminArticleRecord[]>(demoAdminArticles)
  const [loading, setLoading] = useState(apiEnabled)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<number | null>(null)
  const [scheduleTarget, setScheduleTarget] = useState<AdminArticleRecord | null>(null)
  const [scheduleValue, setScheduleValue] = useState('')
  const [scheduleError, setScheduleError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!apiEnabled) {
      setRecords(demoAdminArticles)
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const page = await listAdminArticles({ pageSize: 50 })
      setRecords(page.items)
    } catch (caught) {
      if (caught instanceof ApiError) {
        setError(caught.detail)
        if (caught.status === 401) navigate('/login', { replace: true })
      } else {
        setError('Could not load the article list.')
      }
    } finally {
      setLoading(false)
    }
  }, [navigate])

  useEffect(() => {
    void load()
  }, [load])

  const list = records.filter((article) => {
    const matchesStatus = filter === 'All' || article.status === filter
    const matchesQuery = article.title.toLowerCase().includes(query.trim().toLowerCase())
    return matchesStatus && matchesQuery
  })

  const pendingCount = useMemo(
    () => records.filter((article) => article.status === 'Pending Review').length,
    [records],
  )

  function applyTransition(result: TransitionResult) {
    setRecords((current) =>
      current.map((article) =>
        article.id === result.id
          ? {
              ...article,
              status: result.status,
              scheduledFor: result.scheduledFor,
              publishedAt: result.publishedAt,
            }
          : article,
      ),
    )
  }

  async function run(article: AdminArticleRecord, action: ArticleAction, message: string) {
    setBusyId(article.id)
    setError(null)
    setNotice(null)
    try {
      const result = await transitionArticle(article.id, action)
      applyTransition(result)
      setNotice(`“${article.title}” — ${message}`)
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.detail : 'The action failed.')
    } finally {
      setBusyId(null)
    }
  }

  function openSchedule(article: AdminArticleRecord) {
    setScheduleTarget(article)
    setScheduleValue(defaultScheduleValue())
    setScheduleError(null)
  }

  async function submitSchedule() {
    if (!scheduleTarget) return
    const when = new Date(scheduleValue)
    if (Number.isNaN(when.getTime())) {
      setScheduleError('Choose a valid date and time.')
      return
    }
    if (when.getTime() <= Date.now()) {
      setScheduleError('Pick a time in the future.')
      return
    }

    setBusyId(scheduleTarget.id)
    setScheduleError(null)
    try {
      const result = await scheduleArticle(scheduleTarget.id, when.toISOString())
      applyTransition(result)
      setNotice(`“${scheduleTarget.title}” scheduled for ${formatSlot(result.scheduledFor)}.`)
      setScheduleTarget(null)
    } catch (caught) {
      setScheduleError(caught instanceof ApiError ? caught.detail : 'Scheduling failed.')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="grid grid-cols-1 gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold">Articles</h2>
          <p className="text-sm text-ink-muted">
            {records.length} total · {pendingCount} awaiting review
            {!apiEnabled && ' · demo data'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {apiEnabled && (
            <Button variant="secondary" onClick={() => void load()} disabled={loading}>
              <RefreshCw size={15} aria-hidden="true" />
              Refresh
            </Button>
          )}
          <Link to="/admin/articles/new" className={buttonClass('primary')}>
            <Plus size={16} aria-hidden="true" />
            New article
          </Link>
        </div>
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-control border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-800"
        >
          {error}
        </p>
      )}
      {notice && (
        <p
          role="status"
          className="rounded-control border border-green-200 bg-green-50 px-3 py-2 text-sm font-semibold text-green-900"
        >
          {notice}
        </p>
      )}

      <div className="rounded-card border border-line bg-panel shadow-card">
        <div className="flex flex-wrap items-center gap-2 border-b border-line p-3">
          <div className="flex flex-wrap gap-1">
            {filters.map((item) => {
              const count =
                item === 'All'
                  ? records.length
                  : records.filter((article) => article.status === item).length
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setFilter(item)}
                  className={`rounded-full px-3 py-1.5 text-[13px] font-bold transition-colors ${
                    filter === item
                      ? 'bg-sky-100 text-sky-800'
                      : 'text-ink-soft hover:bg-sky-50 hover:text-sky-700'
                  }`}
                >
                  {item} <span className="font-semibold text-ink-muted">{count}</span>
                </button>
              )
            })}
          </div>

          <div className="ml-auto flex min-h-10 min-w-[220px] items-center gap-2 rounded-control border border-line bg-cloud px-3 text-sm">
            <Search size={15} aria-hidden="true" className="text-ink-muted" />
            <input
              aria-label="Search articles"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by title"
              className="w-full border-0 bg-transparent p-0 text-sm focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-cloud text-left text-[11px] tracking-[0.05em] text-ink-muted uppercase">
                <th className="px-4 py-2.5 font-bold">Title</th>
                <th className="px-4 py-2.5 font-bold">Status</th>
                <th className="px-4 py-2.5 font-bold">Author</th>
                <th className="px-4 py-2.5 font-bold">AI draft</th>
                <th className="px-4 py-2.5 text-right font-bold">Views</th>
                <th className="px-4 py-2.5 font-bold">Updated</th>
                <th className="px-4 py-2.5 text-right font-bold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((article) => {
                const busy = busyId === article.id
                return (
                  <tr key={article.id} className="border-t border-line hover:bg-sky-50">
                    <td className="max-w-[380px] px-4 py-3">
                      <p className="line-clamp-2 font-semibold text-ink">{article.title}</p>
                      <p className="mt-0.5 text-[12px] text-ink-muted">{article.category}</p>
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill status={article.status} />
                      {article.status === 'Scheduled' && article.scheduledFor && (
                        <p className="mt-1 text-[11px] text-ink-muted">
                          Goes live {formatSlot(article.scheduledFor)}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-ink-soft">{article.author}</td>
                    <td className="px-4 py-3">
                      {article.aiDraft ? (
                        <span className="rounded-full bg-sky-50 px-2 py-0.5 text-[11px] font-bold text-sky-800">
                          AI-assisted
                        </span>
                      ) : (
                        <span className="text-[12px] text-ink-muted">Human-written</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-ink-soft">
                      {article.views ? article.views.toLocaleString() : '—'}
                    </td>
                    <td className="px-4 py-3 text-[13px] text-ink-muted">{article.updated}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center justify-end gap-1.5">
                        {apiEnabled && (article.status === 'Draft' || article.status === 'Archived') && (
                          <ActionButton
                            label="Submit"
                            title="Submit for review"
                            disabled={busy}
                            onClick={() => void run(article, 'submit-review', 'submitted for review.')}
                          />
                        )}
                        {apiEnabled && article.status === 'Pending Review' && (
                          <>
                            <ActionButton
                              label="Approve"
                              disabled={busy}
                              onClick={() => void run(article, 'approve', 'approved.')}
                            />
                            <ActionButton
                              label="Send back"
                              disabled={busy}
                              onClick={() => void run(article, 'reject', 'sent back to draft.')}
                            />
                          </>
                        )}
                        {apiEnabled && article.status === 'Approved' && (
                          <>
                            <ActionButton
                              label="Schedule"
                              disabled={busy}
                              onClick={() => openSchedule(article)}
                            />
                            <ActionButton
                              label="Publish now"
                              disabled={busy}
                              onClick={() => void run(article, 'publish', 'published.')}
                            />
                          </>
                        )}
                        {apiEnabled && article.status === 'Scheduled' && (
                          <ActionButton
                            label="Unschedule"
                            disabled={busy}
                            onClick={() => void run(article, 'unschedule', 'moved back to approved.')}
                          />
                        )}
                        <Link
                          to={`/admin/articles/${article.id}`}
                          className="inline-flex items-center gap-1 rounded-control border border-line bg-panel px-2.5 py-1.5 text-[12px] font-bold text-sky-700 hover:bg-sky-50"
                        >
                          <Pencil size={12} aria-hidden="true" />
                          Edit
                        </Link>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {loading && records.length === 0 && (
          <div className="p-8 text-center text-sm text-ink-muted">Loading articles…</div>
        )}

        {!loading && list.length === 0 && (
          <div className="p-8 text-center">
            <p className="text-sm font-semibold text-ink">No articles match this filter.</p>
            <button
              type="button"
              onClick={() => {
                setFilter('All')
                setQuery('')
              }}
              className="mt-2 text-sm font-bold text-sky-700 hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {!apiEnabled && (
        <p className="rounded-control border border-line bg-cloud px-3 py-2 text-xs text-ink-muted">
          Demo data. Set <code className="font-bold">VITE_API_URL</code> to sign in and run
          editorial actions against the API.
        </p>
      )}

      <p className="text-xs text-ink-muted">
        AI-assisted articles cannot be published until an editor with the right role approves
        them. Scheduling is only available after approval, and every status change is written to
        the audit log.
      </p>

      {scheduleTarget && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="schedule-title"
        >
          <div className="w-full max-w-sm rounded-card border border-line bg-panel p-5 shadow-card">
            <h2 id="schedule-title" className="text-lg font-extrabold">
              Schedule “{scheduleTarget.title}”
            </h2>
            <p className="mt-1 text-sm text-ink-soft">
              The article is already approved. It will go live automatically when the slot
              passes.
            </p>

            <label htmlFor="schedule-when" className="mt-4 block text-sm font-bold text-ink">
              Publish at
            </label>
            <input
              id="schedule-when"
              type="datetime-local"
              value={scheduleValue}
              onChange={(event) => setScheduleValue(event.target.value)}
              className="mt-1 w-full rounded-control border border-line bg-panel px-3 py-2 text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-500/25 focus:outline-none"
            />
            <p className="mt-1 text-xs text-ink-muted">Shown in your local time.</p>

            {scheduleError && (
              <p
                role="alert"
                className="mt-3 rounded-control border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-800"
              >
                {scheduleError}
              </p>
            )}

            <div className="mt-5 flex justify-end gap-2">
              <Button
                variant="secondary"
                onClick={() => setScheduleTarget(null)}
                disabled={busyId === scheduleTarget.id}
              >
                Cancel
              </Button>
              <Button
                onClick={() => void submitSchedule()}
                disabled={busyId === scheduleTarget.id}
              >
                {busyId === scheduleTarget.id ? 'Scheduling…' : 'Schedule'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ActionButton({
  label,
  title,
  disabled,
  onClick,
}: {
  label: string
  title?: string
  disabled: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      title={title ?? label}
      disabled={disabled}
      onClick={onClick}
      className="rounded-control border border-line bg-panel px-2.5 py-1.5 text-[12px] font-bold text-sky-700 transition-colors hover:bg-sky-50 disabled:pointer-events-none disabled:opacity-50"
    >
      {label}
    </button>
  )
}
