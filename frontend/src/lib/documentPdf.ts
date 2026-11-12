import type { ResourceDoc } from '../data/content'

/**
 * Builds a real, openable PDF for a document record.
 *
 * The catalogue page count is the full publication; the file we can generate
 * on the client is a labelled sample excerpt, so the viewer never claims to
 * show a complete document it does not have.
 */

const SKY_600 = { r: 0.102, g: 0.467, b: 0.714 }
const SKY_700 = { r: 0.082, g: 0.376, b: 0.561 }
const INK = { r: 0.118, g: 0.161, b: 0.231 }
const INK_SOFT = { r: 0.278, g: 0.333, b: 0.412 }
const INK_MUTED = { r: 0.392, g: 0.455, b: 0.545 }
const LINE = { r: 0.812, g: 0.902, b: 0.969 }

const A4 = { width: 595.28, height: 841.89 }
const MARGIN = 56

const chapters = [
  'Why this matters',
  'The core idea',
  'Getting set up',
  'Working through an example',
  'Common mistakes',
  'Checking your work',
  'Where to go next',
]

const paragraphs = [
  'This sample excerpt is written for readers who want a clear starting point rather than a reference manual. Each section builds on the one before it, so read in order the first time and jump around afterwards.',
  'Start with the outcome you want. Write it down in one sentence. Everything that follows should either move you closer to that sentence or be cut, and that single test saves more time than any tool.',
  'Work in small steps. A short exercise you finish teaches more than a long one you abandon, and finishing builds the habit that carries the rest of the guide.',
  'Keep a working file beside this document. Notes you write yourself are worth more than notes you copy, because the act of rewording forces you to notice what you do not yet understand.',
  'When something does not work, change one thing at a time. Two changes at once leave you unable to tell which one helped, and the same rule applies to writing, design and code.',
  'Look for the smallest complete version of the thing you are making. Ship that, then improve it. Readers and users forgive simple; they do not forgive broken.',
  'Ask for feedback early, and ask a specific question. “What is unclear?” gets a useful answer; “What do you think?” usually gets politeness.',
  'Write down what you decided and why. Six weeks from now the reasoning is worth more than the outcome, because the outcome will already be visible.',
  'Set a stopping point before you start. Without one, every task expands to fill the evening, and the work that matters most gets whatever energy is left.',
  'Review at the end: what would you tell someone starting today? That answer is your real summary of this guide, and it is worth keeping.',
]

const footerNote = 'FORUM24 Learning Centre · sample excerpt'

type Ctx = Awaited<ReturnType<typeof makeContext>>

async function makeContext() {
  const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib')
  const pdf = await PDFDocument.create()
  const regular = await pdf.embedFont(StandardFonts.Helvetica)
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold)

  return {
    pdf,
    regular,
    bold,
    rgb,
  }
}

function wrap(text: string, font: { widthOfTextAtSize: (t: string, s: number) => number }, size: number, maxWidth: number) {
  const words = text.split(/\s+/)
  const lines: string[] = []
  let line = ''

  for (const word of words) {
    const next = line ? `${line} ${word}` : word
    if (font.widthOfTextAtSize(next, size) > maxWidth && line) {
      lines.push(line)
      line = word
    } else {
      line = next
    }
  }
  if (line) lines.push(line)
  return lines
}

function drawCover(ctx: Ctx, doc: ResourceDoc) {
  const { pdf, regular, bold, rgb } = ctx
  const page = pdf.addPage([A4.width, A4.height])
  const sky = rgb(SKY_600.r, SKY_600.g, SKY_600.b)
  const white = rgb(1, 1, 1)
  const ink = rgb(INK.r, INK.g, INK.b)
  const inkSoft = rgb(INK_SOFT.r, INK_SOFT.g, INK_SOFT.b)
  const inkMuted = rgb(INK_MUTED.r, INK_MUTED.g, INK_MUTED.b)
  const line = rgb(LINE.r, LINE.g, LINE.b)

  page.drawRectangle({ x: 0, y: A4.height - 250, width: A4.width, height: 250, color: sky })
  page.drawText('FORUM24 LEARNING CENTRE', {
    x: MARGIN,
    y: A4.height - 84,
    size: 9,
    font: bold,
    color: white,
  })

  const titleLines = wrap(doc.title, bold, 26, A4.width - MARGIN * 2)
  titleLines.slice(0, 3).forEach((lineText, index) => {
    page.drawText(lineText, {
      x: MARGIN,
      y: A4.height - 132 - index * 32,
      size: 26,
      font: bold,
      color: white,
      lineHeight: 32,
    })
  })

  page.drawText(`${doc.format} · ${doc.size} · ${doc.pages} pages`, {
    x: MARGIN,
    y: A4.height - 224,
    size: 10,
    font: regular,
    color: white,
    opacity: 0.85,
  })

  let y = A4.height - 306
  page.drawText('About this document', { x: MARGIN, y, size: 12, font: bold, color: ink })
  y -= 22

  for (const lineText of wrap(doc.description, regular, 11.5, A4.width - MARGIN * 2)) {
    page.drawText(lineText, { x: MARGIN, y, size: 11.5, font: regular, color: inkSoft, lineHeight: 17 })
    y -= 17
  }

  y -= 18
  const meta: [string, string][] = [
    ['Publisher', doc.publisher],
    ['Licence', doc.licence],
    ['Version', doc.version],
    ['Published', doc.published],
  ]
  for (const [label, value] of meta) {
    page.drawText(label.toUpperCase(), { x: MARGIN, y, size: 8, font: bold, color: inkMuted })
    page.drawText(value, { x: MARGIN + 120, y: y - 1, size: 11, font: regular, color: ink })
    y -= 24
  }

  page.drawLine({
    start: { x: MARGIN, y: MARGIN + 42 },
    end: { x: A4.width - MARGIN, y: MARGIN + 42 },
    thickness: 0.8,
    color: line,
  })
  page.drawText(`Sample excerpt · generated for the FORUM24 demo · ${doc.category}`, {
    x: MARGIN,
    y: MARGIN + 24,
    size: 8.5,
    font: regular,
    color: inkMuted,
  })

  return page
}

