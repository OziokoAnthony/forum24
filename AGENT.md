# FORUM24 — Design & Build Guide (`AGENT.md`)

> **Status:** design baseline v1.0 (2026-11-11).
> Derived from the FORUM24 PRD v1.0 + the PDF/Video Learning Centre addendum.
> `skill.md` is still empty and is not used; this file is the single source of truth.
> Visual reference: `design-preview.html` in this folder.

---

## 1. Product at a glance

| Item | Value |
|---|---|
| Product | **FORUM24** — AI-powered Nigerian & African digital media, news, blogging and learning platform |
| Market | Nigeria, Africa, global diaspora |
| Stack | React + TypeScript + Tailwind (frontend) · FastAPI + SQLAlchemy/Alembic (API) · PostgreSQL · Redis + Celery |
| Three publishing areas | **Blog & News** · **Videos** · **Documents & Resources** |
| Revenue | AdSense (primary), sponsored content, affiliates, direct ads |
| Hard rule | Human editorial approval before publishing; ads never block content |

### The look in one sentence
A **calm, trustworthy newsroom under a pale sky**: white content cards floating on a very
light sky-blue page, one clear sky-blue action colour, generous reading space, and
advertising that is visibly *not* part of the interface.

---

## 2. Design principles

1. **Read first.** Type, line length and contrast beat decoration. Body text is `#1E293B`
   on white, 65–75 characters per line.
2. **One blue means "do this".** If everything is blue, nothing is. Blue is reserved for
   primary actions, links and active navigation.
3. **Advertising must look like advertising.** Neutral, dashed, labelled, never blue,
   never shaped like a download or play control.
4. **Trust is a visual property.** Show sources, bylines, dates, "Reviewed by" and clear
   status. No fake urgency, no deceptive buttons.
5. **Calm motion.** 150–250 ms, opacity/transform only, off for `prefers-reduced-motion`.
6. **Mobile is the default.** Most readers arrive on a phone over mobile data. Design the
   360 px column first, then widen.
7. **AI is an assistant, not an author.** AI output always appears inside a review surface
   with sources, flags and an explicit human "Approve" action.

---

## 3. Brand

- **Name:** **FORUM24** — one word, all caps in the logo, headers and navigation. In
  running prose "Forum24" is acceptable; never write "Forum 24" or "F24" in user-facing copy.
- **Short form:** Forum24 (tight UI only).
- **Mark:** a rounded sky-blue tile (`#1A77B6`) holding a white speech-bubble glyph with
  "24" cut out of it — the bubble says "forum", the 24 says "always on". Wordmark
  "FORUM24" in the system font, 800 weight, `#154E75`, with "24" optionally in `#1A77B6`.
- **Favicon:** the bubble/24 glyph in white on `#1A77B6`.
- **Voice:** clear, factual, warm, never sensational. Headlines sentence case.
- **Tagline (optional):** "Nigeria's pulse. Africa's stories."

---

## 4. Colour system

### 4.1 Surfaces — paper, not glass everywhere

The page is paper. Panels are solid white with a hairline rule; the 3D reads
from bevels and extrusion, not from blur. Only the hero studio and the footer
are dark.

| Token | Hex | Use |
|---|---|---|
| `--color-page` | `#F2F5F8` | Public page background |
| `--color-panel` | `#FFFFFF` | Cards, header, sheets, modals |
| `--color-cloud` | `#F7F9FB` | Table headers, hover rows, input fill |
| `--color-mist` | `#EEF2F6` | Section bands, skeletons, empty states |
| `--color-cloud-deep` | `#E2E7EC` | Decorative clouds, progress tracks |
| `--color-line` | `#E2E7EC` | Card borders, rules, table separators |
| `--color-line-strong` | `#C7CED6` | Input borders on hover, selected outlines |

### 4.2 Sky azure — the single action ramp

| Token | Hex | Use | On white |
|---|---|---|---|
| `sky-50` | `#F1F7FD` | Tinted badges, hover wash | — |
| `sky-100` | `#E2EEFB` | Active nav fill, selected row | — |
| `sky-200` | `#C7DEF8` | Chip borders, focus halo base | — |
| `sky-300` | `#93C6F4` | Focus ring, chart grid, illustration | 1.9:1 — decoration only |
| `sky-400` | `#59A8EE` | Decorative icons, category art | 2.7:1 — decoration only |
| `sky-500` | `#2B85E2` | Accents, rings, progress fill | 3.8:1 — UI/large only |
| `sky-600` | `#1A6FD8` | **Primary button fill**, active control | **4.9:1 ✅** |
| `sky-700` | `#1457AD` | Primary hover, **body links** | **7.1:1 ✅** |
| `sky-800` | `#124688` | Link hover, headings on tint | 8.4:1 ✅ |
| `sky-900` | `#123A6B` | Deep headings, dark surfaces | 10.2:1 ✅ |

`sky-600` is the only action colour. Never introduce a second filled-action hue.

### 4.3 Cyan — highlight only

| Token | Hex | Use |
|---|---|---|
| `cyan-200` | `#A8ECFF` | Link hover on dark surfaces |
| `cyan-300` | `#4ED6FF` | Focus ring on dark, studio rim light |
| `cyan-400` | `#22C1F5` | Masthead/footer rule end stop, studio glow |
| `cyan-500` | `#06A8DF` | Decorative strokes on dark |

