# FORUM24 — frontend

The public site, Learning Centre and editorial dashboard for **FORUM24**, built to the
design system in [`../AGENT.md`](../AGENT.md). Public content comes from the FastAPI
backend in [`../backend`](../backend) when `VITE_API_URL` is set, and falls back to the
bundled demo records otherwise.

## Stack

- Vite 8 + React 19 + TypeScript
- Tailwind CSS v4 via `@tailwindcss/vite` (tokens live in `src/index.css`)
- React Router v7
- lucide-react icons
- `pdf-lib` for real, client-generated document PDFs (lazy-loaded)
- FastAPI backend in `../backend` for live content, auth and editorial workflows

## Run

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # tsc -b && vite build
npm run preview    # serve the production build
npm run smoke      # render every route in jsdom, report runtime errors
npm run qa         # Playwright pass; start `npm run dev` in another terminal first
```

To use live data, start the API first (see [`../backend/README.md`](../backend/README.md)),
then create `.env.local`:

```bash
cp .env.example .env.local
# VITE_API_URL=http://localhost:8000
```

`src/lib/api.ts` fetches `/api/v1/bootstrap` once before the app mounts and replaces the
exported arrays in `src/data/content.ts`. If the variable is unset, or the request fails
or times out, the app keeps the bundled demo content.

When the API is configured the editorial flow is live:

- `/login` posts to `/api/v1/auth/login` and stores the bearer token plus user in
  `localStorage` (`src/lib/session.ts`).
- `/admin/*` redirects to `/login` without a session; a 401 clears the session.
- `/admin/articles` loads real records and exposes submit, approve, send-back, publish,
  schedule and unschedule actions. Scheduling opens a datetime dialog and posts
  `scheduledFor`; the background publisher takes it from there.
- `/admin/articles/:id` loads, creates and saves records (`PATCH`/`POST`), including a
  simple body syntax (`##`, `>`, `-`) that maps to the API's block list.
- The contact and newsletter forms post to `/api/v1/contact` and `/api/v1/newsletter`.

Without `VITE_API_URL` every one of those screens keeps its local-state demo behaviour,
so the design still runs offline.

`npm run lint` (oxlint) currently fails in this environment because the OS Application
Control policy blocks its native binding. Use `npm run build` as the check.

`npm run qa` opens Chromium, screenshots the home, article, document, video, dashboard,
resources and analytics pages at 360, 768, 1024 and 1440 px into `qa/` (gitignored),
checks horizontal overflow and CLS, downloads the real PDF, exercises the video player,
and walks the homepage with the keyboard. It probes ports 5173 and 5174 unless
`QA_BASE` is set.

## Route map

### Public

| Path | Page |
| --- | --- |
| `/` | Homepage — breaking strip, hero, trending, latest, category band, newsletter |
| `/news/:slug` | Article — 72ch body, labelled in-article ads, author box, related |
| `/category/:slug` | Section page with empty state |
| `/search?q=` | Search across stories, documents and videos |
| `/resources?tab=&category=` | Learning Centre listing (all / documents / videos) |
| `/resources/documents/:slug` | Document detail — preview, ad, then download |
| `/resources/videos/:slug` | Video detail — player, chapters, transcript |
| `/author/:slug` | Author archive |
| `/about`, `/privacy`, `/terms`, `/editorial-policy` | Policy pages |
| `/contact` | Contact form + publisher details |
| `/login` | Editorial sign-in against the API (demo walk-through without it) |
| `*` | 404 |

### Admin

| Path | Page |
| --- | --- |
| `/admin` | Dashboard — stats, traffic, review queue, AI task health |
| `/admin/articles` | Article table with status filters and search |
| `/admin/articles/new`, `/admin/articles/:id` | Editor, SEO inspector, AI suggestions |
| `/admin/resources` | Documents and videos, upload dialog |
| `/admin/ai` | AI Desk: trends, research, draft writer, SEO, fact-check, agent settings |
| `/admin/ads` | Placements, compliance note, document-page wireframe |
| `/admin/analytics` | Traffic and content performance |
| `/admin/settings` | Site details, roles, audit log |

## Source layout

```
src/
  App.tsx                 all routes + static policy copy
  index.css               @theme tokens, base layer, the 3D component classes
                          (.slab, .studio, .glass-dark, .btn-3d, .btn-glass, .badge-3d,
                          .disc-3d, .rule-3d, .tilt-3d, .lift) and the animated
                          background (.aurora, .aurora-blob, .studio-sweep),
                          .prose-article, .ad-slot, .video-shell and .player-range
  data/content.ts         types + mock articles, documents, videos, admin and AI data
  lib/api.ts              /bootstrap hydration, fetch wrapper, login, mock fallback
  lib/session.ts          bearer token + user in localStorage, expiry, initials
  lib/adminApi.ts         typed admin article CRUD/transitions plus contact/newsletter
  lib/adminMock.ts        demo records shaped like the API response
  lib/documentPdf.ts      pdf-lib builder: real 6-page sample PDF per document
  components/
    layout/               Header, Footer, Logo, PublicLayout, AdminLayout, RouteTitle
    ui/                   Button, Chip, StatusPill, AdSlot, Aurora, Breadcrumbs,
                          SectionHead, Cover
    content/              ArticleCard, FeaturedArticle, DocumentCard, VideoCard, NewsletterCard
    resources/            PdfViewer, VideoPlayer, DownloadBlock
    admin/                StatCard
  pages/public/           Home, Article, Category, Search, Resources, Document, Video,
                          Author, StaticPage, Contact, Login, NotFound
  pages/admin/            Overview, Articles, ArticleEditor, Resources, AiDesk, Ads,
                          Analytics, Settings
```

## Brand assets

The supplied logo lives in `public/`:

- `forum24.jpg` — original source
- `forum24-logo.png` — trimmed lockup with a transparent background (light surfaces)
- `forum24-logo-inverse.png` — white lockup for the dark footer
- `favicon.svg` — square app icon

## Design system

The palette and depth rules live in `src/index.css` and are documented in
[`../AGENT.md`](../AGENT.md) §4.

- **Paper page, 3D surfaces.** The page is near-white with a fine grain; panels are
  solid white slabs with a bevel, a 2 px extruded bottom edge and a tight contact
  shadow. Nothing floats in a soft blur.
- **The background moves.** `components/ui/Aurora.tsx` renders three oversized radial
  gradients that drift around the frame on 38–56 s cycles; the dark studio hero adds a
  screen-blended glow plus a rotating conic light sweep. Only `transform` animates, so
  it stays on the GPU, and `prefers-reduced-motion` freezes it.
- **The studio hero.** The homepage lead is a near-black `.studio` panel with grain and
  azure/cyan light sources; the secondary stories are frosted `.glass-dark` cards.
- **Azure is the action colour.** `sky-600` fills primary buttons, `sky-700` carries
  links, `sky-500` is for accents. Cyan is a highlight on dark surfaces only.
- **Mustard is a marker, never an action.** `sun-*` marks section rules, the featured
  flag, ranking discs, the Breaking label and the scheduled status.
- **Real depth.** `.btn-3d` presses 3 px on click, `.tilt-3d` / `.lift` tilt cards in
  perspective on hover, `.badge-3d` and `.disc-3d` are extruded mustard markers.

## Hard rules baked into the UI

- **Ads never gate content.** Ad slots are dashed, neutral, labelled "Advertisement",
  reserve their height, and sit away from play/download controls.
- **AI never publishes.** AI output is labelled as a draft and every path to publishing
  goes through an editor's approval.
- **One action colour.** Primary actions are `sky-600`; links are `sky-700`. The sky ramp
  is the only accent.
- **Status is never colour alone** — every pill carries its text label.

## What is real and what is mocked

| Piece | Now | Production |
| --- | --- | --- |
| Public content | `/api/v1/bootstrap` when `VITE_API_URL` is set; bundled demo records otherwise | Same FastAPI contract backed by PostgreSQL |
| `PdfViewer` | Real 6-page sample PDF built with `pdf-lib`, shown in a blob iframe | Publisher's file, served from object storage |
| `DownloadBlock` | Saves that same real PDF, independent of ads | Short-lived signed URL from `/api/v1/documents/{slug}/download` |
| `VideoPlayer` | Real keyboard-operable controls (play, seek, chapters, captions, mute, full screen); progress simulated | Provider embed inside the same shell |
| Transcripts | Supplied per video in `content.ts` | Caption track from the provider |
| Admin forms | Live against `VITE_API_URL`: login, list, editor, transitions, schedule/unschedule | FastAPI + PostgreSQL |
| Auth | Real `/auth/login` bearer token in `localStorage`, guarded `/admin/*`; demo walk-through without an API | httpOnly cookies or memory + refresh tokens |

Two non-PDF records (`cv-writing-for-graduates`, `ai-for-small-business`) are marked
`downloadable: false`, so the "View only" state is honest rather than a dead button.
