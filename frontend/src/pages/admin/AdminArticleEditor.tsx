import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Eye, ImagePlus, Save, Send, Sparkles } from 'lucide-react'
import { adminArticles, categories, type ArticleBlock } from '../../data/content'
import { Button, buttonClass } from '../../components/ui/Button'
import { StatusPill } from '../../components/ui/StatusPill'
import { ApiError, apiEnabled } from '../../lib/api'
import {
  createArticle,
  getAdminArticle,
  scheduleArticle,
  transitionArticle,
  updateArticle,
  type AdminArticleRecord,
  type ArticleAction,
  type ArticleWritePayload,
} from '../../lib/adminApi'
import { adminArticleFromMock } from '../../lib/adminMock'

const categoryNames = categories.map((category) => category.name)

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

function defaultScheduleValue(): string {
  const slot = new Date()
  slot.setDate(slot.getDate() + 1)
  slot.setHours(7, 0, 0, 0)
  return `${slot.getFullYear()}-${pad(slot.getMonth() + 1)}-${pad(slot.getDate())}T${pad(slot.getHours())}:${pad(slot.getMinutes())}`
}

/** Flatten API blocks into the plain-text canvas the editor shows. */
function blocksToText(blocks: ArticleBlock[]): string {
  return blocks
    .map((block) => {
      if (block.type === 'h2') return `## ${block.text}`
      if (block.type === 'quote') return `> ${block.text}`
      if (block.type === 'list') return block.items.map((item) => `- ${item}`).join('\n')
      return block.text
    })
    .join('\n\n')
}

/**
 * Convert the canvas back to blocks.
 *
 * `## ` becomes a subheading, `> ` a quote, and runs of `- ` lines one list.
 * Everything else is a paragraph, which is enough to round-trip the demo
 * content without turning the editor into a rich-text component.
 */
function textToBlocks(text: string): ArticleBlock[] {
  const blocks: ArticleBlock[] = []
  let listItems: string[] = []

  function flushList() {
    if (listItems.length > 0) {
      blocks.push({ type: 'list', items: listItems })
      listItems = []
    }
  }

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line) {
      flushList()
      continue
    }
    if (line.startsWith('- ')) {
      listItems.push(line.slice(2).trim())
      continue
    }
    flushList()
    if (line.startsWith('## ')) {
      blocks.push({ type: 'h2', text: line.slice(3).trim() })
    } else if (line.startsWith('> ')) {
      blocks.push({ type: 'quote', text: line.slice(2).trim() })
    } else {
      blocks.push({ type: 'p', text: line })
    }
  }
  flushList()
  return blocks
}

