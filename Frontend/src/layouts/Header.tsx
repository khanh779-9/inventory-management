import { Bell, Search, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { useClickOutside } from '../app/useClickOutside'
import { setCurrentPage, setSearch } from '../app/store'
import { useNotifications } from '../features/notifications'
import type { NotificationItem } from '../types'

interface HeaderProps { onMenuClick: () => void }

/** Nhãn + màu badge theo loại thông báo */
const CATEGORY_LABEL: Record<string, string> = { System: 'Hệ thống', Admin: 'Quản trị', Order: 'Đơn hàng' }
const CATEGORY_CLASS: Record<string, string> = { System: 'notif-badge--system', Admin: 'notif-badge--admin', Order: 'notif-badge--order' }
/** Điều hướng khi bấm vào thông báo theo phân loại */
const CATEGORY_PAGE: Record<string, string> = { Order: 'purchase-orders', System: 'inventory', Admin: 'inventory' }

function timeAgo(iso: string): string {
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (minutes < 1) return 'Vừa xong'
  if (minutes < 60) return `${minutes} phút trước`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} giờ trước`
  const days = Math.floor(hours / 24)
  return days < 30 ? `${days} ngày trước` : new Date(iso).toLocaleDateString('vi-VN')
}

export default function Header({ onMenuClick }: HeaderProps) {
  const dispatch = useAppDispatch()
  const search = useAppSelector((state) => state.ui.search)
  const user = useAppSelector((state) => state.auth.user)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const notificationWrapRef = useRef<HTMLDivElement | null>(null)
  const { items, summary, markRead } = useNotifications({ limit: 5 })
  useClickOutside(notificationWrapRef, () => setNotificationsOpen(false), notificationsOpen)
  useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        searchInputRef.current?.focus()
      }
      if (event.key === 'Escape') setNotificationsOpen(false)
    }
    window.addEventListener('keydown', handleShortcut)
    return () => window.removeEventListener('keydown', handleShortcut)
  }, [])
  const now = new Date()
  const greeting = now.getHours() < 11 ? 'Chào buổi sáng' : now.getHours() < 18 ? 'Chào buổi chiều' : 'Chào buổi tối'
  const dateLabel = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: '2-digit', year: 'numeric' }).format(now).toUpperCase()
  const displayName = user?.fullName ?? ''
  const initials = displayName.trim().split(/\s+/).filter(Boolean).slice(-2).map((part) => part[0] ?? '').join('').toUpperCase()
  const unread = summary.unread

  function handleSearch(value: string) {
    dispatch(setSearch(value))
    if (value.trim()) dispatch(setCurrentPage('inventory'))
  }

  async function openNotification(item: NotificationItem) {
    setNotificationsOpen(false)
    if (!item.isRead) { try { await markRead(item.id, true) } catch { /* lỗi nhẹ: vẫn điều hướng */ } }
    dispatch(setCurrentPage(CATEGORY_PAGE[item.category] ?? 'inventory'))
  }

  function openAllNotifications() {
    setNotificationsOpen(false)
    dispatch(setCurrentPage('notifications'))
  }

  return (
    <header className="topbar">
      <div className="topbar-leading">
        <button className="icon-button mobile-menu-button" onClick={onMenuClick} aria-label="Mở menu"><span className="menu-lines" /></button>
        <div>
          <div className="eyebrow">{dateLabel}</div>
          <h1 className="welcome-title">{greeting}, {displayName.split(' ')[0]}.</h1>
          <p className="welcome-subtitle">Đây là tình hình kho hàng của bạn hôm nay.</p>
        </div>
      </div>
      <div className="topbar-actions">
        <label className={`global-search ${searchFocused ? 'global-search--focused' : ''}`}>
          <Search size={17} />
          <input
            ref={searchInputRef}
            value={search}
            onChange={(event) => handleSearch(event.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder="Tìm sản phẩm, SKU..."
            aria-label="Tìm sản phẩm hoặc SKU"
          />
          {search && <button type="button" className="clear-search" aria-label="Xóa tìm kiếm" onClick={() => handleSearch('')}><X size={14} /></button>}
          <kbd>Ctrl K</kbd>
        </label>
        <div className="notification-wrap" ref={notificationWrapRef}>
          <button className={`icon-button notification-button ${notificationsOpen ? 'is-active' : ''}`} onClick={() => setNotificationsOpen((open) => !open)} aria-label="Thông báo" aria-expanded={notificationsOpen}>
            <Bell size={19} />{unread > 0 && <span className="notification-dot" />}
          </button>
          {notificationsOpen && (
            <div className="notification-popover">
              <div className="popover-heading"><strong>Thông báo</strong><span>{unread > 0 ? `${unread} mới` : 'Không có mới'}</span></div>
              {items.length === 0
                ? <div className="notification-empty">Chưa có thông báo nào.</div>
                : items.map((item) => (
                  <button key={item.id} className="notification-item" onClick={() => void openNotification(item)}>
                    <span className={`notification-icon notif-badge ${CATEGORY_CLASS[item.category] ?? ''}`}>{item.category[0]}</span>
                    <span>
                      <strong className={item.isRead ? '' : 'notif-item--unread'}>{item.title}</strong>
                      <small>{item.message}</small>
                      <small className="notification-meta">{CATEGORY_LABEL[item.category] ?? item.category} · {timeAgo(item.createdAt)}{item.senderName ? ` · ${item.senderName}` : ''}</small>
                    </span>
                  </button>
                ))}
              <button type="button" className="notification-view-all" onClick={openAllNotifications}>Xem tất cả thông báo</button>
            </div>
          )}
        </div>
        <button className="avatar avatar--top" aria-label="Tài khoản" onClick={() => dispatch(setCurrentPage('settings'))} title={user?.email ?? ''}>{initials}</button>
      </div>
    </header>
  )
}