Cyan is light on dark only. It is never an action colour and never a text colour
on the light page.

### 4.4 Sun mustard — raised markers only

A warm mustard ramp marks things: section rules, the featured flag, the ranking
discs, the Breaking label and the scheduled state. It is never an action colour.

| Token | Hex | Use |
|---|---|---|
| `sun-50` | `#FDFAEE` | Tinted notice strips |
| `sun-100` | `#FAF3D4` | Scheduled pill fill, notice panels |
| `sun-200` | `#F4E59A` | Badge top bevel, avatar ring |
| `sun-300` | `#ECDA6E` | Gradient midpoint, footer headings |
| `sun-400` | `#E4CE65` | Section marker, featured flag, active underline |
| `sun-500` | `#D8B93C` | Badge extrusion edge |
| `sun-600` | `#B8951F` | Icon on `sun-100`, extruded bottom edge |
| `sun-700` | `#8F7015` | Icon on `sun-50` |
| `sun-800` | `#6B520F` | "Breaking" label, scheduled pill text |
| `sun-900` | `#4A390B` | Reserved for deep sun text |

### 4.5 Text

| Token | Hex | Use |
|---|---|---|
| `--color-ink` | `#111C26` | Headings, body |
| `--color-ink-soft` | `#3C4B59` | Secondary body, captions |
| `--color-ink-muted` | `#5F6F7E` | Metadata, timestamps, helper text |
| `--color-ink-faint` | `#93A1AE` | Disabled, placeholders on tint |

### 4.6 Semantic (kept distinct from brand azure)

| State | Fill | Text | Use |
|---|---|---|---|
| Success | `#D1FAE5` | `#065F46` | Published, approved, succeeded |
| Warning | `#FEF3C7` | `#78350F` | Pending review, conflicting facts |
| Danger | `#FEE2E2` | `#991B1B` | Failed task, unsupported claim, destructive |
| Info | `#E2EEFB` | `#124688` | Neutral notice, approved |
| Scheduled | `#FAF3D4` | `#6B520F` | Scheduled — mustard, not violet |
| Neutral | `#F1F5F9` | `#475569` | Draft, archived, disabled |

### 4.7 Advertising surface (deliberately outside the brand)

| Token | Hex | Use |
|---|---|---|
| `--color-ad-bg` | `#F7F9FB` | Ad container fill |
| `--color-ad-line` | `#C7CED6` | Ad container border (dashed 1px) |
| `--color-ad-label` | `#5F6F7E` | "Advertisement" label, 11 px, uppercase, tracked |

> Ads are **never** azure, cyan or mustard, never solid-filled, never shaped like
> a button, and always carry the word "Advertisement" above the creative.

### 4.8 Depth — the 3D rules

Every surface uses one shadow family: a top bevel, a crisp 2 px extruded bottom
edge and a tight contact shadow. Nothing floats in a soft blur.

| Token | Use |
|---|---|
| `--shadow-card` | Resting panel: bevel + 2 px extrusion + contact shadow |
| `--shadow-card-hover` | Lifted panel: deeper extrusion + azure-tinted cast shadow |
| `--shadow-header` | Masthead: hairline + short drop shadow |
| `--shadow-slab` | Feature panels and sidebars |
| `--shadow-slab-deep` | Hero card inside the studio |

Radii: `--radius-card: 16px`, `--radius-control: 10px`, `--radius-sheet: 24px`.

Component classes (in `src/index.css`):

| Class | What it does |
|---|---|
| `.slab` | White panel with bevel and extruded bottom edge |
| `.studio` | The dark hero: near-black panel, grain, cyan/azure light sources |
| `.glass-dark` | Frosted panel for use inside `.studio` |
| `.tilt-3d` | 3° perspective tilt on hover — media cards only |
| `.lift` | 1.5° tilt plus lift — standard cards |
| `.btn-3d` | Extruded primary action; presses down 3 px on click |
| `.btn-glass` | Pressed-in glass secondary action |
| `.badge-3d` | Raised mustard marker (featured flag) |
| `.disc-3d` | Raised mustard disc (ranking numerals) |
| `.rule-3d` / `.rule-3d-sun` | Beveled masthead / footer rule |
| `.pill-3d` | Pressed-in status and filter pills |

The page background is paper plus a fine grain, never a stack of coloured blobs:

```css
body {
  background-image:
    url("data:image/svg+xml,...feTurbulence..."),  /* grain */
    radial-gradient(70rem 42rem at 14% -10%, rgb(255 255 255 / 0.95), transparent 64%),
    linear-gradient(180deg, #f7f9fb 0%, #eef2f6 46%, #f4f7fa 100%);
  background-attachment: fixed;
}
```

### 4.9 The animated background

The wash behind the page is **alive**: three oversized radial gradients drift
around the frame on long, offset cycles (`aurora-drift-1/2/3`, 38 s / 47 s / 56 s),
and the dark hero adds a slow rotating light sweep (`aurora-sweep`, 34 s).

| Layer | Where | Look |
|---|---|---|
| `.aurora--fixed` | Behind every public page and the admin desk | Azure, cyan and mustard blobs drifting over the paper — roughly ±7 per channel, never a flicker |
| `.aurora--studio` | Inside the dark hero | The same wash, screen-blended into a glow |
| `.studio-sweep` | Inside the dark hero | A conic light that rotates around the panel |

