import { apiRequest } from './api'
import type { ArticleBlock, ArticleStatus } from '../data/content'

export type AdminArticleRecord = {
  id: number
  slug: string
  title: string
  standfirst: string
  body: ArticleBlock[]
  categoryId: number
  category: string
  tags: string[]
  status: ArticleStatus
  author: string
  authorId: number
  reviewedBy: string | null
  aiDraft: boolean
  views: number
  featured: boolean
  trending: boolean
  cover: number
  readingTime: number
  updated: string
  updatedAt: string | null
  publishedAt: string | null
  scheduledFor: string | null
  seoTitle: string | null
  seoDescription: string | null
  primaryKeyword: string | null
}

export type Page<T> = {
  items: T[]
  total: number
  page: number
  pageSize: number
  pages: number
}

export type TransitionResult = {
  id: number
  status: ArticleStatus
  publishedAt: string | null
  scheduledFor: string | null
}

export type ArticleWritePayload = {
  title?: string
  standfirst?: string
  body?: ArticleBlock[]
  category?: string
  categoryId?: number
  tags?: string[]
  cover?: number
  readingTime?: number
  featured?: boolean
  trending?: boolean
  aiDraft?: boolean
  seoTitle?: string | null
  seoDescription?: string | null
  primaryKeyword?: string | null
}

export type ArticleAction =
  | 'submit-review'
  | 'approve'
  | 'reject'
  | 'publish'
  | 'unschedule'
  | 'archive'

export async function listAdminArticles(params: {
  status?: ArticleStatus
  q?: string
  page?: number
  pageSize?: number
} = {}): Promise<Page<AdminArticleRecord>> {
  const search = new URLSearchParams()
  if (params.status) search.set('status', params.status)
  if (params.q) search.set('q', params.q)
  if (params.page) search.set('page', String(params.page))
  search.set('pageSize', String(params.pageSize ?? 50))

  const suffix = search.toString() ? `?${search}` : ''
  return apiRequest<Page<AdminArticleRecord>>(`/admin/articles${suffix}`, { auth: true })
}

export async function getAdminArticle(id: number): Promise<AdminArticleRecord> {
  return apiRequest<AdminArticleRecord>(`/admin/articles/${id}`, { auth: true })
}

export async function createArticle(
  payload: ArticleWritePayload,
): Promise<AdminArticleRecord> {
  return apiRequest<AdminArticleRecord>('/admin/articles', {
    method: 'POST',
    body: payload,
    auth: true,
  })
}

export async function updateArticle(
  id: number,
  payload: ArticleWritePayload,
): Promise<AdminArticleRecord> {
  return apiRequest<AdminArticleRecord>(`/admin/articles/${id}`, {
    method: 'PATCH',
    body: payload,
    auth: true,
  })
}

export async function transitionArticle(
  id: number,
  action: ArticleAction,
): Promise<TransitionResult> {
  return apiRequest<TransitionResult>(`/admin/articles/${id}/${action}`, {
    method: 'POST',
    auth: true,
  })
}

export async function scheduleArticle(id: number, scheduledFor: string): Promise<TransitionResult> {
  return apiRequest<TransitionResult>(`/admin/articles/${id}/schedule`, {
    method: 'POST',
    body: { scheduledFor },
    auth: true,
  })
}

export async function deleteArticle(id: number): Promise<void> {
  await apiRequest<void>(`/admin/articles/${id}`, { method: 'DELETE', auth: true })
}

export type NewsletterResult = { email: string; status: string }

export async function subscribeNewsletter(email: string): Promise<NewsletterResult> {
  return apiRequest<NewsletterResult>('/newsletter', {
    method: 'POST',
    body: { email },
  })
}

export type ContactPayload = {
  name: string
  email: string
  subject: string
  message: string
  company?: string
}

export type ContactResult = { received: boolean; reference: string }

export async function sendContactMessage(payload: ContactPayload): Promise<ContactResult> {
  return apiRequest<ContactResult>('/contact', { method: 'POST', body: payload })
}
