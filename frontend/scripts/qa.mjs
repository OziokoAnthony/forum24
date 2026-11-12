// Real-browser QA for the FORUM24 frontend.
//
//   npm run dev -- --port 5174 --strictPort   (in another terminal)
//   npm run qa
//
// Checks each key page at four widths for horizontal overflow and layout
// shift, takes screenshots into qa/, verifies the document preview/download,
// exercises the video player, and walks the homepage with the keyboard.
import { chromium } from 'playwright'
import { mkdir, readFile } from 'node:fs/promises'
import path from 'node:path'

const OUT = path.resolve('qa')

async function probe(url) {
  try {
    const response = await fetch(url)
    if (!response.ok) return false
    const html = await response.text()
    return html.includes('FORUM24')
  } catch {
    return false
  }
}

const candidates = process.env.QA_BASE
  ? [process.env.QA_BASE]
  : ['http://localhost:5174', 'http://localhost:5173']

let BASE = ''
for (const candidate of candidates) {
  if (await probe(candidate)) {
    BASE = candidate
    break
  }
}

if (!BASE) {
  console.error('No dev server found. Start `npm run dev` first, or set QA_BASE.')
  process.exit(1)
}

const viewports = [
  { width: 360, height: 800, label: '360' },
  { width: 768, height: 1024, label: '768' },
  { width: 1024, height: 768, label: '1024' },
  { width: 1440, height: 900, label: '1440' },
]

const pages = [
  { name: 'home', url: '/' },
  { name: 'article', url: '/news/nigeria-ai-startups-african-infrastructure' },
  { name: 'document', url: '/resources/documents/beginners-guide-python' },
  { name: 'video', url: '/resources/videos/introduction-to-artificial-intelligence' },
  { name: 'admin', url: '/admin' },
  { name: 'admin-resources', url: '/admin/resources' },
  { name: 'admin-analytics', url: '/admin/analytics' },
]

const problems = []
const notes = []

await mkdir(OUT, { recursive: true })

const browser = await chromium.launch()
const context = await browser.newContext({ acceptDownloads: true })

// Layout-shift observer has to be installed before the app boots.
await context.addInitScript(() => {
  window.__cls = 0
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (!entry.hadRecentInput) window.__cls += entry.value
    }
  }).observe({ type: 'layout-shift', buffered: true })
})

for (const viewport of viewports) {
  const page = await context.newPage()
  await page.setViewportSize({ width: viewport.width, height: viewport.height })

  const consoleErrors = []
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text())
  })
  page.on('pageerror', (error) => consoleErrors.push(error.message))

  for (const target of pages) {
    const response = await page.goto(BASE + target.url, { waitUntil: 'load' })
    await page.waitForTimeout(900)

    if (!response || response.status() !== 200) {
      problems.push(`${target.name} ${viewport.label}px: HTTP ${response?.status()}`)
    }

    const metrics = await page.evaluate(() => {
      const root = document.documentElement
      const widest = Array.from(document.querySelectorAll('body *'))
        .filter((el) => {
          const style = getComputedStyle(el)
          if (style.position === 'fixed' || style.display === 'none') return false
          const rect = el.getBoundingClientRect()
          return rect.width > 0 && rect.right > window.innerWidth + 1
        })
        .slice(0, 4)
        .map((el) => {
          const rect = el.getBoundingClientRect()
          return `${el.tagName.toLowerCase()}.${String(el.className).slice(0, 48)} → right ${Math.round(rect.right)}`
        })

      return {
        scrollWidth: root.scrollWidth,
        innerWidth: window.innerWidth,
        cls: Number(window.__cls ?? 0),
        widest,
        title: document.title,
        h1: document.querySelector('h1')?.textContent?.trim().slice(0, 60) ?? '',
      }
    })

    if (metrics.scrollWidth > metrics.innerWidth + 1) {
      problems.push(
        `${target.name} ${viewport.label}px: horizontal overflow ${metrics.scrollWidth} > ${metrics.innerWidth} (${metrics.widest.join(' | ')})`,
      )
    }
    if (!metrics.h1) problems.push(`${target.name} ${viewport.label}px: no h1`)
    if (metrics.cls > 0.1) {
      problems.push(`${target.name} ${viewport.label}px: CLS ${metrics.cls.toFixed(3)} > 0.1`)
    }

    await page.screenshot({
      path: path.join(OUT, `${target.name}-${viewport.label}.png`),
      fullPage: true,
    })
  }

  if (consoleErrors.length) {
    problems.push(`${viewport.label}px console errors: ${consoleErrors.slice(0, 3).join(' || ')}`)
  }

  await page.close()
}