Rules that keep it cheap and safe:

- Only `transform` animates, so the gradients stay on the GPU and are never
  repainted.
- The layers are `pointer-events: none` and never affect layout.
- `prefers-reduced-motion` freezes every animation at its first frame.

---

## 5. Typography

| Role | Size / line-height | Weight | Colour |
|---|---|---|---|
| Display (homepage hero) | 34–48 px / 1.1 | 800 | ink |
| H1 (article title) | 30–40 px / 1.15 | 800 | ink |
| H2 (section / article) | 24–28 px / 1.25 | 700 | ink |
| H3 | 19–21 px / 1.35 | 700 | ink |
| Body | 17–18 px / 1.7 | 400 | ink / ink-soft |
| Card title | 17–19 px / 1.35 | 700 | ink |
| UI label | 14–15 px / 1.4 | 600 | ink-soft |
| Meta | 13 px / 1.4 | 500 | ink-muted |
| Ad label | 11 px / 1 | 600, 0.08em tracking, uppercase | ad-label |

- Font: `system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`.
  No web-font download (performance + low-end Android).
- Measure: article body max **72 ch**; cards clamp titles to 3 lines.
- Headings use `letter-spacing: -0.015em`; body `0`.
- Numbers in tables use `font-variant-numeric: tabular-nums`.

---

## 6. Shape, elevation, spacing, motion

- **Radius:** inputs/buttons `12px`, cards `16px`, sheets/modals `20px`, pills `999px`.
- **Spacing scale:** 4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 56 / 80.
- **Shadows:**
  - card: `0 6px 18px -12px rgb(21 96 143 / .30)`
  - card hover: `0 10px 24px -14px rgb(21 96 143 / .35)`
  - header: `0 1px 0 rgb(21 96 143 / .08)`
  - modal: `0 24px 60px -24px rgb(15 23 42 / .35)`
- **Motion:** fade-up 400 ms, scale-in 250 ms, hover lift 2 px / 200 ms.
  All animation disabled under `prefers-reduced-motion: reduce`.

---

## 7. Layout & breakpoints

| Name | Width | Notes |
|---|---|---|
| `sm` | 640 px | single column, 16 px gutters |
| `md` | 768 px | 2-column card grids |
| `lg` | 1024 px | public 3-column shell begins |
| `xl` | 1280 px | max content 1200 px, centred |

**Public shell**
- Sticky white header: logo · primary nav (News, Africa, Business, Tech & AI, Education,
  Sports, Lifestyle, World, **Videos**, **Resources**) · search · newsletter · account.
- Mobile: logo + search icon + menu; nav becomes a full-width sheet; no bottom bar on
  public pages (reserve bottom bar for the app future).
- Homepage grid on desktop: main feed `minmax(0,1fr)` + right rail `320px`.
- Footer: 4 columns (About, Sections, Legal, Contact) on `#154E75` or white-on-sky.
  Include publisher identity, address, contact email, editorial policy, privacy, terms,
  cookie preferences.

---

## 8. Public website screens

### 8.1 Homepage
1. **Top bar** (sticky, white, 64 px).
2. **Breaking strip** (optional, `sky-50` bg, `sky-700` text, dismissible, no auto-rotate).
3. **Hero:** 1 large featured story (16:9 image, category chip, headline, 2-line standfirst,
   byline + date, read-more link) + 2 stacked secondary stories.
4. **Trending now:** horizontal numbered list (1–5), rank in `sky-300`.
5. **Latest:** 3-column card grid; "Load more" button, never infinite scroll alone.
6. **Category bands:** one band per category, `bg-mist` header with "See all →".
7. **Ad slot:** homepage leaderboard between Latest and Categories, labelled.
8. **Newsletter card:** white card, single email field, explicit consent line.
9. **Footer.**

### 8.2 Category / tag / search
- Header: category name, one-line description, result count.
- Filter row: sort (Latest, Most read), type (Articles, Videos, Documents) on Resources.
- Grid of cards; empty state uses `--gradient-cloud-radial` + suggested categories.
- Search: query in `<h1>`, result count, highlighted matches in `sky-700`.

### 8.3 Article page
- Breadcrumb (Home › Category › Title) in meta type.
- Category chip, H1, standfirst, byline row (avatar, author, role, date, reading time,
  "Reviewed by" when applicable), share buttons.
- Featured image with caption + credit; `loading="eager"` only above the fold.
- Body column 72 ch; pull quotes on `mist`; inline images with alt text; tables scroll
  horizontally on mobile.
- **In-article ad slot** after the 2nd paragraph and another before the conclusion,
  each labelled and separated by 24 px of whitespace.
- Tags, author box, related articles (3), comments (if enabled), newsletter card.
- Sticky share rail on `lg+`; no sticky ad overlay.

### 8.4 Static pages
About, Contact, Privacy, Terms, Editorial Policy, Cookie Preferences — same shell,
narrow 72 ch column, "Last updated" date, contact form with validation and honeypot.

---

## 9. Learning Centre — Documents & Videos

This is a first-class module beside Blog. Three tabs at the top of `/resources`:
**All · Documents · Videos**.

### 9.1 Resource listing
- Filter chips: category, format (PDF, DOCX, PPTX, MP4, YouTube…), newest.
- Document card: cover thumbnail, format badge (`PDF`), title (3-line clamp), description
  (2-line clamp), `4.5 MB · 1,204 downloads`, category, date.
