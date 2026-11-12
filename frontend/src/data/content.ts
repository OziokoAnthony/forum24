export type Category = {
  slug: string
  name: string
  description: string
}

export type ArticleBlock =
  | { type: 'p'; text: string }
  | { type: 'h2'; text: string }
  | { type: 'quote'; text: string }
  | { type: 'list'; items: string[] }

export type Article = {
  slug: string
  title: string
  standfirst: string
  category: string
  author: string
  authorRole: string
  date: string
  readingTime: number
  views: number
  cover: number
  tags: string[]
  reviewedBy?: string
  featured?: boolean
  trending?: boolean
  body: ArticleBlock[]
}

export type DocFormat = 'PDF' | 'DOCX' | 'PPTX'

export type ResourceDoc = {
  slug: string
  title: string
  description: string
  format: DocFormat
  size: string
  pages: number
  category: string
  downloads: number
  published: string
  cover: number
  publisher: string
  licence: string
  version: string
  downloadable: boolean
}

export type VideoProvider = 'YouTube' | 'Vimeo' | 'Uploaded'

export type Video = {
  slug: string
  title: string
  description: string
  provider: VideoProvider
  duration: string
  views: number
  category: string
  published: string
  cover: number
  embeddable: boolean
  chapters: { at: string; label: string }[]
  transcript: string[]
}

export type ArticleStatus = 'Draft' | 'Pending Review' | 'Approved' | 'Scheduled' | 'Published' | 'Archived'

export type AdminArticle = {
  id: number
  title: string
  category: string
  status: ArticleStatus
  author: string
  aiDraft: boolean
  views: number
  updated: string
}

export const categories: Category[] = [
  { slug: 'news', name: 'Nigeria News', description: 'National developments, public affairs and local reporting.' },
  { slug: 'africa', name: 'Africa News', description: 'Economy, politics and society across the continent.' },
  { slug: 'business', name: 'Business & Finance', description: 'Entrepreneurship, markets and investment education.' },
  { slug: 'tech', name: 'Technology & AI', description: 'AI, software, gadgets and digital innovation.' },
  { slug: 'education', name: 'Education & Opportunities', description: 'Scholarships, admissions, jobs, grants and exams.' },
  { slug: 'sports', name: 'Sports', description: 'Football, athletics, competitions and analysis.' },
  { slug: 'entertainment', name: 'Entertainment', description: 'Celebrity, music, movies and events.' },
  { slug: 'lifestyle', name: 'Lifestyle & Culture', description: 'Relationships, fashion, food, travel and culture.' },
  { slug: 'world', name: 'World News', description: 'International developments and global affairs.' },
  { slug: 'tutorials', name: 'Tutorials & Guides', description: 'Practical technology, business and educational guides.' },
]

const longBody = (topic: string): ArticleBlock[] => [
  {
    type: 'p',
    text: `${topic} is moving from a talking point to a working reality across Nigeria and the wider continent. The shift is visible in boardrooms, on university campuses and in the small teams shipping products from co-working spaces in Lagos, Abuja and Kigali.`,
  },
  { type: 'h2', text: 'Why this moment matters' },
  {
    type: 'p',
    text: 'Three forces are converging: cheaper cloud infrastructure, a young and connected population, and a wave of founders who are building for African conditions rather than adapting products designed elsewhere. The result is a market that is finally beginning to reward local context.',
  },
  {
    type: 'p',
    text: 'Investors are paying attention, but the capital is only part of the story. The more durable change is operational: teams are learning to ship faster, measure honestly and treat distribution as a first-class problem.',
  },
  {
    type: 'quote',
    text: 'The opportunity is not to copy the last decade of Silicon Valley. It is to solve the problems that are specific to how Africa lives, works and trades.',
  },
  { type: 'h2', text: 'What still stands in the way' },
  {
    type: 'list',
    items: [
      'Payment rails that still fail at the edges, especially across borders.',
      'A skills gap that is narrowing but not fast enough for demand.',
      'Regulatory uncertainty that makes long-term planning difficult.',
      'Access to patient capital for founders outside the major hubs.',
    ],
  },
  {
    type: 'p',
    text: 'None of these problems is unsolvable. What they require is a longer view: infrastructure that compounds, institutions that keep their word, and a media ecosystem that reports on the work honestly rather than chasing the loudest headline.',
  },
  { type: 'h2', text: 'What happens next' },
  {
    type: 'p',
    text: 'Over the next two years, expect consolidation in crowded categories and quiet breakthroughs in unglamorous ones — logistics, compliance, health records, education delivery. The companies that win will be the ones that treat trust as a product feature rather than a marketing line.',
  },
]

