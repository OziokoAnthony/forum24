import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { categories, getArticle, getDoc, getVideo } from '../../data/content'

const SITE = 'FORUM24'
const TAGLINE = 'Nigeria’s pulse. Africa’s stories.'

const staticTitles: Record<string, string> = {
  '/': `${SITE} — ${TAGLINE}`,
  '/search': 'Search',
  '/resources': 'Learning Centre',
  '/about': 'About',
  '/privacy': 'Privacy policy',
  '/terms': 'Terms and conditions',
  '/editorial-policy': 'Editorial policy',
  '/contact': 'Contact',
  '/login': 'Editorial sign in',
  '/admin': 'Dashboard',
  '/admin/articles': 'Articles',
  '/admin/articles/new': 'New article',
  '/admin/resources': 'Resources',
  '/admin/ai': 'AI editorial assistant',
  '/admin/ads': 'Advertising',
  '/admin/analytics': 'Analytics',
  '/admin/settings': 'Settings',
}

/** Keeps the document title in sync with the route. */
export function RouteTitle() {
  const { pathname, search } = useLocation()
  const segments = pathname.split('/').filter(Boolean)
  const query = new URLSearchParams(search).get('q')

  let title: string | undefined = staticTitles[pathname]

  if (!title) {
    if (segments[0] === 'news' && segments[1]) title = getArticle(segments[1])?.title
    else if (segments[0] === 'category' && segments[1])
      title = categories.find((category) => category.slug === segments[1])?.name
    else if (segments[0] === 'resources' && segments[1] === 'documents' && segments[2])
      title = getDoc(segments[2])?.title
    else if (segments[0] === 'resources' && segments[1] === 'videos' && segments[2])
      title = getVideo(segments[2])?.title
    else if (segments[0] === 'author' && segments[1])
      title = segments[1]
        .split('-')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ')
    else if (segments[0] === 'admin' && segments[1] === 'articles' && segments[2])
      title = 'Edit article'
  }

  if (pathname === '/search' && query) title = `Search: ${query}`

  const isAdmin = segments[0] === 'admin'

  useEffect(() => {
    const base =
      pathname === '/'
        ? `${SITE} — ${TAGLINE}`
        : title
          ? `${title} · ${SITE}`
          : `Page not found · ${SITE}`
    document.title = isAdmin ? `${base} editorial` : base
  }, [pathname, title, isAdmin])

  return null
}