- Video card: 16:9 thumbnail with play glyph, duration badge, provider badge
  (YouTube / Vimeo / Uploaded), title, views, category.
- Grid: 1 / 2 / 3 columns. Cards are links to the detail page — **never** a download link.
- One labelled ad slot after the first row.

### 9.2 Document detail page
Order matters:

1. Breadcrumb + category chip.
2. **Title**, description, meta line: `PDF · 4.5 MB · Education & Technology · Published 2 Nov 2026`.
3. **Preview panel** — embedded PDF viewer (`<iframe>`/pdf.js) in a white card with
   `#0F172A` chrome, 70 vh on desktop, 60 vh on mobile, "Open full screen" and
   "Page 1 / 24" controls.
4. **Advertisement slot** — dashed `ad-bg`, label "Advertisement", separated by 32 px
   above and below. It is *not* inside the preview and *not* next to the download button.
5. **Download block** — its own white card: file icon, "Download PDF", "4.5 MB",
   full-width primary button on mobile, inline button on desktop, plus "Report a problem".
   If downloads are disabled by the admin: show "View only" and hide the button.
6. **About this document** — author/publisher, licence, upload date, version.
7. **Related documents** (3), then footer.

**Non-negotiable:** the download button works immediately, with no ad interaction, no
countdown, no "unlock" step. It is visually distinct from every ad on the page.

### 9.3 Video detail page
- 16:9 player at the top, dark chrome `#0F172A`, sky-blue progress/controls, native or
  provider embed; never autoplay with sound.
- Title, provider + duration, description, category, publish date, views.
- External links: validate provider → authorised embed URL → player; if embedding is
  blocked, show a fallback card: thumbnail, "This video can't be played here", and a
  plain "Watch on YouTube/Vimeo" link (clearly a link, not a fake player).
- One labelled ad slot below the description; no ad inside the player or over controls.
- Related videos, then footer.

### 9.4 Upload / processing states (admin-facing)
`Queued → Uploading (progress %) → Processing → Ready` or `Failed (retry)`.
Use semantic pills, never a spinner without text.

---

## 10. Auth & account

- Split layout on desktop: `--gradient-cloud` panel with brand + one trust line on the
  left, white form card on the right. Single column on mobile.
- Inputs 48 px tall, labels above, inline errors in danger red with icon + text.
- Password rules shown before submit; show/hide toggle.
- Social login is out of scope for MVP.
- Reader account (optional in MVP) shows saved articles and newsletter preferences only.

---

## 11. Admin & editorial dashboard

### 11.1 Shell
- Left rail 240 px, white, `line` border; the page keeps the public paper
  background; content cards are white slabs with a bevel and a 2 px extruded
  bottom edge.
- Rail groups: **Overview · Content** (Articles, Resources, Categories, Tags, Comments) ·
  **AI Desk** (Trends, Research, Drafts, Fact-check, Agent settings) · **Audience**
  (Newsletter, Analytics) · **Revenue** (Ads, Sponsorships) · **System** (Users, Roles,
  Settings, Audit log).
- Top bar: breadcrumb, global search, "New article" primary button, notifications, account.
- Collapse to icon rail at `md`, off-canvas drawer on mobile.

### 11.2 Overview
Stat cards (6 per row on `xl`, 2 on mobile): Total articles, Published, Drafts, Pending
review, Users, Subscribers. Then: views sparkline, most-read table, AI task health
(done / failed), latest activity. Each card links to its filtered list.

### 11.3 Article editor
- Two-pane: writing canvas (max 72 ch) + right inspector (Publish, SEO, Categories & tags,
  Featured image, AI suggestions).
- Sticky status bar: current status pill, word count, last saved, "Preview", "Submit for
  review", "Approve & publish" (role-gated).
- Status pills: Draft (neutral), Pending Review (warning), Approved (info), Scheduled
  (mustard), Published (success), Archived (neutral). Every pill keeps its label —
  colour is never the only signal.
- SEO inspector: title (60), meta description (155), slug, primary keyword, score hints —
  show counts, not fake "SEO score out of 100".
- Preview opens the real article template in a new tab with a "Preview" ribbon.

### 11.4 AI Desk
Every AI surface follows the same anatomy:
1. **Input** — topic, angle, audience, category, tone, length.
2. **Run state** — queued / running (with step labels: researching → drafting → checking).
3. **Result** — editable draft, keyword table, outline, sources list, fact-check flags.
4. **Human gate** — "Insert into editor", "Save as draft", "Discard"; approval is explicit.

- **Trend discovery:** ranked table — topic, region, category, momentum, urgency,
  suggested headline, "Start draft".
- **Research:** source cards with domain, title, date, credibility note, "confirmed /
  alleged / opinion" tag, open-in-new-tab. Conflicting claims are grouped side by side.
- **Draft writer:** split view — AI draft left, editor right; insert section by section.
- **SEO assistant:** keyword table with intent and difficulty; copy buttons; suggested
  internal links as chips.
- **Fact-check:** claim list with severity (danger = unsupported, warning = conflicting,
  info = needs source), quote, and "Mark verified" / "Remove claim".
- **Agent management:** provider + key (masked, write-only), model, temperature, max
  tokens, feature toggles (Trends, Research, Writer, SEO, Fact-check), monthly budget,
  usage table (tasks, tokens, estimated cost), failed-task retry.
