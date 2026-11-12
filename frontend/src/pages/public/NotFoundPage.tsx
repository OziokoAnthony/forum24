import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'

export function NotFoundPage() {
  return (
    <div className="fade-up mx-auto mt-12 max-w-[560px] rounded-card border border-line bg-panel p-8 text-center shadow-card sm:p-12">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-mist text-sky-700">
        <Compass size={26} aria-hidden="true" />
      </div>
      <p className="mt-4 text-[12px] font-bold tracking-[0.1em] text-sky-700 uppercase">404</p>
      <h1 className="mt-1 text-[28px] font-extrabold">We couldn’t find that page</h1>
      <p className="mx-auto mt-2 max-w-[46ch] text-sm text-ink-soft">
        The link may be old, or the story may have been moved. Try the homepage or the Learning
        Centre.
      </p>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        <Link
          to="/"
          className="inline-flex min-h-11 items-center rounded-control btn-3d px-4 text-sm font-bold"
        >
          Go to the homepage
        </Link>
        <Link
          to="/resources"
          className="inline-flex min-h-11 items-center rounded-control border border-line bg-panel px-4 text-sm font-bold text-sky-700 hover:bg-sky-50"
        >
          Learning Centre
        </Link>
      </div>
    </div>
  )
}
