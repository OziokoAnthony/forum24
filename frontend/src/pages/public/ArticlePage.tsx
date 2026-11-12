import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Clock, Link2, MessageCircle, Send, Share2 } from 'lucide-react'
import { articles, getArticle } from '../../data/content'
import { AdSlot } from '../../components/ui/AdSlot'
import { Breadcrumbs } from '../../components/ui/Breadcrumbs'
import { Chip } from '../../components/ui/Chip'
import { Cover } from '../../components/ui/Cover'
import { SectionHead } from '../../components/ui/SectionHead'
import { ArticleCard } from '../../components/content/ArticleCard'
import { NewsletterCard } from '../../components/content/NewsletterCard'
import { NotFoundPage } from './NotFoundPage'

export function ArticlePage() {
  const { slug = '' } = useParams()
  const article = getArticle(slug)
  const [copied, setCopied] = useState(false)

  if (!article) return <NotFoundPage />

  const related = articles
    .filter((item) => item.slug !== article.slug && item.category === article.category)
    .concat(articles.filter((item) => item.slug !== article.slug && item.category !== article.category))
    .slice(0, 3)

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <article className="fade-up">
      <div className="mt-5">
        <Breadcrumbs
          items={[
            { label: 'Home', to: '/' },
            { label: article.category, to: '/category/news' },
            { label: article.title },
          ]}
        />
      </div>

      <div className="mt-4 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          <header>
            <Chip>{article.category}</Chip>
            <h1 className="mt-3 max-w-[22ch] text-[30px] leading-[1.12] font-extrabold sm:text-[38px]">
              {article.title}
            </h1>
            <p className="mt-3 max-w-[62ch] text-[17px] text-ink-soft">{article.standfirst}</p>

            <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 border-y border-line py-3 text-[13px] font-medium text-ink-muted">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-sky-100 text-xs font-extrabold text-sky-800">
                {article.author
                  .split(' ')
                  .map((part) => part[0])
                  .join('')}
              </span>
              <span>
                By <span className="font-bold text-ink">{article.author}</span> · {article.authorRole}
              </span>
              <span aria-hidden="true">·</span>
              <span>{article.date}</span>
              <span className="inline-flex items-center gap-1">
                <Clock size={13} aria-hidden="true" />
                {article.readingTime} min read
              </span>
              {article.reviewedBy && (
                <span className="rounded-full bg-green-50 px-2 py-0.5 font-semibold text-green-800">
                  Reviewed by {article.reviewedBy}
                </span>
              )}

              <div className="ml-auto flex items-center gap-1">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(article.title)}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="grid h-9 w-9 place-items-center rounded-full text-ink-muted hover:bg-sky-50 hover:text-sky-700"
                  aria-label="Share on WhatsApp"
                >
                  <MessageCircle size={16} aria-hidden="true" />
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="grid h-9 w-9 place-items-center rounded-full text-ink-muted hover:bg-sky-50 hover:text-sky-700"
                  aria-label="Share on X"
                >
                  <Send size={16} aria-hidden="true" />
                </a>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://forum24.example/news/' + article.slug)}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="grid h-9 w-9 place-items-center rounded-full text-ink-muted hover:bg-sky-50 hover:text-sky-700"
                  aria-label="Share on Facebook"
                >
                  <Share2 size={16} aria-hidden="true" />
                </a>
                <button
                  type="button"
                  onClick={copyLink}
                  className="grid h-9 w-9 place-items-center rounded-full text-ink-muted hover:bg-sky-50 hover:text-sky-700"
                  aria-label="Copy link"
                >
                  <Link2 size={16} aria-hidden="true" />
                </button>
                {copied && <span className="text-[12px] font-semibold text-green-700">Copied</span>}
              </div>
            </div>
          </header>

          <figure className="mt-5">
            <Cover tone={article.cover} className="aspect-[16/9] rounded-card" />
            <figcaption className="mt-2 text-[12px] text-ink-muted">
              Illustration: FORUM24. Stock photography is credited on the image record.
            </figcaption>
          </figure>

          <div className="prose-article mt-6">
            {article.body.map((block, index) => {
              const ad =
                index === 2 ? (
                  <AdSlot
                    key="ad-inline-1"
                    minHeight={250}
                    hint="In-article placement · clearly separated from the text"
                  />
                ) : index === article.body.length - 1 ? (
                  <AdSlot
                    key="ad-inline-2"
                    minHeight={250}
                    hint="Pre-conclusion placement · never inside the paragraph flow"
                  />
                ) : null

              const content = (() => {
                if (block.type === 'p') return <p key={`p-${index}`}>{block.text}</p>
                if (block.type === 'h2') return <h2 key={`h-${index}`}>{block.text}</h2>
                if (block.type === 'quote') return <blockquote key={`q-${index}`}>{block.text}</blockquote>
                return (
                  <ul key={`l-${index}`}>
                    {block.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                )
              })()

              return (
                <div key={`block-${index}`}>
                  {content}
                  {ad}
                </div>
              )
            })}
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-line bg-cloud px-3 py-1 text-[12px] font-semibold text-ink-soft"
              >
                #{tag}
              </span>
            ))}
          </div>

          <div className="mt-8 rounded-card border border-line bg-panel p-5 shadow-card">
            <div className="flex items-start gap-3">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-sky-100 text-sm font-extrabold text-sky-800">
                {article.author
                  .split(' ')
                  .map((part) => part[0])
                  .join('')}
              </span>
              <div>
                <h2 className="text-base font-extrabold">{article.author}</h2>
                <p className="text-[13px] font-semibold text-sky-700">{article.authorRole}</p>
                <p className="mt-1 text-sm text-ink-soft">
                  Writes about {article.category.toLowerCase()} for FORUM24, with a focus on
                  reporting that holds up after the headline cycle ends.
                </p>
                <Link
                  to={`/author/${article.author.toLowerCase().replace(/\s+/g, '-')}`}
                  className="mt-1 inline-block text-sm font-bold text-sky-700 hover:underline"
                >
                  More from this author →
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <NewsletterCard />
          </div>
        </div>

        <aside className="grid content-start gap-5" aria-label="Article sidebar">
          <div className="rounded-card border border-line bg-panel p-5 shadow-card">
            <h2 className="text-sm font-extrabold tracking-[0.04em] text-ink-muted uppercase">
              In this article
            </h2>
            <ul className="mt-3 grid gap-2 text-sm">
              {article.body
                .filter((block) => block.type === 'h2')
                .map((block) => (
                  <li key={block.text} className="font-semibold text-ink-soft">
                    {block.text}
                  </li>
                ))}
            </ul>
          </div>

          <AdSlot minHeight={250} hint="Sidebar placement · desktop only" />

          <div className="rounded-card border border-line bg-panel p-5 shadow-card">
            <h2 className="text-sm font-extrabold tracking-[0.04em] text-ink-muted uppercase">
              Most read
            </h2>
            <ol className="mt-3 grid gap-3">
              {[...articles]
                .sort((a, b) => b.views - a.views)
                .slice(0, 4)
                .map((item, index) => (
                  <li key={item.slug} className="flex gap-2.5">
                    <span className="text-lg font-extrabold text-sky-300 tabular-nums">{index + 1}</span>
                    <Link
                      to={`/news/${item.slug}`}
                      className="line-clamp-2 text-sm font-semibold text-ink hover:text-sky-700"
                    >
                      {item.title}
                    </Link>
                  </li>
                ))}
            </ol>
          </div>
        </aside>
      </div>

      <SectionHead title="Related stories" action="More news" to="/category/news" />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {related.map((item) => (
          <ArticleCard key={item.slug} article={item} />
        ))}
      </div>
    </article>
  )
}