- AI text is never rendered as published article styling: use `mist` background, a small
  "AI draft — needs review" label, and `ink-soft` text.

### 11.5 Resource manager
- Tabs: Documents · Videos · Categories · Media library · Download analytics · Video
  analytics · Ad placements.
- Upload drawer: drag-drop, accepted types, size limit, progress, cover/thumbnail,
  title/description, category, tags, "Allow download" switch, publish date.
- Table columns: title, type, category, status, views, downloads, updated, actions.
- Video row shows processing state and retry on failure.

### 11.6 Ads manager
- Placement list with a **wireframe preview** showing exactly where each unit appears.
- Fields: name, slot ID, page type (home, article, resource list, document, video),
  device (all/mobile/desktop), enabled, consent requirement.
- A permanent compliance note: "Ads must remain labelled and separate from content and
  controls. Never gate downloads or playback behind an ad click."

### 11.7 Tables & forms (shared)
- Table: white card, `cloud` header, 44 px rows, hover `sky-50`, sticky first column on
  mobile, row actions in a `⋯` menu.
- Bulk actions bar appears only with a selection.
- Forms: two-column on `lg`, one on mobile; required marked with text, not just an asterisk.
- Destructive actions: danger button + typed confirmation for irreversible deletes.
- Empty states always offer the next action.

---

## 12. Component specs

| Component | Spec |
|---|---|
| Primary button | `bg sky-600`, white, 44 px, radius 12, semibold; hover `sky-700`; active scale .97; focus ring `sky-500` 2 px + 2 px offset |
| Secondary | white, 1 px `line`, `sky-700` text; hover `sky-50` |
| Ghost | transparent, `ink-soft`; hover `sky-50` |
| Destructive | `danger` fill, white text; never next to primary without spacing |
| Link | `sky-700`, underline on hover; visited stays `sky-700` (news site, not docs) |
| Input | white, `line` border, 44–48 px, radius 12; focus `sky-500` ring |
| Search | pill, `cloud` fill, icon left, clear button right |
| Chip / filter | `cloud` bg, `ink-soft`; selected `sky-100` + `sky-700` + `sky-200` border |
| Card | white, `line` border, radius 16, card shadow; hover lift 2 px |
| Status pill | semantic fill + text, 12 px, 999 radius, dot + label (never colour alone) |
| Tabs | underline 2 px `sky-600` active, `ink-muted` inactive |
| Pagination | ghost numbers, active `sky-600` fill |
| Toast | bottom-right desktop, top mobile; semantic icon + text; 5 s |
| Modal | white, radius 20, modal shadow, `Escape` closes, focus trapped |
| Skeleton | `mist` base with `cloud-deep` shimmer, 1.4 s, reduced-motion off |
| Ad slot | dashed `ad-line`, `ad-bg`, 11 px "Advertisement" label, min-height reserved to avoid CLS |
| PDF viewer | white card, dark chrome, toolbar with page count, fullscreen, download *outside* the viewer |
| Video player | 16:9, `#0F172A`, sky controls, no autoplay sound, captions where available |
| File badge | `PDF` red-tint, `DOC` blue-tint, `PPT` orange-tint, `MP4` violet-tint — tint only, text stays readable |

---

## 13. AdSense-safe UI — hard rules

1. **No incentivised clicks.** Copy never says "click an ad to download/support/unlock".
2. **No ad-shaped controls.** Download and play buttons are solid sky blue; ads are
   dashed neutral. They never share a border, card or row.
3. **Always labelled.** The word "Advertisement" sits above every unit, 11 px uppercase.
4. **Reserved space.** Every slot has a fixed min-height so layout doesn't jump (CLS).
5. **No overlays.** No interstitial, sticky bottom ad covering content, or ad over a player.
6. **No accidental taps.** 24 px minimum gap from any button or link.
7. **Consent-aware.** Cookie/consent banner appears before personalised ads where required;
   "Reject" is as easy to find as "Accept".
8. **Policy pages linked** from the footer and the ad manager.
9. **Downloads and playback never depend on ads.** Verified in QA on every release.
10. **No autoplay audio**, no pop-unders, no deceptive navigation.

---

## 14. Accessibility

- WCAG 2.2 AA target. Body text ≥ 4.5:1; large text/UI ≥ 3:1.
- Visible focus on every interactive element (2 px `sky-500`, 2 px offset).
- Semantic landmarks: `header`, `nav`, `main`, `article`, `aside`, `footer`.
- One `h1` per page; heading order never skips.
- Images need alt text; decorative images `alt=""`.
- Video: captions/transcripts where available; player controls keyboard operable.
- Forms: label tied to input, error announced, `aria-describedby` for help text.
- Status is never colour alone — dot + text label.
- Hit targets ≥ 44 × 44 px.
- Respect `prefers-reduced-motion` and `prefers-color-scheme` (light only for v1).
- Skip-to-content link first in the tab order.

---

## 15. SEO in the UI

- Clean URLs: `/news/{slug}`, `/category/{slug}`, `/resources/documents/{slug}`,
  `/resources/videos/{slug}`, `/author/{slug}`.
- Breadcrumbs visible and mirrored in `BreadcrumbList` JSON-LD.
- Article pages emit `NewsArticle`/`Article`; documents emit `DigitalDocument`;
  videos emit `VideoObject` with thumbnail and duration.
