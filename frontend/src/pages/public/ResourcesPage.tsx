import { Link, useSearchParams } from 'react-router-dom'
import { FileText, Layers, Video as VideoIcon } from 'lucide-react'
import { documents, videos } from '../../data/content'
import { AdSlot } from '../../components/ui/AdSlot'
import { Breadcrumbs } from '../../components/ui/Breadcrumbs'
import { DocumentCard } from '../../components/content/DocumentCard'
import { VideoCard } from '../../components/content/VideoCard'

type Tab = 'all' | 'documents' | 'videos'

const tabs: { id: Tab; label: string; icon: typeof FileText }[] = [
  { id: 'all', label: 'All resources', icon: Layers },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'videos', label: 'Videos', icon: VideoIcon },
]

export function ResourcesPage() {
  const [params, setParams] = useSearchParams()
  const rawTab = params.get('tab')
  const tab: Tab = rawTab === 'documents' || rawTab === 'videos' ? rawTab : 'all'
  const activeCategory = params.get('category') ?? 'all'

  const docCategories = [...new Set(documents.map((doc) => doc.category))]
  const videoCategories = [...new Set(videos.map((video) => video.category))]
  const allCategories = [...new Set([...docCategories, ...videoCategories])]

  const shownDocs = documents.filter(
    (doc) => activeCategory === 'all' || doc.category === activeCategory,
  )
  const shownVideos = videos.filter(
    (video) => activeCategory === 'all' || video.category === activeCategory,
  )

  function setTab(next: Tab) {
    const nextParams = new URLSearchParams(params)
    if (next === 'all') nextParams.delete('tab')
    else nextParams.set('tab', next)
    setParams(nextParams)
  }

  function setCategory(next: string) {
    const nextParams = new URLSearchParams(params)
    if (next === 'all') nextParams.delete('category')
    else nextParams.set('category', next)
    setParams(nextParams)
  }

  return (
    <div className="fade-up">
      <div className="mt-5">
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Learning Centre' }]} />
      </div>

      <header
        className="mt-4 overflow-hidden rounded-card border border-line p-6 shadow-card sm:p-8"
        style={{
          background:
            'radial-gradient(60% 70% at 15% 15%, #ffffff 0%, transparent 70%), radial-gradient(50% 60% at 85% 0%, #e3f2fe 0%, transparent 70%), linear-gradient(180deg, #f7fbff 0%, #eaf4ff 100%)',
        }}
      >
        <p className="text-[12px] font-bold tracking-[0.08em] text-sky-700 uppercase">
          Learning Centre
        </p>
        <h1 className="mt-1 text-[30px] font-extrabold sm:text-[38px]">
          Documents and video lessons, in one place
        </h1>
        <p className="mt-2 max-w-[62ch] text-[16px] text-ink-soft">
          Read a document in the browser, download a guide for later, or watch a lesson without
          leaving FORUM24. Everything is free unless the publisher says otherwise.
        </p>
        <p className="mt-3 text-[13px] font-medium text-ink-muted">
          {documents.length} documents · {videos.length} videos
        </p>
      </header>

      {/* Tabs */}
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <div role="tablist" aria-label="Resource type" className="flex flex-wrap gap-1 rounded-control border border-line bg-panel p-1">
          {tabs.map((item) => {
            const Icon = item.icon
            const active = tab === item.id
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTab(item.id)}
                className={`inline-flex min-h-10 items-center gap-2 rounded-[9px] px-3 text-sm font-bold transition-colors ${
                  active ? 'bg-sky-600 text-white shadow-[inset_0_1px_0_rgb(255_255_255_/_0.35),0_2px_0_#0d3f7d]' : 'text-ink-soft hover:bg-sky-50 hover:text-sky-700'
                }`}
              >
                <Icon size={15} aria-hidden="true" />
                {item.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Category filter */}
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setCategory('all')}
          className={`rounded-full border px-3 py-1.5 text-[13px] font-semibold ${
            activeCategory === 'all'
              ? 'border-sky-300 bg-sky-100 text-sky-800'
              : 'border-line bg-panel text-ink-soft hover:border-sky-300 hover:bg-sky-50'
          }`}
        >
          All categories
        </button>
        {allCategories.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setCategory(category)}
            className={`rounded-full border px-3 py-1.5 text-[13px] font-semibold ${
              activeCategory === category
                ? 'border-sky-300 bg-sky-100 text-sky-800'
                : 'border-line bg-panel text-ink-soft hover:border-sky-300 hover:bg-sky-50'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {(tab === 'all' || tab === 'documents') && (
        <section className="mt-8">
          <div className="mb-4 flex items-end justify-between gap-3">
            <h2 className="text-[22px] font-extrabold">
              Documents{' '}
              <span className="text-sm font-semibold text-ink-muted">({shownDocs.length})</span>
            </h2>
            {tab === 'all' && (
              <Link to="/resources?tab=documents" className="text-sm font-bold text-sky-700 hover:underline">
                View all documents
              </Link>
            )}
          </div>
          {shownDocs.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {shownDocs.map((doc) => (
                <DocumentCard key={doc.slug} doc={doc} />
              ))}
            </div>
          ) : (
            <p className="rounded-card border border-line bg-panel p-6 text-sm text-ink-soft">
              No documents in this category yet.
            </p>
          )}
        </section>
      )}

      <AdSlot minHeight={110} hint="Resource listing placement · between sections" />

      {(tab === 'all' || tab === 'videos') && (
        <section className="mt-4">
          <div className="mb-4 flex items-end justify-between gap-3">
            <h2 className="text-[22px] font-extrabold">
              Videos <span className="text-sm font-semibold text-ink-muted">({shownVideos.length})</span>
            </h2>
            {tab === 'all' && (
              <Link to="/resources?tab=videos" className="text-sm font-bold text-sky-700 hover:underline">
                View all videos
              </Link>
            )}
          </div>
          {shownVideos.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {shownVideos.map((video) => (
                <VideoCard key={video.slug} video={video} />
              ))}
            </div>
          ) : (
            <p className="rounded-card border border-line bg-panel p-6 text-sm text-ink-soft">
              No videos in this category yet.
            </p>
          )}
        </section>
      )}
    </div>
  )
}
