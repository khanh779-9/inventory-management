import type { NotificationCreateInput, NotificationItem, NotificationSummary } from '../../../types'
import { request } from '../../../lib/request'

export interface NotificationQuery {
  category?: string
  archived?: boolean
  unreadOnly?: boolean
  limit?: number
}

export async function getNotifications(query: NotificationQuery = {}): Promise<NotificationItem[]> {
  const params = new URLSearchParams()
  if (query.category) params.set('category', query.category)
  if (query.archived) params.set('archived', 'true')
  if (query.unreadOnly) params.set('unreadOnly', 'true')
  if (query.limit) params.set('limit', String(query.limit))
  const qs = params.toString()
  return request<NotificationItem[]>(`/notifications${qs ? `?${qs}` : ''}`)
}

export async function getNotificationSummary(): Promise<NotificationSummary> {
  return request<NotificationSummary>('/notifications/summary')
}

export async function createNotification(input: NotificationCreateInput): Promise<void> {
  await request<void>('/notifications', { method: 'POST', body: JSON.stringify(input) })
}

export async function setNotificationRead(id: string, value: boolean): Promise<void> {
  await request<void>(`/notifications/${id}/read`, { method: 'PATCH', body: JSON.stringify({ value }) })
}

export async function setNotificationArchived(id: string, value: boolean): Promise<void> {
  await request<void>(`/notifications/${id}/archive`, { method: 'PATCH', body: JSON.stringify({ value }) })
}