- Canonical, Open Graph and Twitter card tags per page; share previews use the featured
  image at 1200 × 630.
- Sitemap index split by type (articles, categories, documents, videos) + `robots.txt`.
- Pagination uses real links (`?page=2`), not JS-only.
- Images: responsive `srcset`, AVIF/WebP, width/height set, lazy below the fold.
- No index on search results, previews, admin, or thin tag pages.

---

## 16. Performance budget

| Metric | Target |
|---|---|
| LCP (mobile, 4G) | < 2.5 s |
| CLS | < 0.1 (ad slots pre-reserved) |
| INP | < 200 ms |
| Initial JS (public route) | < 170 KB gzipped |
| Hero image | < 200 KB, AVIF/WebP |
| Fonts | 0 web-font requests (system stack) |

Rules: no client-side data fetching for above-the-fold content (server render/SSR),
route-level code splitting, lazy-load the PDF viewer and video player, cache media on a
CDN, never serve large video from the API server.

---

## 17. Ready-to-paste Tailwind theme

For Tailwind v4 (`@import 'tailwindcss'`). Class names used by components stay stable.

```css
@theme {
  --font-sans: system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  --font-heading: var(--font-sans);

  /* Surfaces */
  --color-page: #eaf4ff;
  --color-panel: #ffffff;
  --color-cloud: #f7fbff;
  --color-mist: #e3f2fe;
  --color-cloud-deep: #c6e6fc;
  --color-line: #cfe6f7;
  --color-line-strong: #a9d3ee;

  /* Text */
  --color-ink: #1e293b;
  --color-ink-soft: #475569;
  --color-ink-muted: #64748b;
  --color-ink-faint: #94a3b8;

  /* Brand aliases */
  --color-brand: #15608f;
  --color-gold: #15608f; /* legacy alias kept for compatibility */

  /* Sky ramp (the action colour) */
  --color-sky-50: #f2f9ff;
  --color-sky-100: #e3f2fe;
  --color-sky-200: #c6e6fc;
  --color-sky-300: #9dd5f9;
  --color-sky-400: #6bc0f3;
  --color-sky-500: #3fa9ea;
  --color-sky-600: #1a77b6;
  --color-sky-700: #15608f;
  --color-sky-800: #175f90;
  --color-sky-900: #154e75;

  /* Ads */
  --color-ad-bg: #f8fafc;
  --color-ad-line: #cbd5e1;
  --color-ad-label: #64748b;

  --radius-card: 16px;
  --radius-control: 12px;
  --radius-sheet: 20px;
}

@layer base {
  body {
    background-color: var(--color-page);
    color: var(--color-ink);
  }
  input,
  select,
  textarea {
    background-color: #ffffff;
    color: var(--color-ink);
    border-color: var(--color-line);
    color-scheme: light;
  }
  input::placeholder,
  textarea::placeholder {
    color: var(--color-ink-muted);
  }
  ::selection {
    background: rgb(63 169 234 / 0.25);
  }
  :focus-visible {
    outline: 2px solid var(--color-sky-500);
    outline-offset: 2px;
  }
}

/* Reading column */
.prose-article {
  color: var(--color-ink);
  font-size: 1.0625rem;
  line-height: 1.7;
  max-width: 72ch;
}
.prose-article > * + * { margin-top: 1em; }
.prose-article h2 { margin-top: 1.6em; font-size: 1.5rem; line-height: 1.25; }
.prose-article h3 { margin-top: 1.4em; font-size: 1.2rem; }
.prose-article a { color: var(--color-sky-700); text-decoration: underline; }
.prose-article blockquote {
  border-left: 4px solid var(--color-sky-300);
  background: var(--color-mist);
  padding: 0.75rem 1rem;
  border-radius: 0 12px 12px 0;
}

/* Ad container — reserved height prevents CLS */
.ad-slot {
  min-height: 280px;
  display: grid;
  place-items: center;
  background: var(--color-ad-bg);
  border: 1px dashed var(--color-ad-line);
  border-radius: 12px;
  margin-block: 2rem;
}
.ad-slot__label {
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-ad-label);
  font-weight: 600;
}

/* Card lift */
.lift {
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}
.lift:hover,
.lift:focus-within {
  transform: translateY(-2px);
  box-shadow: 0 10px 24px -14px rgb(21 96 143 / 0.35);
  border-color: rgb(63 169 234 / 0.55);
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

Tailwind v3 users: move the colour values into `theme.extend.colors` and keep the same
token names (`page`, `panel`, `cloud`, `mist`, `line`, `ink`, `sky`, `ad`).

---

## 18. Frontend structure (built)

The scaffold in `frontend/` is a Vite + React 19 + TypeScript app using React Router v7
and Tailwind v4 (`@tailwindcss/vite`). Public pages hydrate from the FastAPI backend in
`backend/` when `VITE_API_URL` is set, and fall back to the bundled demo content in
`src/data/content.ts` when it is not. Admin screens still use local state; they are not
wired to the API yet.

```
frontend/
  index.html                # title, description, OG tags, favicon, theme-color
  public/
    forum24.jpg             # supplied logo source
    forum24-logo.png        # trimmed, transparent lockup for light surfaces
    forum24-logo-inverse.png# white lockup for the dark footer
    favicon.svg             # square app icon
  scripts/
    smoke.mjs               # jsdom render of every route, reports runtime errors
    qa.mjs                  # Playwright: 4 widths, overflow, CLS, PDF, player, keyboard
  src/
    main.tsx                # createRoot + StrictMode
    App.tsx                 # BrowserRouter, all routes, static policy copy
    index.css               # @theme tokens, base layer, .prose-article, .ad-slot, .lift
    data/
      content.ts            # types + mock articles, documents, videos, admin, AI data
    lib/
      api.ts                # /bootstrap fetch, camelCase contract, mock fallback
      documentPdf.ts        # pdf-lib builder for real sample PDFs (lazy-loaded)
    components/
      layout/               # Header, Footer, Logo, PublicLayout, AdminLayout, RouteTitle
      ui/                   # Button, Chip, StatusPill, AdSlot, Breadcrumbs, SectionHead, Cover
      content/              # ArticleCard, FeaturedArticle, DocumentCard, VideoCard, NewsletterCard
      resources/            # PdfViewer, VideoPlayer, DownloadBlock
      admin/                # StatCard
    pages/
      public/               # Home, Article, Category, Search, Resources, Document, Video,
                            # Author, StaticPage, Contact, Login, NotFound
      admin/                # AdminOverview, AdminArticles, AdminArticleEditor, AdminResources,
                            # AdminAiDesk, AdminAds, AdminAnalytics, AdminSettings
