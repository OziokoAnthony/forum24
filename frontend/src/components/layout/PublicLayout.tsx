import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Footer } from './Footer'
import { Header } from './Header'
import { Aurora } from '../ui/Aurora'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])
  return null
}

export function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Aurora placement="fixed" />
      <ScrollToTop />
      <Header />
      <main id="main" className="mx-auto w-full max-w-[1200px] flex-1 px-4 pb-4">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