export const articles: Article[] = [
  {
    slug: 'nigeria-ai-startups-african-infrastructure',
    title: 'Nigeria’s AI startups are quietly building the next wave of African infrastructure',
    standfirst:
      'From Lagos to Kigali, a new generation of founders is turning language, payments and logistics into products built for the continent first.',
    category: 'Technology & AI',
    author: 'Adaeze Okonkwo',
    authorRole: 'Technology Editor',
    date: '11 Nov 2026',
    readingTime: 6,
    views: 12480,
    cover: 0,
    tags: ['AI', 'Startups', 'Nigeria', 'Infrastructure'],
    reviewedBy: 'Emeka Nwosu',
    featured: true,
    trending: true,
    body: longBody('African AI infrastructure'),
  },
  {
    slug: 'afcfta-new-phase-intra-african-trade',
    title: 'AfCFTA enters a new phase as intra-African trade rules tighten',
    standfirst:
      'The agreement is moving from signature to implementation, and businesses are discovering that the details matter more than the headline.',
    category: 'Africa News',
    author: 'Tunde Bakare',
    authorRole: 'Africa Correspondent',
    date: '11 Nov 2026',
    readingTime: 5,
    views: 8320,
    cover: 1,
    tags: ['AfCFTA', 'Trade', 'Policy'],
    trending: true,
    body: longBody('Intra-African trade'),
  },
  {
    slug: '2027-scholarship-round-opens',
    title: '2027 scholarship round opens for Nigerian undergraduates',
    standfirst:
      'Applications are open for federal and state scholarships, with new deadlines and a simplified document checklist.',
    category: 'Education & Opportunities',
    author: 'Ngozi Eze',
    authorRole: 'Education Reporter',
    date: '10 Nov 2026',
    readingTime: 4,
    views: 21040,
    cover: 2,
    tags: ['Scholarships', 'Education', 'Students'],
    trending: true,
    body: longBody('The 2027 scholarship cycle'),
  },
  {
    slug: 'fintechs-beyond-lagos-growth',
    title: 'Why Nigeria’s fintechs are looking beyond Lagos for growth',
    standfirst:
      'The next million customers are in Kano, Aba and Ibadan. The products that reach them will look different from the ones that won the first wave.',
    category: 'Business & Finance',
    author: 'Chiamaka Obi',
    authorRole: 'Business Editor',
    date: '10 Nov 2026',
    readingTime: 8,
    views: 9780,
    cover: 3,
    tags: ['Fintech', 'Payments', 'Growth'],
    body: longBody('Fintech expansion outside Lagos'),
  },
  {
    slug: 'afrobeats-stadium-tour-export',
    title: 'Afrobeats’ next export is a stadium tour, not a single',
    standfirst:
      'The genre has already conquered streaming. The harder test is filling rooms in cities where the audience is still being built.',
    category: 'Entertainment',
    author: 'Femi Adeyemi',
    authorRole: 'Culture Writer',
    date: '10 Nov 2026',
    readingTime: 5,
    views: 15620,
    cover: 4,
    tags: ['Afrobeats', 'Music', 'Live events'],
    body: longBody('Afrobeats live touring'),
  },
  {
    slug: 'super-eagles-rebuild-midfield',
    title: 'The Super Eagles rebuild starts with the midfield',
    standfirst:
      'A younger core is emerging, but the balance between control and transition is still the team’s unresolved question.',
    category: 'Sports',
    author: 'Ibrahim Musa',
    authorRole: 'Sports Analyst',
    date: '10 Nov 2026',
    readingTime: 4,
    views: 11090,
    cover: 5,
    tags: ['Football', 'Super Eagles', 'Analysis'],
    body: longBody('The Super Eagles rebuild'),
  },
  {
    slug: 'lagos-rail-line-commuter-numbers',
    title: 'Lagos rail line sees record commuter numbers in first full quarter',
    standfirst:
      'Ridership is beating early projections, but last-mile connections remain the difference between a successful line and a usable network.',
    category: 'Nigeria News',
    author: 'Halima Bello',
    authorRole: 'News Reporter',
    date: '9 Nov 2026',
    readingTime: 3,
    views: 6410,
    cover: 1,
    tags: ['Lagos', 'Transport', 'Infrastructure'],
    body: longBody('Lagos rail ridership'),
  },
  {
    slug: 'climate-finance-african-cities',
    title: 'Climate finance is arriving in African cities — slowly',
    standfirst:
      'Municipal governments are learning to package projects that global funds can actually finance. The learning curve is steep.',
    category: 'World News',
    author: 'Sarah Mensah',
    authorRole: 'Climate Correspondent',
    date: '9 Nov 2026',
    readingTime: 7,
    views: 4890,
    cover: 0,
    tags: ['Climate', 'Finance', 'Cities'],
    body: longBody('Climate finance in African cities'),
  },
]

