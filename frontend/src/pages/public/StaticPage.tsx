import { Link } from 'react-router-dom'
import { Breadcrumbs } from '../../components/ui/Breadcrumbs'

export type StaticSection = { heading: string; paragraphs: string[] }

export function StaticPage({
  title,
  intro,
  updated,
  sections,
  id,
}: {
  title: string
  intro: string
  updated: string
  sections: StaticSection[]
  id?: string
}) {
  return (
    <div className="fade-up" id={id}>
      <div className="mt-5">
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: title }]} />
      </div>

      <article className="mt-4 rounded-card border border-line bg-panel p-6 shadow-card sm:p-10">
        <header className="border-b border-line pb-5">
          <p className="text-[12px] font-bold tracking-[0.08em] text-sky-700 uppercase">
            FORUM24 policy
          </p>
          <h1 className="mt-1 text-[30px] font-extrabold sm:text-[36px]">{title}</h1>
          <p className="mt-2 max-w-[64ch] text-[16px] text-ink-soft">{intro}</p>
          <p className="mt-2 text-[12px] font-medium text-ink-muted">Last updated: {updated}</p>
        </header>

        <div className="mt-6 grid gap-7">
          {sections.map((section) => (
            <section
              key={section.heading}
              id={section.heading.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}
            >
              <h2 className="text-[20px] font-extrabold">{section.heading}</h2>
              <div className="mt-2 grid gap-2 text-[15px] leading-relaxed text-ink-soft">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <p className="mt-8 border-t border-line pt-4 text-sm text-ink-muted">
          Questions?{' '}
          <Link to="/contact" className="font-semibold text-sky-700 hover:underline">
            Contact the FORUM24 team
          </Link>
          .
        </p>
      </article>
    </div>
  )
}
