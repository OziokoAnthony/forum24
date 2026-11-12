import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AdminLayout } from './components/layout/AdminLayout'
import { PublicLayout } from './components/layout/PublicLayout'
import { RouteTitle } from './components/layout/RouteTitle'
import { HomePage } from './pages/public/HomePage'
import { ArticlePage } from './pages/public/ArticlePage'
import { CategoryPage } from './pages/public/CategoryPage'
import { SearchPage } from './pages/public/SearchPage'
import { ResourcesPage } from './pages/public/ResourcesPage'
import { DocumentPage } from './pages/public/DocumentPage'
import { VideoPage } from './pages/public/VideoPage'
import { AuthorPage } from './pages/public/AuthorPage'
import { StaticPage, type StaticSection } from './pages/public/StaticPage'
import { ContactPage } from './pages/public/ContactPage'
import { LoginPage } from './pages/public/LoginPage'
import { NotFoundPage } from './pages/public/NotFoundPage'
import { AdminOverview } from './pages/admin/AdminOverview'
import { AdminArticles } from './pages/admin/AdminArticles'
import { AdminArticleEditor } from './pages/admin/AdminArticleEditor'
import { AdminResources } from './pages/admin/AdminResources'
import { AdminAiDesk } from './pages/admin/AdminAiDesk'
import { AdminAds } from './pages/admin/AdminAds'
import { AdminAnalytics } from './pages/admin/AdminAnalytics'
import { AdminSettings } from './pages/admin/AdminSettings'

type StaticDoc = {
  title: string
  intro: string
  updated: string
  sections: StaticSection[]
}

const about: StaticDoc = {
  title: 'About FORUM24',
  intro:
    'FORUM24 is an independent Nigerian digital publication covering news, business, technology, education and culture across Africa and the diaspora.',
  updated: '1 November 2026',
  sections: [
    {
      heading: 'What we do',
      paragraphs: [
        'We publish original reporting, practical guides and video lessons. The Learning Centre lets readers preview a document in the browser, download it, or watch a lesson without leaving the site.',
        'Our editorial desk uses AI for research and drafting, but every published story is reviewed and approved by a human editor.',
      ],
    },
    {
      heading: 'What we publish',
      paragraphs: [
        'Nigeria News, Africa News, Business & Finance, Technology & AI, Education & Opportunities, Sports, Entertainment, Lifestyle & Culture, World News, and Tutorials & Guides.',
      ],
    },
    {
      heading: 'How we work',
      paragraphs: [
        'We verify claims against primary sources where possible, label allegations clearly, and correct errors openly. Sponsored content is disclosed at the top of the page.',
      ],
    },
    {
      heading: 'Ownership and funding',
      paragraphs: [
        'FORUM24 is funded by advertising, sponsored content and affiliate partnerships. Advertising is labelled and never influences editorial decisions.',
        'Publisher identity and contact details are available on the Contact page.',
      ],
    },
  ],
}

const privacy: StaticDoc = {
  title: 'Privacy policy',
  intro:
    'This policy explains what FORUM24 collects, why we collect it, and the choices available to you.',
  updated: '1 November 2026',
  sections: [
    {
      heading: 'Information we collect',
      paragraphs: [
        'If you subscribe to the newsletter we store your email address and subscription status. If you contact us we keep the message so we can reply.',
        'We collect basic, aggregated usage data to understand which stories are read. We do not sell personal data.',
      ],
    },
    {
      heading: 'How we use information',
      paragraphs: [
        'To send the newsletter you asked for, respond to enquiries, keep the site secure, and improve the reading experience.',
      ],
    },
    {
      heading: 'Cookies',
      paragraphs: [
        'Essential cookies keep the site working. Non-essential cookies are used only after you consent. You can change your choice at any time from the cookie settings link in the footer.',
        'Rejecting non-essential cookies does not block any article, document or video.',
      ],
    },
    {
      heading: 'Advertising and Google AdSense',
      paragraphs: [
        'We may use Google AdSense and other advertising partners. Ads are labelled and kept separate from content and controls.',
        'We never require an ad click to download a document or play a video, and we never encourage invalid clicks or artificial traffic.',
      ],
    },
    {
      heading: 'Your choices',
      paragraphs: [
        'You can unsubscribe from the newsletter in one click, request a copy of your data, or ask us to delete it by contacting hello@forum24.example.',
      ],
    },
    {
      heading: 'Data retention',
      paragraphs: [
        'Newsletter records are kept until you unsubscribe. Contact messages are kept for as long as needed to resolve the enquiry, then deleted on a schedule.',
      ],
    },
  ],
}

