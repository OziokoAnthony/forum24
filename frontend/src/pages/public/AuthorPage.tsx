import { Link, useParams } from 'react-router-dom'
import { articles } from '../../data/content'
import { Breadcrumbs } from '../../components/ui/Breadcrumbs'
import { ArticleCard } from '../../components/content/ArticleCard'
import { NotFoundPage } from './NotFoundPage'

function slugify(value: string) {
  return value.toLowerCase().replace(/\s+/g, '-')
}

export function AuthorPage() {
  const { slug = '' } = useParams()
  const list = articles.filter((article) => slugify(article.author) === slug)
  const first = list[0]

  if (!first) return <NotFoundPage />

  const initials = first.author
    .split(' ')
    .map((part) => part[0])
    .join('')

  return (
    <div className="fade-up">
      <div className="mt-5">
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: first.author }]} />
      </div>

      <header className="mt-4 flex flex-col gap-4 rounded-card border border-line bg-panel p-6 shadow-card sm:flex-row sm:items-center sm:p-8">
        <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-sky-100 text-lg font-extrabold text-sky-800">
          {initials}
        </span>
        <div>
          <p className="text-[12px] font-bold tracking-[0.08em] text-sky-700 uppercase">Author</p>
          <h1 className="mt-1 text-[28px] font-extrabold">{first.author}</h1>
          <p className="text-sm font-semibold text-sky-700">{first.authorRole}</p>
          <p className="mt-1 max-w-[58ch] text-sm text-ink-soft">
            {list.length} {list.length === 1 ? 'story' : 'stories'} published on FORUM24. All
            work is edited and fact-checked before publication.
          </p>
        </div>
      </header>

      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((article) => (
          <ArticleCard key={article.slug} article={article} />
        ))}
      </div>

      <p className="mt-8 text-sm text-ink-muted">
        <Link to="/" className="font-semibold text-sky-700 hover:underline">
          ← Back to the homepage
        </Link>
      </p>
    </div>
  )
}
