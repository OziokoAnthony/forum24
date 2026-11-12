// Throwaway smoke test: renders the SPA in jsdom and checks each route for
// runtime errors. Run with: npm run smoke
import { JSDOM } from 'jsdom'
import { createServer } from 'vite'

const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
  url: 'http://localhost/',
  pretendToBeVisual: true,
})

const errors = []
const origError = console.error
console.error = (...args) => {
  const text = args.map(String).join(' ')
  if (/not wrapped in act|ReactDOMTestUtils/.test(text)) return
  errors.push(text)
  origError(...args)
}

for (const key of ['window', 'document', 'HTMLElement', 'Node', 'Event', 'PopStateEvent', 'MouseEvent', 'getComputedStyle', 'requestAnimationFrame', 'cancelAnimationFrame']) {
  Object.defineProperty(globalThis, key, { value: dom.window[key], configurable: true, writable: true })
}
Object.defineProperty(globalThis, 'navigator', { value: dom.window.navigator, configurable: true })
globalThis.IS_REACT_ACT_ENVIRONMENT = false
dom.window.scrollTo = () => {}
dom.window.print = () => {}

const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' })
await server.ssrLoadModule('/src/main.tsx')

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
await sleep(300)

const routes = [
  '/',
  '/news/nigeria-ai-startups-african-infrastructure',
  '/news/afcfta-new-phase-intra-african-trade',
  '/category/tech',
  '/category/education',
  '/search?q=ai',
  '/search?q=zzzz',
  '/search',
  '/resources',
  '/resources?tab=documents',
  '/resources?tab=videos&category=Technology%20%26%20AI',
  '/resources/documents/beginners-guide-python',
  '/resources/documents/study-skills-handbook',
  '/resources/videos/introduction-to-artificial-intelligence',
  '/resources/videos/afrobeats-production-breakdown',
  '/author/adaeze-okonkwo',
  '/about',
  '/privacy',
  '/terms',
  '/editorial-policy',
  '/contact',
  '/login',
  '/admin',
  '/admin/articles',
  '/admin/articles/1',
  '/admin/articles/new',
  '/admin/resources',
  '/admin/ai',
  '/admin/ads',
  '/admin/analytics',
  '/admin/settings',
  '/definitely-not-a-page',
]

const results = []
for (const route of routes) {
  const before = errors.length
  dom.window.history.pushState({}, '', route)
  dom.window.dispatchEvent(new dom.window.PopStateEvent('popstate'))
  await sleep(120)
  const html = dom.window.document.getElementById('root').innerHTML
  const text = dom.window.document.getElementById('root').textContent ?? ''
  results.push({
    route,
    length: html.length,
    h1: (dom.window.document.querySelector('h1')?.textContent ?? '').slice(0, 70),
    title: dom.window.document.title,
    newErrors: errors.length - before,
  })
}

console.table(results)
console.log('routes with no rendered output:', results.filter((r) => r.length < 500).map((r) => r.route))
console.log('total console errors:', errors.length)
if (errors.length) console.log(errors.slice(0, 10).join('\n---\n'))

await server.close()
process.exit(0)
