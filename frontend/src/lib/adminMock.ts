import { adminArticles } from '../data/content'
import type { AdminArticleRecord } from './adminApi'

/** Shape the bundled demo list like an API record so both modes share one UI. */
export function adminArticleFromMock(
  article: (typeof adminArticles)[number],
): AdminArticleRecord {
  return {
    id: article.id,
    slug: String(article.id),
    title: article.title,
    standfirst: '',
    body: [],
    categoryId: 0,
    category: article.category,
    tags: [],
    status: article.status,
    author: article.author,
    authorId: 0,
    reviewedBy: null,
    aiDraft: article.aiDraft,
    views: article.views,
    featured: false,
    trending: false,
    cover: 0,
    readingTime: 4,
    updated: article.updated,
    updatedAt: null,
    publishedAt: null,
    scheduledFor: null,
    seoTitle: null,
    seoDescription: null,
    primaryKeyword: null,
  }
}

export const demoAdminArticles: AdminArticleRecord[] = adminArticles.map(adminArticleFromMock)