const terms: StaticDoc = {
  title: 'Terms and conditions',
  intro: 'These terms govern your use of FORUM24 and its Learning Centre.',
  updated: '1 November 2026',
  sections: [
    {
      heading: 'Using FORUM24',
      paragraphs: [
        'You may read, watch and download content for personal, non-commercial use. Do not attempt to disrupt the site, scrape it at scale, or misuse the download links.',
      ],
    },
    {
      heading: 'Content and intellectual property',
      paragraphs: [
        'Articles, video lessons and documents are owned by FORUM24 or the publisher named on the document. You may share links freely. Republishing full content requires written permission.',
      ],
    },
    {
      heading: 'Advertising',
      paragraphs: [
        'Advertising is clearly labelled. We do not guarantee the accuracy of third-party advertisements, and an ad click is never required to access content.',
      ],
    },
    {
      heading: 'Limitation of liability',
      paragraphs: [
        'Content is provided for information and education. It is not legal, financial or medical advice. Use your own judgement and consult a qualified professional where needed.',
      ],
    },
    {
      heading: 'Changes',
      paragraphs: [
        'We may update these terms. The date at the top of this page shows when they last changed.',
      ],
    },
  ],
}

const editorialPolicy: StaticDoc = {
  title: 'Editorial policy',
  intro:
    'How FORUM24 reports, verifies, uses AI, handles corrections and keeps advertising separate from journalism.',
  updated: '1 November 2026',
  sections: [
    {
      heading: 'Accuracy and sourcing',
      paragraphs: [
        'We prefer primary sources: official documents, court records, data releases and direct interviews. Claims we cannot verify are labelled as allegations or left out.',
        'Headlines must be supported by the article. We do not use misleading framing to earn clicks.',
      ],
    },
    {
      heading: 'Use of AI',
      paragraphs: [
        'AI helps with trend discovery, research and drafting. It does not publish. Every AI-assisted article is reviewed by an editor, and sources are checked before publication.',
        'AI output is never presented as guaranteed truth. Editors remain responsible for every published claim.',
      ],
    },
    {
      heading: 'Corrections',
      paragraphs: [
        'When we get something wrong we correct it promptly and note the change. Significant corrections are explained at the foot of the article.',
        'Send corrections to corrections@forum24.example.',
      ],
    },
    {
      heading: 'Independence and advertising',
      paragraphs: [
        'Advertisers have no influence over editorial coverage. Sponsored content is clearly disclosed and visually distinct from news.',
        'Ads are labelled, separated from controls, and never block a download or a video.',
      ],
    },
    {
      heading: 'Comments',
      paragraphs: [
        'Comments are moderated. We remove spam, abuse, personal data and misinformation. Commenting may be disabled on sensitive stories.',
      ],
    },
  ],
}

export default function App() {
  return (
    <BrowserRouter>
      <RouteTitle />
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route path="news/:slug" element={<ArticlePage />} />
          <Route path="category/:slug" element={<CategoryPage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="resources" element={<ResourcesPage />} />
          <Route path="resources/documents/:slug" element={<DocumentPage />} />
          <Route path="resources/videos/:slug" element={<VideoPage />} />
          <Route path="author/:slug" element={<AuthorPage />} />
          <Route path="about" element={<StaticPage {...about} />} />
          <Route path="privacy" element={<StaticPage {...privacy} />} />
          <Route path="terms" element={<StaticPage {...terms} />} />
          <Route path="editorial-policy" element={<StaticPage {...editorialPolicy} />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        <Route path="admin" element={<AdminLayout />}>
          <Route index element={<AdminOverview />} />
          <Route path="articles" element={<AdminArticles />} />
          <Route path="articles/new" element={<AdminArticleEditor />} />
          <Route path="articles/:id" element={<AdminArticleEditor />} />
          <Route path="resources" element={<AdminResources />} />
          <Route path="ai" element={<AdminAiDesk />} />
          <Route path="ads" element={<AdminAds />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