export const documents: ResourceDoc[] = [
  {
    slug: 'complete-guide-web-development',
    title: 'Complete Guide to Web Development',
    description:
      'A practical introduction to HTML, CSS, JavaScript and deployment, written for beginners in Nigeria and across Africa.',
    format: 'PDF',
    size: '4.5 MB',
    pages: 24,
    category: 'Education & Technology',
    downloads: 1204,
    published: '2 Nov 2026',
    cover: 0,
    publisher: 'FORUM24 Learning',
    licence: 'Free for personal use',
    version: '1.2',
    downloadable: true,
  },
  {
    slug: 'beginners-guide-python',
    title: 'Beginner’s Guide to Python',
    description: 'Variables, loops, functions and your first small project — with exercises after every chapter.',
    format: 'PDF',
    size: '2.1 MB',
    pages: 38,
    category: 'Technology & AI',
    downloads: 2870,
    published: '28 Oct 2026',
    cover: 1,
    publisher: 'FORUM24 Learning',
    licence: 'Free for personal use',
    version: '1.0',
    downloadable: true,
  },
  {
    slug: 'cv-writing-for-graduates',
    title: 'CV Writing for Graduates',
    description: 'A short, practical workbook for first-job applicants, including three annotated CV examples.',
    format: 'DOCX',
    size: '480 KB',
    pages: 12,
    category: 'Education & Opportunities',
    downloads: 4310,
    published: '20 Oct 2026',
    cover: 2,
    publisher: 'FORUM24 Careers',
    licence: 'Free to share',
    version: '2.0',
    downloadable: false,
  },
  {
    slug: 'digital-marketing-basics',
    title: 'Digital Marketing Basics',
    description: 'How small businesses can use search, social and email without wasting money on the wrong channels.',
    format: 'PDF',
    size: '3.4 MB',
    pages: 31,
    category: 'Business & Finance',
    downloads: 1980,
    published: '14 Oct 2026',
    cover: 3,
    publisher: 'FORUM24 Business',
    licence: 'Free for personal use',
    version: '1.1',
    downloadable: true,
  },
  {
    slug: 'ai-for-small-business',
    title: 'AI for Small Business',
    description: 'A plain-language deck on where AI saves time today, and where it still needs a human in the loop.',
    format: 'PPTX',
    size: '6.8 MB',
    pages: 42,
    category: 'Technology & AI',
    downloads: 760,
    published: '8 Oct 2026',
    cover: 4,
    publisher: 'FORUM24 Learning',
    licence: 'Attribution required',
    version: '1.0',
    downloadable: false,
  },
  {
    slug: 'study-skills-handbook',
    title: 'Study Skills Handbook',
    description: 'Note-taking, revision planning and exam preparation techniques for secondary and university students.',
    format: 'PDF',
    size: '1.9 MB',
    pages: 18,
    category: 'Education & Opportunities',
    downloads: 3220,
    published: '1 Oct 2026',
    cover: 5,
    publisher: 'FORUM24 Learning',
    licence: 'Free to share',
    version: '1.3',
    downloadable: false,
  },
]