// --- Document: preview frame + real PDF download -------------------------
{
  const page = await context.newPage()
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto(`${BASE}/resources/documents/beginners-guide-python`, { waitUntil: 'load' })

  const frame = page.locator('iframe[title^="Preview of"]')
  try {
    await frame.waitFor({ state: 'visible', timeout: 15000 })
    const src = await frame.getAttribute('src')
    const height = await frame.evaluate((el) => el.getBoundingClientRect().height)
    if (!src?.startsWith('blob:')) problems.push(`PDF iframe src is not a blob URL: ${src}`)
    if (height < 300) problems.push(`PDF iframe too short: ${height}px`)
    notes.push(`PDF preview: blob frame ${Math.round(height)}px tall`)
  } catch {
    problems.push('PDF preview iframe did not appear within 15s')
  }

  const downloadButton = page.getByRole('button', { name: /^Download PDF$/ })
  try {
    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: 20000 }),
      downloadButton.click(),
    ])
    const file = path.join(OUT, download.suggestedFilename())
    await download.saveAs(file)
    const bytes = await readFile(file)
    const header = bytes.subarray(0, 5).toString('latin1')
    if (header !== '%PDF-') problems.push(`Downloaded file is not a PDF (header: ${header})`)
    if (bytes.length < 3_000) problems.push(`Downloaded PDF is suspiciously small: ${bytes.length} bytes`)
    notes.push(`PDF download: ${bytes.length} bytes, header ${header}`)
  } catch (error) {
    problems.push(`PDF download failed: ${error.message}`)
  }

  // The "View only" document must not offer a download.
  await page.goto(`${BASE}/resources/documents/cv-writing-for-graduates`, { waitUntil: 'load' })
  const viewOnly = page.getByRole('button', { name: 'View only' })
  if ((await viewOnly.count()) !== 1) problems.push('View-only document has no View only button')
  if ((await page.getByRole('button', { name: /Download/ }).count()) !== 0) {
    problems.push('View-only document still offers a download')
  }

  await page.close()
}

// --- Video: play, seek, chapters, captions, keyboard ---------------------
{
  const page = await context.newPage()
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto(`${BASE}/resources/videos/introduction-to-artificial-intelligence`, {
    waitUntil: 'load',
  })

  const time = page.locator('span.tabular-nums').first()
  const before = await time.textContent()

  await page.getByRole('button', { name: /^Play / }).first().click()
  await page.waitForTimeout(1200)
  const after = await time.textContent()
  if (before === after) problems.push('Video time did not advance after pressing play')

  const seek = page.getByRole('slider')
  await seek.focus()
  const valueBefore = await seek.inputValue()
  await page.keyboard.press('ArrowRight')
  await page.waitForTimeout(150)
  const valueAfter = await seek.inputValue()
  if (valueBefore === valueAfter) problems.push('ArrowRight did not move the seek slider')

  await page.getByRole('button', { name: /Where African builders can start/ }).click()
  const chapterValue = Number(await seek.inputValue())
  if (chapterValue < 400) problems.push(`Chapter seek landed at ${chapterValue}s, expected > 400s`)

  const captions = page.getByRole('button', { name: 'Turn captions off' })
  await captions.click()
  if ((await page.getByRole('button', { name: 'Turn captions on' }).count()) !== 1) {
    problems.push('Captions toggle did not change state')
  }

  const transcript = await page.locator('section[aria-labelledby="transcript-heading"] li').count()
  if (transcript < 3) problems.push(`Transcript has only ${transcript} lines`)

  await page.screenshot({ path: path.join(OUT, 'video-playing.png') })
  notes.push(`Video: seek ${valueBefore}s → ${valueAfter}s, chapter → ${chapterValue}s, ${transcript} transcript lines`)
  await page.close()
}

// --- Keyboard walk on the homepage --------------------------------------
{
  const page = await context.newPage()
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto(BASE, { waitUntil: 'load' })
  await page.waitForTimeout(400)

  const stops = []
  for (let index = 0; index < 14; index += 1) {
    await page.keyboard.press('Tab')
    stops.push(
      await page.evaluate(() => {
        const el = document.activeElement
        if (!el) return 'none'
        const visible = (node) => {
          const style = getComputedStyle(node)
          return style.outlineStyle !== 'none' || style.boxShadow !== 'none'
        }
        const focusVisible = visible(el) || (el.parentElement ? visible(el.parentElement) : false)
        const label =
          el.getAttribute('aria-label') ||
          el.textContent?.trim().replace(/\s+/g, ' ').slice(0, 42) ||
          el.getAttribute('type') ||
          ''
        return `${el.tagName.toLowerCase()}${el === document.body ? '(body)' : ''} “${label}” focus:${focusVisible ? 'visible' : 'none'}`
      }),
    )
  }

  const first = stops[0]
  if (!/skip/i.test(first)) problems.push(`First Tab stop is not the skip link: ${first}`)
  const invisible = stops.filter((stop) => stop.includes('focus:none'))
  if (invisible.length) problems.push(`Focus not visible on: ${invisible.join(' | ')}`)

  notes.push(`Keyboard: ${stops.length} stops, first → ${first}`)
  console.log('\nKeyboard order:')
  stops.forEach((stop, index) => console.log(`  ${String(index + 1).padStart(2)}. ${stop}`))
  await page.close()
}

await browser.close()

console.log('\nNotes:')
notes.forEach((note) => console.log(`  • ${note}`))

if (problems.length) {
  console.log(`\n${problems.length} problem(s):`)
  problems.forEach((problem) => console.log(`  ✗ ${problem}`))
  process.exit(1)
}

console.log('\nAll QA checks passed. Screenshots in frontend/qa/.')
