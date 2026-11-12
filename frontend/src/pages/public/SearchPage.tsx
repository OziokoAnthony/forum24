import { Link, useSearchParams } from 'react-router-dom'
import { Search as SearchIcon } from 'lucide-react'
import { articles, categories, documents, videos } from '../../data/content'
import { ArticleCard } from '../../components/content/ArticleCard'
import { DocumentCard } from '../../components/content/DocumentCard'
import { VideoCard } from '../../components/content/VideoCard'
import { Breadcrumbs } from '../../components/ui/Breadcrumbs'

export function SearchPage() {
  const [params] = useSearchParams()
  const query = (params.get('q') ?? '').trim()
  const needle = query.toLowerCase()

  const matchedArticles = needle
    ? articles.filter((article) =>
        [article.title, article.standfirst, article.category, ...article.tags]
          .join(' ')
          .toLowerCase()
          .includes(needle),
      )
    : []
  const matchedDocs = needle
    ? documents.filter((doc) =>
        [doc.title, doc.description, doc.category, doc.format].join(' ').toLowerCase().includes(needle),
      )
    : []
  const matchedVideos = needle
    ? videos.filter((video) =>
        [video.title, video.description, video.category, video.provider]
          .join(' ')
          .toLowerCase()
          .includes(needle),
      )
    : []

  const total = matchedArticles.length + matchedDocs.length + matchedVideos.length

  return (
    <div className="fade-up">
      <div className="mt-5">
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Search' }]} />
      </div>

      <header className="mt-4">
        <h1 className="text-[30px] font-extrabold sm:text-[36px]">
          {query ? (
            <>
              Results for <span className="text-sky-700">“{query}”</span>
            </>
          ) : (
            'Search FORUM24'
          )}
        </h1>
        {query ? (
          <p className="mt-1 text-sm text-ink-muted">
            {total} {total === 1 ? 'result' : 'results'} across stories, documents and videos.
          </p>
        ) : (
          <p className="mt-1 text-sm text-ink-muted">
            Find a story, a video lesson or a downloadable guide.
          </p>
        )}
      </header>

      {!query && (
        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <div className="rounded-card border border-line bg-panel p-6 shadow-card">
            <h2 className="flex items-center gap-2 text-lg font-extrabold">
              <SearchIcon size={18} aria-hidden="true" className="text-sky-600" />
              Popular searches
            </h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {['AI', 'scholarships', 'AfCFTA', 'Super Eagles', 'web development', 'fintech'].map(
                (term) => (
                  <Link
                    key={term}
                    to={`/search?q=${encodeURIComponent(term)}`}
                    className="rounded-full border border-line bg-cloud px-3 py-1.5 text-[13px] font-semibold text-ink-soft hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700"
                  >
                    {term}
                  </Link>
                ),
              )}
            </div>
          </div>
          <div className="rounded-card border border-line bg-panel p-6 shadow-card">
            <h2 className="text-lg font-extrabold">Browse sections</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {categories.slice(0, 8).map((category) => (
                <Link
                  key={category.slug}
                  to={`/category/${category.slug}`}
                  className="rounded-full border border-line bg-cloud px-3 py-1.5 text-[13px] font-semibold text-ink-soft hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {query && total === 0 && (
        <div className="mt-6 rounded-card border border-line bg-panel p-10 text-center shadow-card">
          <h2 className="text-xl font-extrabold">No matches found</h2>
          <p className="mx-auto mt-2 max-w-[48ch] text-sm text-ink-soft">
            Try a shorter phrase, or browse the sections. Search covers article titles, tags,
            document names and video descriptions.
          </p>
          <Link
            to="/resources"
            className="mt-4 inline-flex min-h-11 items-center rounded-control btn-3d px-4 text-sm font-bold"
          >
            Browse the Learning Centre
          </Link>
        </div>
      )}

      {matchedArticles.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-4 text-[22px] font-extrabold">
            Stories <span className="text-sm font-semibold text-ink-muted">({matchedArticles.length})</span>
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {matchedArticles.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        </section>
      )}

      {matchedDocs.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 text-[22px] font-extrabold">
            Documents <span className="text-sm font-semibold text-ink-muted">({matchedDocs.length})</span>
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {matchedDocs.map((doc) => (
              <DocumentCard key={doc.slug} doc={doc} />
            ))}
          </div>
        </section>
      )}

      {matchedVideos.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 text-[22px] font-extrabold">
            Videos <span className="text-sm font-semibold text-ink-muted">({matchedVideos.length})</span>
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {matchedVideos.map((video) => (
              <VideoCard key={video.slug} video={video} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