export const videos: Video[] = [
  {
    slug: 'introduction-to-artificial-intelligence',
    title: 'Introduction to Artificial Intelligence',
    description:
      'What AI actually is, how large language models work, and where the opportunities are for African builders.',
    provider: 'YouTube',
    duration: '14:32',
    views: 8410,
    category: 'Technology & AI',
    published: '9 Nov 2026',
    cover: 0,
    embeddable: true,
    chapters: [
      { at: '00:00', label: 'What AI actually is' },
      { at: '03:10', label: 'How language models work' },
      { at: '09:45', label: 'Where African builders can start' },
    ],
    transcript: [
      'Artificial intelligence is a label for a family of methods, not a single product. Most of what you meet today is pattern recognition at scale.',
      'A language model predicts the next token from the context it was given. It does not look anything up unless you give it something to look at.',
      'The practical opportunity for builders is not a better chatbot. It is taking a slow, repetitive task inside a real business and making it fast.',
    ],
  },
  {
    slug: 'prompting-for-beginners',
    title: 'Prompting for Beginners',
    description: 'A calm, practical walkthrough of writing prompts that produce useful, checkable output.',
    provider: 'Vimeo',
    duration: '11:04',
    views: 5120,
    category: 'Technology & AI',
    published: '7 Nov 2026',
    cover: 1,
    embeddable: true,
    chapters: [
      { at: '00:00', label: 'Why most prompts fail' },
      { at: '02:40', label: 'A structure that works' },
      { at: '07:15', label: 'Checking the output' },
    ],
    transcript: [
      'A prompt is a brief. If a colleague could not act on it, neither can the model.',
      'Say what you want, who it is for, what it must include, and what it must leave out. Then give one example of a good answer.',
      'Never publish a model answer you have not checked. Ask it for its sources, then open them.',
    ],
  },
  {
    slug: 'build-your-first-api',
    title: 'Build Your First API',
    description: 'From an empty folder to a working FastAPI endpoint with validation and tests.',
    provider: 'Uploaded',
    duration: '18:20',
    views: 3980,
    category: 'Tutorials & Guides',
    published: '4 Nov 2026',
    cover: 2,
    embeddable: true,
    chapters: [
      { at: '00:00', label: 'Set up the project' },
      { at: '05:30', label: 'Your first endpoint' },
      { at: '12:10', label: 'Validation and tests' },
    ],
    transcript: [
      'We start from an empty folder, create a virtual environment, and install FastAPI and Uvicorn.',
      'The first endpoint returns a list. The second accepts input, which is where validation starts to matter.',
      'Tests are not extra credit. They are how you find out that the endpoint still works after your next change.',
    ],
  },
  {
    slug: 'ai-tools-for-small-business',
    title: 'AI Tools for Small Business',
    description: 'Three workflows that save a small team real hours each week — and two that are not worth it yet.',
    provider: 'YouTube',
    duration: '9:47',
    views: 6240,
    category: 'Business & Finance',
    published: '2 Nov 2026',
    cover: 3,
    embeddable: true,
    chapters: [
      { at: '00:00', label: 'Three workflows worth automating' },
      { at: '03:20', label: 'Two that are not worth it yet' },
      { at: '06:40', label: 'What it actually costs' },
    ],
    transcript: [
      'The three workflows that pay off first are replies to common questions, first drafts of routine documents, and tidying messy spreadsheets.',
      'The two that are not ready are anything with money moving automatically, and anything where a wrong answer is expensive to correct.',
      'Price it per task, not per month. A tool that saves two hours a week is cheap; one that saves ten minutes is a subscription you forget.',
    ],
  },
  {
    slug: 'how-to-prepare-for-exams',
    title: 'How to Prepare for Exams',
    description: 'A repeatable revision plan, built around short sessions and active recall.',
    provider: 'Uploaded',
    duration: '12:11',
    views: 2870,
    category: 'Education & Opportunities',
    published: '30 Oct 2026',
    cover: 4,
    embeddable: true,
    chapters: [
      { at: '00:00', label: 'Building a revision plan' },
      { at: '04:05', label: 'Active recall over rereading' },
      { at: '08:30', label: 'The week of the exam' },
    ],
    transcript: [
      'Start from the syllabus, not from the textbook. The syllabus tells you what will be asked.',
      'Rereading feels productive and mostly is not. Close the book and write what you remember, then check.',
      'In the last week, sleep matters more than one more chapter. A rested recall beats a tired reread.',
    ],
  },
  {
    slug: 'afrobeats-production-breakdown',
    title: 'Afrobeats Production Breakdown',
    description: 'A producer walks through the drums, bass and vocal chain behind a modern Afrobeats record.',
    provider: 'Vimeo',
    duration: '16:05',
    views: 4490,
    category: 'Entertainment',
    published: '26 Oct 2026',
    cover: 5,
    embeddable: false,
    chapters: [
      { at: '00:00', label: 'The drum pattern' },
      { at: '05:00', label: 'Bass and space' },
      { at: '10:20', label: 'The vocal chain' },
    ],
    transcript: [
      'The groove is built on a shaker pattern that never changes, which is what lets everything else move around it.',
      'The bass sits behind the kick rather than on top of it. That small delay is most of the feel.',
      'The vocal chain is short: a little compression, a little saturation, and a reverb that is barely audible on its own.',
    ],
  },
]

