import { Link } from 'react-router-dom'
import { ArrowUpRight, Flame, TrendingUp } from 'lucide-react'
import { articles, categories } from '../../data/content'
import { AdSlot } from '../../components/ui/AdSlot'
import { Chip } from '../../components/ui/Chip'
import { Cover } from '../../components/ui/Cover'
import { SectionHead } from '../../components/ui/SectionHead'
import { Aurora } from '../../components/ui/Aurora'
import { ArticleCard } from '../../components/content/ArticleCard'
import { FeaturedArticle } from '../../components/content/FeaturedArticle'
import { NewsletterCard } from '../../components/content/NewsletterCard'

export function HomePage() {
  const featured = articles.find((article) => article.featured) ?? articles[0]
  const secondary = articles.filter((article) => article.slug !== featured.slug).slice(0, 2)
  const latest = articles.filter((article) => article.slug !== featured.slug).slice(0, 6)
  const trending = [...articles].sort((a, b) => b.views - a.views).slice(0, 5)
  const techCategory = categories.find((category) => category.slug === 'tech')!
  const techStories = articles.filter((article) => article.category === techCategory.name).slice(0, 3)

  return (
    <div className="fade-up">
      {/* Breaking strip */}
      <div className="slab mt-4 flex items-start gap-2.5 rounded-control border-l-4 border-l-sun-400 px-4 py-2.5 text-sm">
        <Flame size={17} aria-hidden="true" className="mt-0.5 shrink-0 text-sun-600" />
        <p className="text-ink-soft">
          <span className="font-extrabold tracking-[0.04em] text-sun-800 uppercase">Breaking:</span>{' '}
          <Link to={`/news/${featured.slug}`} className="font-semibold text-ink hover:text-sky-700">
            {featured.title}
          </Link>
        </p>
      </div>

      {/* Hero — the 3D studio */}
      <section className="studio mt-6 overflow-hidden rounded-sheet p-3 sm:p-5" aria-label="Featured stories">
        <Aurora placement="studio" />
        <span aria-hidden="true" className="studio-sweep" />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-28 left-1/4 h-72 w-72 rounded-full bg-sky-500/25 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 right-4 h-64 w-64 rounded-full bg-cyan-400/20 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 -bottom-28 h-48 bg-linear-to-t from-sky-600/25 to-transparent"
        />
        <div className="relative grid gap-4 lg:grid-cols-[1.65fr_1fr]">
          <FeaturedArticle article={featured} />
          <div className="grid gap-4">
            {secondary.map((article) => (
              <article
                key={article.slug}
                className="glass-dark grid grid-cols-[110px_1fr] overflow-hidden rounded-card sm:grid-cols-[140px_1fr] lg:grid-cols-[110px_1fr]"
              >
                <Link to={`/news/${article.slug}`} tabIndex={-1} aria-hidden="true">
                  <Cover tone={article.cover} className="h-full min-h-[112px]" />
                </Link>
                <div className="flex flex-col justify-center p-4">
                  <Chip tone="white">{article.category}</Chip>
                  <h3 className="mt-2 line-clamp-3 text-[15px] leading-snug font-bold text-white">
                    <Link to={`/news/${article.slug}`} className="hover:text-cyan-200">
                      {article.title}
                    </Link>
                  </h3>
                  <p className="mt-2 text-[12px] font-medium text-white/70">
                    {article.date} <span aria-hidden="true">·</span> {article.readingTime} min read
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <AdSlot minHeight={110} hint="Homepage leaderboard · space reserved" />

      {/* Trending + latest */}
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          <SectionHead title="Latest stories" action="View all" to="/category/news" />
          <div className="grid gap-5 sm:grid-cols-2">
            {latest.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        </div>

        <aside className="lg:pt-2" aria-label="Trending">
          <div className="slab rounded-card p-5">
            <h2 className="flex items-center gap-2 text-lg font-extrabold">
              <TrendingUp size={18} aria-hidden="true" className="text-sky-600" />
              Trending now
            </h2>
            <ol className="mt-3 grid gap-3">
              {trending.map((article, index) => (
                <li key={article.slug} className="flex gap-3">
                  <span className="disc-3d grid h-7 w-7 shrink-0 place-items-center rounded-full text-[12px] font-extrabold tabular-nums">
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <h3 className="line-clamp-2 text-sm leading-snug font-bold">
                      <Link to={`/news/${article.slug}`} className="text-ink hover:text-sky-700">
                        {article.title}
                      </Link>
                    </h3>
                    <p className="mt-1 text-[11px] font-medium text-ink-muted">
                      {article.views.toLocaleString()} reads
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="slab mt-5 rounded-card p-5">
            <h2 className="text-sm font-extrabold tracking-[0.04em] text-ink-muted uppercase">
              Browse sections
            </h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {categories.slice(0, 8).map((category) => (
                <Link
                  key={category.slug}
                  to={`/category/${category.slug}`}
                  className="rounded-full border border-line bg-white/70 px-3 py-1.5 text-[13px] font-semibold text-ink-soft shadow-[inset_0_1px_0_rgb(255_255_255_/_0.9),0_1px_0_rgb(11_53_88_/_0.08)] transition-transform hover:-translate-y-0.5 hover:border-sky-300 hover:text-sky-700"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* Category band */}
      <SectionHead
        title={techCategory.name}
        description={techCategory.description}
        action="See all"
        to={`/category/${techCategory.slug}`}
      />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {techStories.map((article) => (
          <ArticleCard key={article.slug} article={article} />
        ))}
      </div>

      <div className="mt-10">
        <NewsletterCard />
      </div>

      <div className="relative mt-10 flex flex-wrap items-center justify-between gap-3 overflow-hidden rounded-card border border-line border-l-4 border-l-sun-400 bg-panel px-5 py-4 shadow-card">
        <div>
          <h2 className="text-lg font-extrabold">Prefer to watch or download?</h2>
          <p className="text-sm text-ink-soft">
            The Learning Centre has video lessons and printable guides — no account needed.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/resources?tab=videos"
            className="inline-flex min-h-11 items-center gap-2 rounded-control border border-line bg-panel px-4 text-sm font-bold text-sky-700 hover:bg-sky-50/80"
          >
            Watch videos
            <ArrowUpRight size={15} aria-hidden="true" />
          </Link>
          <Link
            to="/resources?tab=documents"
            className="inline-flex min-h-11 items-center gap-2 rounded-control btn-3d px-4 text-sm font-bold"
          >
            Browse documents
            <ArrowUpRight size={15} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  )
}