function drawContentPage(ctx: Ctx, doc: ResourceDoc, chapter: string, body: string[], pageNumber: number) {
  const { pdf, regular, bold, rgb } = ctx
  const page = pdf.addPage([A4.width, A4.height])
  const sky = rgb(SKY_700.r, SKY_700.g, SKY_700.b)
  const ink = rgb(INK.r, INK.g, INK.b)
  const inkSoft = rgb(INK_SOFT.r, INK_SOFT.g, INK_SOFT.b)
  const inkMuted = rgb(INK_MUTED.r, INK_MUTED.g, INK_MUTED.b)
  const line = rgb(LINE.r, LINE.g, LINE.b)

  page.drawText('FORUM24', { x: MARGIN, y: A4.height - 58, size: 9, font: bold, color: sky })
  page.drawText(doc.title, {
    x: MARGIN,
    y: A4.height - 58,
    size: 9,
    font: regular,
    color: inkMuted,
    maxWidth: A4.width - MARGIN * 2 - 60,
  })
  page.drawLine({
    start: { x: MARGIN, y: A4.height - 72 },
    end: { x: A4.width - MARGIN, y: A4.height - 72 },
    thickness: 0.8,
    color: line,
  })

  let y = A4.height - 116
  page.drawText(chapter, { x: MARGIN, y, size: 19, font: bold, color: ink })
  y -= 34

  for (const paragraph of body) {
    for (const lineText of wrap(paragraph, regular, 11.5, A4.width - MARGIN * 2)) {
      page.drawText(lineText, { x: MARGIN, y, size: 11.5, font: regular, color: inkSoft, lineHeight: 17 })
      y -= 17
    }
    y -= 14
  }

  page.drawLine({
    start: { x: MARGIN, y: MARGIN + 30 },
    end: { x: A4.width - MARGIN, y: MARGIN + 30 },
    thickness: 0.8,
    color: line,
  })
  page.drawText(footerNote, { x: MARGIN, y: MARGIN + 14, size: 8, font: regular, color: inkMuted })
  page.drawText(String(pageNumber), {
    x: A4.width - MARGIN - 12,
    y: MARGIN + 14,
    size: 8.5,
    font: regular,
    color: inkMuted,
  })

  return page
}

async function build(doc: ResourceDoc): Promise<Blob> {
  const ctx = await makeContext()
  drawCover(ctx, doc)

  const pageCount = 6
  for (let index = 0; index < pageCount - 1; index += 1) {
    const chapter = chapters[index % chapters.length]
    const start = (index * 2) % paragraphs.length
    const body = [paragraphs[start], paragraphs[(start + 1) % paragraphs.length]]
    drawContentPage(ctx, doc, chapter, body, index + 2)
  }

  ctx.pdf.setTitle(doc.title)
  ctx.pdf.setAuthor(doc.publisher)
  ctx.pdf.setSubject(doc.description)
  ctx.pdf.setCreator('FORUM24 Learning Centre')
  ctx.pdf.setProducer('FORUM24')

  const bytes = await ctx.pdf.save()
  return new Blob([bytes as unknown as BlobPart], { type: 'application/pdf' })
}

const cache = new Map<string, Promise<Blob>>()

export function getDocumentPdf(doc: ResourceDoc): Promise<Blob> {
  const cached = cache.get(doc.slug)
  if (cached) return cached

  const pending = build(doc)
  cache.set(doc.slug, pending)
  pending.catch(() => cache.delete(doc.slug))
  return pending
}

export function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  // Give the browser a moment to start the download before revoking.
  window.setTimeout(() => URL.revokeObjectURL(url), 4000)
}
