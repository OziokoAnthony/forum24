import { Link } from 'react-router-dom'
import type { Article } from '../../data/content'
import { Chip } from '../ui/Chip'
import { Cover } from '../ui/Cover'

export function ArticleCard({
  article,
  showStandfirst = true,
}: {
  article: Article
  showStandfirst?: boolean
}) {
  return (
    <article className="group overflow-hidden rounded-card border border-line bg-panel shadow-card hover:shadow-card-hover lift">
      <Link to={`/news/${article.slug}`} tabIndex={-1} aria-hidden="true" className="block">
        <Cover tone={article.cover} className="aspect-video" />
      </Link>
      <div className="p-5">
        <Chip>{article.category}</Chip>
        <h3 className="mt-2.5 text-[17px] leading-snug font-bold">
          <Link to={`/news/${article.slug}`} className="text-ink hover:text-sky-700">
            {article.title}
          </Link>
        </h3>
        {showStandfirst && (
          <p className="mt-2 line-clamp-2 text-sm text-ink-soft">{article.standfirst}</p>
        )}
        <p className="mt-3 text-[13px] font-medium text-ink-muted">
          {article.author} <span aria-hidden="true">·</span> {article.date}{' '}
          <span aria-hidden="true">·</span> {article.readingTime} min read
        </p>
      </div>
    </article>
  )
}