```

### Route map

| Path | Page |
| --- | --- |
| `/` | Homepage |
| `/news/:slug` | Article |
| `/category/:slug` | Section |
| `/search?q=` | Search (articles + documents + videos) |
| `/resources?tab=&category=` | Learning Centre listing |
| `/resources/documents/:slug` | Document detail (preview → ad → download) |
| `/resources/videos/:slug` | Video detail (inline player + fallback) |
| `/author/:slug` | Author archive |
| `/about`, `/privacy`, `/terms`, `/editorial-policy`, `/contact` | Static / policy pages |
| `/login` | Editorial sign-in (demo) |
| `/admin` | Dashboard |
| `/admin/articles`, `/admin/articles/new`, `/admin/articles/:id` | Article list + editor |
| `/admin/resources` | Resource manager |
| `/admin/ai` | AI Desk (trends, research, writer, SEO, fact-check, settings) |
| `/admin/ads`, `/admin/analytics`, `/admin/settings` | Revenue, analytics, settings/audit |
| `*` | 404 |

### Commands

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
npm run build      # tsc -b && vite build
npm run preview    # serve dist/
npm run smoke      # render every route in jsdom, report runtime errors
npm run qa         # Playwright pass; run `npm run dev` in another terminal first
```

`npm run lint` (oxlint) is currently broken in this environment: the OS Application
Control policy blocks the native binding. `npm run build` is the verification step.

`npm run qa` screenshots every key page at 360, 768, 1024 and 1440 px into
`frontend/qa/` (gitignored), checks horizontal overflow and CLS, downloads the real
PDF, exercises the player, and walks the homepage with the keyboard. It probes ports
5173 and 5174 unless `QA_BASE` is set.

### Backend (built)

`backend/` is a FastAPI service with SQLAlchemy 2 (`asyncio`), Alembic migrations and
PostgreSQL for deployment (SQLite for local development). It serves the same camelCase
content shapes the frontend already uses.

```
backend/
  app/
    main.py               # app factory, CORS, /health, optional startup seed
    config.py             # pydantic-settings; DATABASE_URL, SECRET_KEY, CORS_ORIGINS
    models.py             # users, categories, articles, tags, documents, videos,
                          # comments, ads, AI tasks, audit log
    schemas/              # camelCase request/response contracts
    routers/
      public.py           # /bootstrap, articles, documents, videos, search, authors,
                          # ads, comments, newsletter, contact, PDF download
      auth.py             # /auth/login, /auth/token, /auth/me
      admin_articles.py   # editorial CRUD + submit/approve/publish/schedule/unschedule/reject/archive
      admin_resources.py  # documents, videos, upload stub
      admin_ads.py        # placements and compliance
      admin_ai.py         # AI desk tasks and settings
      admin_analytics.py  # dashboard stats and analytics
      admin_system.py     # users, audit log, comment moderation
    security.py           # scrypt password hashing + HS256 bearer tokens
    services/             # audit log + scheduled auto-publisher (publisher.py)
    seed.py               # demo content; `python -m app.seed [--reset]`
  alembic/                # initial schema + env wired to app settings
  tests/                  # 40 pytest tests: public, admin/RBAC, security, PDF
  Dockerfile              # Python 3.12, unprivileged user, healthcheck
  docker-compose.yml      # PostgreSQL 17 + API, migrations on startup
```

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate                 # Windows; source .venv/bin/activate elsewhere
python -m pip install -e ".[dev]"
python -m app.seed                     # SQLite + demo content
uvicorn app.main:app --reload --port 8000
python -m pytest -q                    # 40 tests
python -m alembic upgrade head         # apply migrations instead of seeding
```

Or run PostgreSQL and the API together with `docker compose up --build`. Demo sign-in is
`admin@forum24.example` / `Forum24!demo`; every seeded staff account shares that
password. See `backend/README.md` for the full endpoint and configuration reference.

Editorial rules enforced by the API, not just the UI:

- An article cannot be published until a reviewer has approved it; publishing an
  unapproved draft returns `409`.
- AI tasks can produce drafts but never publish.
- Status is stored explicitly and serialised with a human label.
- Approved articles (and only approved articles) can be scheduled; a background
  publisher moves them to Published when the slot passes and writes an audit entry.
- Ads are separate records returned by their own endpoint and never gate content or
  downloads.
- Every editorial transition is written to `audit_log` with the acting user.

### Frontend ↔ API

Set `VITE_API_URL=http://localhost:8000` (copy `frontend/.env.example` to
`.env.local`) and the app fetches `/api/v1/bootstrap` once before mounting, then replaces
the exported arrays in `src/data/content.ts` in place with live categories, articles,
documents and videos. If the URL is unset, or the request fails/times out, the bundled
demo content stays in place, so design work and offline demos still work.