export function AdminArticleEditor() {
  const { id = 'new' } = useParams()
  const navigate = useNavigate()

  const [record, setRecord] = useState<AdminArticleRecord | null>(null)
  const [loading, setLoading] = useState(apiEnabled && id !== 'new')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const [title, setTitle] = useState('')
  const [standfirst, setStandfirst] = useState('')
  const [bodyText, setBodyText] = useState(
    'Start writing, or open the AI desk to generate an editable draft. Nothing is published until an editor approves it.\n\n',
  )
  const [category, setCategory] = useState('Nigeria News')
  const [tags, setTags] = useState('')
  const [slug, setSlug] = useState('')
  const [seoTitle, setSeoTitle] = useState('')
  const [seoDescription, setSeoDescription] = useState('')
  const [scheduleValue, setScheduleValue] = useState(defaultScheduleValue())
  const [scheduleError, setScheduleError] = useState<string | null>(null)

  const applyRecord = useCallback((next: AdminArticleRecord) => {
    setRecord(next)
    setTitle(next.title)
    setStandfirst(next.standfirst)
    setBodyText(blocksToText(next.body))
    setCategory(next.category)
    setTags(next.tags.join(', '))
    setSlug(next.slug)
    setSeoTitle(next.seoTitle ?? '')
    setSeoDescription(next.seoDescription ?? '')
  }, [])

  useEffect(() => {
    setError(null)
    setNotice(null)

    function resetForm() {
      setRecord(null)
      setTitle('')
      setStandfirst('')
      setBodyText(
        'Start writing, or open the AI desk to generate an editable draft. Nothing is published until an editor approves it.\n\n',
      )
      setCategory('Nigeria News')
      setTags('')
      setSlug('')
      setSeoTitle('')
      setSeoDescription('')
    }

    if (!apiEnabled) {
      const mock = adminArticles.find((article) => String(article.id) === id)
      if (mock) {
        const mapped = adminArticleFromMock(mock)
        setRecord(mapped)
        setTitle(mapped.title)
        setCategory(mapped.category)
        setSlug(mapped.slug)
      } else {
        resetForm()
      }
      setLoading(false)
      return
    }

    if (id === 'new') {
      resetForm()
      setLoading(false)
      return
    }

    const articleId = Number(id)
    if (!Number.isInteger(articleId) || articleId <= 0) {
      setError('That article id is not valid.')
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    getAdminArticle(articleId)
      .then((next) => {
        if (!cancelled) applyRecord(next)
      })
      .catch((caught) => {
        if (cancelled) return
        if (caught instanceof ApiError) {
          setError(caught.detail)
          if (caught.status === 401) navigate('/login', { replace: true })
        } else {
          setError('Could not load this article.')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [id, applyRecord, navigate])

  const words = bodyText.trim() ? bodyText.trim().split(/\s+/).length : 0
  const status = record?.status ?? 'Draft'

  function payload(): ArticleWritePayload {
    return {
      title: title.trim(),
      standfirst: standfirst.trim(),
      body: textToBlocks(bodyText),
      category,
      tags: tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
      seoTitle: seoTitle.trim() || null,
      seoDescription: seoDescription.trim() || null,
    }
  }

  async function saveDraft() {
    setError(null)
    setNotice(null)
    setScheduleError(null)

    if (!apiEnabled) {
      setSaved(true)
      window.setTimeout(() => setSaved(false), 2500)
      return
    }

    if (title.trim().length < 5) {
      setError('The headline needs at least 5 characters before it can be saved.')
      return
    }

    setBusy(true)
    try {
      if (id === 'new') {
        const created = await createArticle(payload())
        setNotice('Draft created.')
        navigate(`/admin/articles/${created.id}`, { replace: true })
      } else {
        const updated = await updateArticle(Number(id), payload())
        applyRecord(updated)
        setNotice('Changes saved.')
        setSaved(true)
        window.setTimeout(() => setSaved(false), 2500)
      }
    } catch (caught) {
      if (caught instanceof ApiError) {
        setError(caught.detail)
        if (caught.status === 401) navigate('/login', { replace: true })
      } else {
        setError('Could not save the article.')
      }
    } finally {
      setBusy(false)
    }
  }

  async function run(action: ArticleAction, message: string) {
    if (!record) return
    setBusy(true)
    setError(null)
    setNotice(null)
    try {
      const result = await transitionArticle(record.id, action)
      setRecord({ ...record, status: result.status, scheduledFor: result.scheduledFor })
      setNotice(message)
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.detail : 'The action failed.')
    } finally {
      setBusy(false)
    }
  }

  async function submitSchedule() {
    if (!record) return
    const when = new Date(scheduleValue)
    if (Number.isNaN(when.getTime())) {
      setScheduleError('Choose a valid date and time.')
      return
    }
    if (when.getTime() <= Date.now()) {
      setScheduleError('Pick a time in the future.')
      return
    }

    setBusy(true)
    setScheduleError(null)
    try {
      const result = await scheduleArticle(record.id, when.toISOString())
      setRecord({ ...record, status: result.status, scheduledFor: result.scheduledFor })
      setNotice('Article scheduled. It will publish automatically when the slot passes.')
    } catch (caught) {
      setScheduleError(caught instanceof ApiError ? caught.detail : 'Scheduling failed.')
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return <p className="py-10 text-center text-sm text-ink-muted">Loading article…</p>
  }

  const previewSlug = record?.slug ?? ''

  return (
    <div className="grid grid-cols-1 gap-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <StatusPill status={status} />
          <span className="text-[12px] font-medium text-ink-muted">
            {words} words{record?.updated ? ` · updated ${record.updated}` : ''}
          </span>
        </div>
        <div className="ml-auto flex flex-wrap gap-2">
          <Link
            to={previewSlug ? `/news/${previewSlug}` : '/'}
            target="_blank"
            rel="noreferrer"
            className={buttonClass('secondary')}
          >
            <Eye size={15} aria-hidden="true" />
            Preview
          </Link>
          <Button variant="secondary" onClick={() => void saveDraft()} disabled={busy}>
            <Save size={15} aria-hidden="true" />
            {saved ? 'Saved' : record ? 'Save changes' : 'Create draft'}
          </Button>
          {apiEnabled && record && (status === 'Draft' || status === 'Archived') && (
            <Button onClick={() => void run('submit-review', 'Submitted for review.')} disabled={busy}>
              <Send size={15} aria-hidden="true" />
              Submit for review
            </Button>
          )}
          {apiEnabled && record && status === 'Pending Review' && (
            <>
              <Button
                variant="secondary"
                onClick={() => void run('reject', 'Sent back to draft.')}
                disabled={busy}
              >
                Send back
              </Button>
              <Button onClick={() => void run('approve', 'Approved.')} disabled={busy}>
                Approve
              </Button>
            </>
          )}
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

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_330px]">
        {/* Writing canvas */}
        <div className="grid gap-4">
          <div className="rounded-card border border-line bg-panel p-5 shadow-card">
            <label htmlFor="article-title" className="text-[12px] font-bold tracking-[0.05em] text-ink-muted uppercase">
              Headline
            </label>
            <input
              id="article-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Write a clear, specific headline"
              className="mt-1 w-full rounded-control border border-line bg-panel px-3 py-2.5 text-[22px] font-extrabold focus:border-sky-400 focus:ring-2 focus:ring-sky-500/25 focus:outline-none"
            />

            <label htmlFor="article-standfirst" className="mt-4 block text-[12px] font-bold tracking-[0.05em] text-ink-muted uppercase">
              Standfirst / summary
            </label>
            <textarea
              id="article-standfirst"
              value={standfirst}
              onChange={(event) => setStandfirst(event.target.value)}
              rows={2}
              placeholder="One or two sentences that tell the reader why this matters."
              className="mt-1 w-full rounded-control border border-line bg-panel px-3 py-2 text-[15px] focus:border-sky-400 focus:ring-2 focus:ring-sky-500/25 focus:outline-none"
            />

            <label htmlFor="article-body" className="mt-4 block text-[12px] font-bold tracking-[0.05em] text-ink-muted uppercase">
              Body
            </label>
            <textarea
              id="article-body"
              value={bodyText}
              onChange={(event) => setBodyText(event.target.value)}
              rows={18}
              className="mt-1 w-full rounded-control border border-line bg-panel px-3 py-3 font-[inherit] text-[16px] leading-relaxed focus:border-sky-400 focus:ring-2 focus:ring-sky-500/25 focus:outline-none"
            />
            <p className="mt-1 text-[12px] text-ink-muted">
              Target 700–1,200 words. Start a line with <code>##</code> for a subheading,{' '}
              <code>&gt;</code> for a pull quote, or <code>-</code> for a list item. Every claim
              needs a source the editor can open.
            </p>
          </div>

          <div className="rounded-card border border-line bg-panel p-5 shadow-card">
            <div className="flex items-center gap-2">
              <Sparkles size={16} aria-hidden="true" className="text-sky-600" />
              <h2 className="text-base font-extrabold">AI suggestions</h2>
              <span className="rounded-full bg-sky-50 px-2 py-0.5 text-[11px] font-bold text-sky-800">
                Draft only
              </span>
            </div>
            <ul className="mt-3 grid gap-2 text-sm text-ink-soft">
              <li className="rounded-control bg-cloud px-3 py-2">
                Add a section on what the new policy means for small publishers.
              </li>
              <li className="rounded-control bg-cloud px-3 py-2">
                Two claims in paragraph 4 need a primary source before review.
              </li>
              <li className="rounded-control bg-cloud px-3 py-2">
                Suggested internal link: “AfCFTA enters a new phase…” (Africa section).
              </li>
            </ul>
            <Link to="/admin/ai" className="mt-3 inline-block text-sm font-bold text-sky-700 hover:underline">
              Open the AI desk →
            </Link>
          </div>
        </div>

        {/* Inspector */}
        <aside className="grid content-start gap-4">
          <section className="rounded-card border border-line bg-panel p-4 shadow-card">
            <h2 className="text-sm font-extrabold tracking-[0.04em] text-ink-muted uppercase">Publish</h2>
            <dl className="mt-3 grid gap-2 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-ink-muted">Status</dt>
                <dd><StatusPill status={status} /></dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-ink-muted">Visibility</dt>
                <dd className="font-semibold">Public</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-ink-muted">Publish date</dt>
                <dd className="text-right font-semibold">
                  {status === 'Scheduled' && record?.scheduledFor
                    ? new Date(record.scheduledFor).toLocaleString(undefined, {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : record?.publishedAt
                      ? 'Published'
                      : 'Not yet'}
                </dd>
              </div>
            </dl>

            {!apiEnabled && (
              <p className="mt-3 rounded-control bg-amber-50 px-3 py-2 text-[12px] font-medium text-amber-800">
                Demo mode — connect <code>VITE_API_URL</code> to publish for real.
              </p>
            )}

            {apiEnabled && status === 'Approved' && (
              <div className="mt-3 grid gap-2">
                <label htmlFor="editor-schedule" className="text-[12px] font-bold text-ink">
                  Schedule publication
                </label>
                <input
                  id="editor-schedule"
                  type="datetime-local"
                  value={scheduleValue}
                  onChange={(event) => setScheduleValue(event.target.value)}
                  className="w-full rounded-control border border-line bg-panel px-2.5 py-2 text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-500/25 focus:outline-none"
                />
                {scheduleError && (
                  <p role="alert" className="text-[12px] font-semibold text-red-800">
                    {scheduleError}
                  </p>
                )}
                <Button variant="secondary" onClick={() => void submitSchedule()} disabled={busy}>
                  Schedule
                </Button>
                <Button onClick={() => void run('publish', 'Published.')} disabled={busy}>
                  Publish now
                </Button>
              </div>
            )}

            {apiEnabled && status === 'Scheduled' && (
              <div className="mt-3 grid gap-2">
                <p className="rounded-control bg-sky-50 px-3 py-2 text-[12px] font-medium text-sky-900">
                  Approved and queued. The publisher will move it live automatically.
                </p>
                <Button
                  variant="secondary"
                  onClick={() => void run('unschedule', 'Unscheduled and moved back to approved.')}
                  disabled={busy}
                >
                  Unschedule
                </Button>
              </div>
            )}

            {apiEnabled && status === 'Pending Review' && (
              <p className="mt-3 rounded-control bg-amber-50 px-3 py-2 text-[12px] font-medium text-amber-800">
                Waiting for an editor’s approval. A human must approve before this can publish.
              </p>
            )}

            {apiEnabled && (status === 'Published' || status === 'Archived') && (
              <p className="mt-3 rounded-control bg-cloud px-3 py-2 text-[12px] font-medium text-ink-muted">
                {status === 'Published'
                  ? 'This article is live. Saving changes updates the public copy.'
                  : 'This article is archived and hidden from the public site.'}
              </p>
            )}
          </section>

          <section className="rounded-card border border-line bg-panel p-4 shadow-card">
            <h2 className="text-sm font-extrabold tracking-[0.04em] text-ink-muted uppercase">SEO</h2>

            <label htmlFor="seo-title" className="mt-3 block text-[12px] font-bold text-ink">
              SEO title
            </label>
            <input
              id="seo-title"
              value={seoTitle}
              onChange={(event) => setSeoTitle(event.target.value)}
              className="mt-1 w-full rounded-control border border-line bg-panel px-2.5 py-2 text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-500/25 focus:outline-none"
            />
            <p className={`mt-1 text-[11px] ${seoTitle.length > 60 ? 'font-bold text-red-700' : 'text-ink-muted'}`}>
              {seoTitle.length}/60 characters
            </p>

            <label htmlFor="seo-description" className="mt-3 block text-[12px] font-bold text-ink">
              Meta description
            </label>
            <textarea
              id="seo-description"
              value={seoDescription}
              onChange={(event) => setSeoDescription(event.target.value)}
              rows={3}
              className="mt-1 w-full rounded-control border border-line bg-panel px-2.5 py-2 text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-500/25 focus:outline-none"
            />
            <p className={`mt-1 text-[11px] ${seoDescription.length > 155 ? 'font-bold text-red-700' : 'text-ink-muted'}`}>
              {seoDescription.length}/155 characters
            </p>

            <label htmlFor="seo-slug" className="mt-3 block text-[12px] font-bold text-ink">
              URL slug
            </label>
            <input
              id="seo-slug"
              value={slug}
              readOnly
              placeholder="auto-from-title"
              className="mt-1 w-full rounded-control border border-line bg-cloud px-2.5 py-2 text-sm text-ink-muted focus:outline-none"
            />
            <p className="mt-1 text-[11px] text-ink-muted">
              /news/{slug || 'auto-from-title'}
            </p>
          </section>

          <section className="rounded-card border border-line bg-panel p-4 shadow-card">
            <h2 className="text-sm font-extrabold tracking-[0.04em] text-ink-muted uppercase">
              Category &amp; tags
            </h2>
            <label htmlFor="article-category" className="mt-3 block text-[12px] font-bold text-ink">
              Category
            </label>
            <select
              id="article-category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="mt-1 w-full rounded-control border border-line bg-panel px-2.5 py-2 text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-500/25 focus:outline-none"
            >
              {categoryNames.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>

            <label htmlFor="article-tags" className="mt-3 block text-[12px] font-bold text-ink">
              Tags
            </label>
            <input
              id="article-tags"
              value={tags}
              onChange={(event) => setTags(event.target.value)}
              placeholder="AI, startups, Nigeria"
              className="mt-1 w-full rounded-control border border-line bg-panel px-2.5 py-2 text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-500/25 focus:outline-none"
            />
            <p className="mt-1 text-[11px] text-ink-muted">Comma-separated.</p>
          </section>

          <section className="rounded-card border border-line bg-panel p-4 shadow-card">
            <h2 className="text-sm font-extrabold tracking-[0.04em] text-ink-muted uppercase">
              Featured image
            </h2>
            <button
              type="button"
              className="mt-3 flex w-full flex-col items-center gap-1 rounded-control border border-dashed border-line-strong bg-cloud px-3 py-6 text-ink-muted hover:border-sky-400 hover:text-sky-700"
            >
              <ImagePlus size={22} aria-hidden="true" />
              <span className="text-sm font-bold">Upload a cover</span>
              <span className="text-[11px]">JPG, PNG or WebP · 1200 × 630 recommended</span>
            </button>
            <p className="mt-2 text-[11px] text-ink-muted">
              Alt text is required before the article can be submitted.
            </p>
          </section>
        </aside>
      </div>
    </div>
  )
}
