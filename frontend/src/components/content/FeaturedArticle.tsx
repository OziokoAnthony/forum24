import { Link } from 'react-router-dom'
import { Star } from 'lucide-react'
import type { Article } from '../../data/content'
import { Chip } from '../ui/Chip'
import { Cover } from '../ui/Cover'

export function FeaturedArticle({ article }: { article: Article }) {
  return (
    <article className="tilt-3d relative overflow-hidden rounded-card border border-white/10 shadow-slab-deep">
      <div className="absolute inset-0">
        <Cover tone={article.cover} className="h-full w-full" />
      </div>
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-linear-to-t from-navy-deep/90 via-navy-deep/30 to-transparent"
      />
      <div className="relative flex min-h-[380px] flex-col justify-end p-6 text-white sm:p-8">
        <div className="badge-3d absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-extrabold tracking-[0.14em] uppercase">
          <Star size={11} aria-hidden="true" className="fill-current" />
          Featured
        </div>
        <div>
          <Chip tone="white">{article.category}</Chip>
        </div>
        <h1 className="mt-3 max-w-[24ch] text-[26px] leading-[1.12] font-extrabold text-white sm:text-[34px] lg:text-[38px]">
          <Link to={`/news/${article.slug}`} className="hover:underline">
            {article.title}
          </Link>
        </h1>
        <p className="mt-2 max-w-[58ch] text-sm text-white/85 sm:text-base">{article.standfirst}</p>
        <p className="mt-3 text-[13px] font-medium text-white/75">
          By {article.author} <span aria-hidden="true">·</span> {article.date}{' '}
          <span aria-hidden="true">·</span> {article.readingTime} min read
        </p>
      </div>
    </article>
  )
}