export const adminArticles: AdminArticle[] = [
  {
    id: 1,
    title: 'Nigeria’s AI startups are quietly building the next wave of African infrastructure',
    category: 'Technology & AI',
    status: 'Published',
    author: 'Adaeze Okonkwo',
    aiDraft: true,
    views: 12480,
    updated: '11 Nov, 09:42',
  },
  {
    id: 2,
    title: 'AfCFTA enters a new phase as intra-African trade rules tighten',
    category: 'Africa News',
    status: 'Pending Review',
    author: 'Tunde Bakare',
    aiDraft: true,
    views: 0,
    updated: '11 Nov, 08:10',
  },
  {
    id: 3,
    title: '2027 scholarship round opens for Nigerian undergraduates',
    category: 'Education & Opportunities',
    status: 'Scheduled',
    author: 'Ngozi Eze',
    aiDraft: false,
    views: 0,
    updated: '10 Nov, 17:25',
  },
  {
    id: 4,
    title: 'Why Nigeria’s fintechs are looking beyond Lagos for growth',
    category: 'Business & Finance',
    status: 'Approved',
    author: 'Chiamaka Obi',
    aiDraft: true,
    views: 0,
    updated: '10 Nov, 16:02',
  },
  {
    id: 5,
    title: 'The Super Eagles rebuild starts with the midfield',
    category: 'Sports',
    status: 'Draft',
    author: 'Ibrahim Musa',
    aiDraft: true,
    views: 0,
    updated: '10 Nov, 15:03',
  },
  {
    id: 6,
    title: 'Lagos rail line sees record commuter numbers in first full quarter',
    category: 'Nigeria News',
    status: 'Published',
    author: 'Halima Bello',
    aiDraft: false,
    views: 6410,
    updated: '9 Nov, 12:40',
  },
  {
    id: 7,
    title: 'Climate finance is arriving in African cities — slowly',
    category: 'World News',
    status: 'Archived',
    author: 'Sarah Mensah',
    aiDraft: false,
    views: 4890,
    updated: '9 Nov, 10:12',
  },
]

