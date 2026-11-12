import { Link, useParams } from 'react-router-dom'
import { articles, categories } from '../../data/content'
import { AdSlot } from '../../components/ui/AdSlot'
import { Breadcrumbs } from '../../components/ui/Breadcrumbs'
import { ArticleCard } from '../../components/content/ArticleCard'
import { NotFoundPage } from './NotFoundPage'

export function CategoryPage() {
  const { slug = '' } = useParams()
  const category = categories.find((item) => item.slug === slug)

  if (!category) return <NotFoundPage />

  const list = articles.filter((article) => article.category === category.name)

  return (
    <div className="fade-up">
      <div className="mt-5">
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: category.name }]} />
      </div>

      <header className="mt-4 rounded-card border border-line bg-panel p-6 shadow-card sm:p-8">
        <p className="text-[12px] font-bold tracking-[0.08em] text-sky-700 uppercase">Section</p>
        <h1 className="mt-1 text-[30px] font-extrabold sm:text-[36px]">{category.name}</h1>
        <p className="mt-2 max-w-[60ch] text-[16px] text-ink-soft">{category.description}</p>
        <p className="mt-3 text-[13px] font-medium text-ink-muted">
          {list.length} {list.length === 1 ? 'story' : 'stories'}
        </p>
      </header>

      {list.length === 0 ? (
        <div
          className="mt-6 rounded-card border border-line p-10 text-center"
          style={{
            background:
              'radial-gradient(60% 60% at 20% 20%, #ffffff 0%, transparent 70%), radial-gradient(50% 50% at 80% 0%, #e3f2fe 0%, transparent 70%), linear-gradient(180deg, #f7fbff 0%, #eaf4ff 100%)',
          }}
        >
          <h2 className="text-xl font-extrabold">Nothing published here yet</h2>
          <p className="mx-auto mt-2 max-w-[46ch] text-sm text-ink-soft">
            This section is being prepared. In the meantime, the latest stories are on the
            homepage.
          </p>
          <Link
            to="/"
            className="mt-4 inline-flex min-h-11 items-center rounded-control btn-3d px-4 text-sm font-bold"
          >
            Back to the homepage
          </Link>
        </div>
      ) : (
        <>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
          <AdSlot minHeight={110} hint="Category page placement" />
        </>
      )}

      <section className="mt-8">
        <h2 className="text-sm font-extrabold tracking-[0.04em] text-ink-muted uppercase">
          Other sections
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {categories
            .filter((item) => item.slug !== category.slug)
            .map((item) => (
              <Link
                key={item.slug}
                to={`/category/${item.slug}`}
                className="rounded-full border border-line bg-panel px-3 py-1.5 text-[13px] font-semibold text-ink-soft hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700"
              >
                {item.name}
              </Link>
            ))}
        </div>
      </section>
    </div>
  )
}