With the API configured, the editorial screens are live too: `/login` exchanges
credentials for a bearer token (stored in `localStorage` by `src/lib/session.ts`),
`/admin/*` redirects to `/login` without a session, the article table loads
`/admin/articles` and runs submit/approve/reject/publish/schedule/unschedule actions, the
editor loads and saves real records, and the contact/newsletter forms post to
`/contact` and `/newsletter`. Without the API they stay local-state demos.

### What is real and what is mocked

- **Documents** — `PdfViewer` generates a real, openable 6-page sample PDF with
  `pdf-lib` (lazily imported, cached per slug) and shows it in a blob iframe. The
  download button saves that same PDF. The catalogue page count is the full edition;
  the preview is explicitly labelled a sample excerpt. Two non-PDF records are marked
  `downloadable: false`, so "View only" is honest.
- **Video** — the player is a real, keyboard-operable control surface (play/pause,
  seek, chapters, captions, mute, full screen) with per-video chapters and transcripts.
  Playback progress is simulated because no video file is streamed; production mounts
  the provider embed inside the same shell.
- **Content** — public pages read the exported arrays in `content.ts`, which are replaced
  with `/api/v1/bootstrap` data when `VITE_API_URL` is configured. Without the API the
  same pages still render the bundled demo records.
- **Admin** — when `VITE_API_URL` is set, the article table and editor load and save
  through `/api/v1/admin/*` with the stored bearer token; `/admin/*` is guarded and
  redirects to `/login` without a session. Without the API the forms stay local-state
  demos with the bundled records.
- **Auth** — the sign-in form calls `/auth/login` when the API is configured and stores
  the bearer token in `localStorage` (`src/lib/session.ts`); a 401 clears the session and
  returns the editor to `/login`. Without the API the form keeps its demo walk-through.

---

## 19. Design acceptance checklist

Verified with `npm run build`, `npm run smoke` (32 routes, 0 runtime errors) and
`npm run qa` (Playwright/Chromium at 360, 768, 1024 and 1440 px). The backend was
verified with `python -m pytest -q` (40 passing), `alembic upgrade head` /
`downgrade base` on a fresh SQLite database, and another `npm run smoke` with
`VITE_API_URL` pointed at the running API, which hydrates live content with 0 errors.

- [x] Page background is `#EAF4FF`; all content sits on white cards.
- [x] Exactly one primary blue per view (`sky-600` fill / `sky-700` link).
- [x] Article body measure ≤ 72 ch and ≥ 17 px.
- [x] Every ad slot is dashed, neutral, labelled "Advertisement", height reserved.
- [x] Document download button works with ads blocked and with ads never clicked;
      the downloaded file is a valid PDF, not a placeholder text file.
- [x] Video plays inline; blocked embeds show a clear fallback link.
- [x] Status shown with pill + text, not colour alone.
- [x] AI output is visually marked as draft and requires an explicit human action.
- [x] All policy pages reachable from the footer.
- [x] Keyboard-only pass: the skip link is the first Tab stop, and every Tab stop on
      the homepage shows a visible focus ring.
- [x] 360, 768, 1024 and 1440 px layouts checked: no horizontal overflow on the home,
      article, document, video, dashboard, resources or analytics pages.
- [x] No layout shift when the PDF preview and ad slots mount: measured CLS < 0.1 at
      every tested page and width.

Still open:

- [ ] Wire the admin screens, login and comments/forms to the API (the endpoints and RBAC
      exist; the UI still uses local state).
- [ ] Store and refresh bearer tokens safely (httpOnly cookies or a memory + refresh
      strategy) before the admin UI is exposed.
- [ ] Real object storage and virus scanning for uploads; the API currently returns a
      placeholder presign slot.
- [ ] Focus trap and Escape handling for real modals (the upload dialog is currently
      presentational).
- [ ] Re-run `npm run qa` against API-backed content and against PostgreSQL
      (Docker was unavailable in this environment; the SQLite path is verified).
- [ ] Add rate limiting on login, comments, newsletter and contact endpoints before
      public launch.

---

## 20. Open questions for the next session

1. Brand asset: the supplied lockup is a JPG; a vector (SVG/AI) source would keep the
   header and favicon perfectly sharp at every size.
2. Reader accounts in MVP, or newsletter-only until phase 2?
3. Where will the API run (managed Postgres + container host), and who owns database
   backups and secret rotation?
4. Video storage: S3/R2 + CDN, or start with YouTube/Vimeo only?
5. Should the admin dashboard share the public header, or be fully separate? (Guide assumes separate shell.)
6. Do editors need email/Slack notifications on submit-review and approve, or is the
   in-app queue enough for launch?