export const adminStats = [
  { label: 'Total articles', value: '1,284', delta: '+18 this week' },
  { label: 'Published', value: '946', delta: '+12 this week' },
  { label: 'Drafts', value: '128', delta: '14 need attention' },
  { label: 'Pending review', value: '23', delta: '5 overdue' },
  { label: 'Registered users', value: '18,402', delta: '+642 this month' },
  { label: 'Subscribers', value: '6,915', delta: '+214 this month' },
]

export const trendingTopics = [
  { topic: 'Nigeria AI policy draft', region: 'Nigeria', category: 'Technology & AI', momentum: 92, urgency: 'High' },
  { topic: 'AfCFTA implementation rules', region: 'Africa', category: 'Africa News', momentum: 81, urgency: 'High' },
  { topic: '2027 scholarship deadlines', region: 'Nigeria', category: 'Education', momentum: 78, urgency: 'Medium' },
  { topic: 'Super Eagles squad list', region: 'Nigeria', category: 'Sports', momentum: 74, urgency: 'High' },
  { topic: 'Lagos transport fares', region: 'Lagos', category: 'Nigeria News', momentum: 63, urgency: 'Medium' },
  { topic: 'Afrobeats stadium tours', region: 'Africa', category: 'Entertainment', momentum: 58, urgency: 'Low' },
]

export const aiSources = [
  {
    domain: 'nitda.gov.ng',
    title: 'National AI strategy consultation paper',
    date: '4 Nov 2026',
    status: 'Confirmed' as const,
  },
  {
    domain: 'afcfta.org',
    title: 'Protocol on trade in services — implementation note',
    date: '2 Nov 2026',
    status: 'Confirmed' as const,
  },
  {
    domain: 'reuters.com',
    title: 'African startup funding round-up, Q3 2026',
    date: '28 Oct 2026',
    status: 'Confirmed' as const,
  },
  {
    domain: 'social-post.example',
    title: 'Unverified claim about a new startup fund',
    date: '9 Nov 2026',
    status: 'Alleged' as const,
  },
]

export const factChecks = [
  {
    claim: 'A new $500m fund will be launched for Nigerian AI startups before December.',
    severity: 'danger' as const,
    note: 'No primary source found. The only reference is a social post.',
  },
  {
    claim: 'AfCFTA rules on services take effect in January 2027.',
    severity: 'warning' as const,
    note: 'Two official documents give different commencement dates. Check with the secretariat.',
  },
  {
    claim: 'Nigeria has more than 200 active AI startups.',
    severity: 'info' as const,
    note: 'Figure appears in an industry report; methodology is not public.',
  },
]

export type ContentBundle = {
  categories: Category[]
  articles: Article[]
  documents: ResourceDoc[]
  videos: Video[]
}

/**
 * Replace the bundled demo content with live API data. The exported arrays are
 * intentionally mutated in place so every component that already imports them
 * keeps working. Call this before the React tree is mounted.
 */
export function setContent(next: Partial<ContentBundle>) {
  if (next.categories) {
    categories.splice(0, categories.length, ...next.categories)
  }
  if (next.articles) {
    articles.splice(0, articles.length, ...next.articles)
  }
  if (next.documents) {
    documents.splice(0, documents.length, ...next.documents)
  }
  if (next.videos) {
    videos.splice(0, videos.length, ...next.videos)
  }
}

export function getArticle(slug: string) {
  return articles.find((a) => a.slug === slug)
}

export function getDoc(slug: string) {
  return documents.find((d) => d.slug === slug)
}

export function getVideo(slug: string) {
  return videos.find((v) => v.slug === slug)
}
