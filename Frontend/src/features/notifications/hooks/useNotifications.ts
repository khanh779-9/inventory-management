import { useCallback, useEffect, useState } from 'react'
import type { NotificationItem, NotificationSummary } from '../../../types'
import {
  getNotificationSummary, getNotifications, setNotificationArchived, setNotificationRead,
  type NotificationQuery,
} from '../api/notificationsApi'

/**
 * Danh sách thông báo + tóm tắt (tổng/chưa đọc).
 * Dùng cho: bell ở topbar (preview 5 thông báo gần nhất) và trang Thông báo (full-list + filter).
 */
export function useNotifications(query: NotificationQuery = {}) {
  const [items, setItems] = useState<NotificationItem[]>([])
  const [summary, setSummary] = useState<NotificationSummary>({ total: 0, unread: 0 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [rows, count] = await Promise.all([getNotifications(query), getNotificationSummary()])
      setItems(rows); setSummary(count); setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải thông báo.')
    } finally { setLoading(false) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.category, query.archived, query.unreadOnly, query.limit])

  useEffect(() => { void load() }, [load])

  const markRead = useCallback(async (id: string, value: boolean) => {
    await setNotificationRead(id, value)
    setItems((rows) => rows.map((row) => (row.id === id ? { ...row, isRead: value } : row)))
    setSummary((prev) => ({ ...prev, unread: Math.max(0, prev.unread + (value ? -1 : 1)) }))
  }, [])

  const setArchived = useCallback(async (id: string, value: boolean) => {
    await setNotificationArchived(id, value)
    if (value) setItems((rows) => rows.filter((row) => row.id !== id))
    else setItems((rows) => rows.map((row) => (row.id === id ? { ...row, isArchived: false } : row)))
    setSummary({ total: 0, unread: 0 }); void load()
  }, [load])

  return { items, summary, loading, error, reload: () => void load(), markRead, setArchived }
}
