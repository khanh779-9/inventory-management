import { ChevronDown, LogOut, UserRound, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { useClickOutside } from '../app/useClickOutside'
import { setCurrentPage, showToast } from '../app/store'
import { clearSession } from '../features/auth'
import { clearSession as clearStoredSession } from '../lib/authStorage'
import { navGroups } from '../constants/nav'

export default function Sidebar({ mobileOpen, onClose }: { mobileOpen: boolean; onClose: () => void }) {
  const dispatch = useAppDispatch()
  const page = useAppSelector((state) => state.ui.currentPage)
  const user = useAppSelector((state) => state.auth.user)
  const [profileOpen, setProfileOpen] = useState(false)
  const profileWrapRef = useRef<HTMLDivElement | null>(null)
  useClickOutside(profileWrapRef, () => setProfileOpen(false), profileOpen)
  const displayName = user?.fullName ?? ''
  const initials = displayName.trim().split(/\s+/).filter(Boolean).slice(-2).map((part) => part[0] ?? '').join('').toUpperCase()

  function navigate(id: string) {
    dispatch(setCurrentPage(id))
    onClose()
  }

  function logout() {
    clearStoredSession()
    dispatch(clearSession())
    dispatch(showToast({ kind: 'info', message: 'Đã đăng xuất.' }))
  }

  return (
    <>
      {mobileOpen && <button className="sidebar-scrim" aria-label="Đóng menu" onClick={onClose} />}
      <aside className={`sidebar ${mobileOpen ? 'sidebar--open' : ''}`}>
        <div className="brand-row">
          <div className="brand-mark" aria-hidden="true"><span /><span /><span /></div>
          <span className="brand-name">Invento</span>
          <button className="icon-button sidebar-close" onClick={onClose} aria-label="Đóng menu"><X size={18} /></button>
        </div>
        <nav className="sidebar-nav" aria-label="Điều hướng chính">
          {navGroups.map((group) => (
            <div className="nav-group" key={group.label}>
              <p className="nav-group-label">{group.label}</p>
              {group.items.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  className={`nav-item ${page === id ? 'nav-item--active' : ''}`}
                  onClick={() => navigate(id)}
                  aria-current={page === id ? 'page' : undefined}
                >
                  <Icon size={18} strokeWidth={1.8} />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          ))}
        </nav>
        <div className="profile-wrap" ref={profileWrapRef}>
          {profileOpen && (
            <div className="profile-menu">
              <div className="profile-menu-intro"><strong>{user?.fullName}</strong><span>{user?.email}</span><small>{user?.role === 'Admin' ? 'Quản trị viên' : 'Nhân viên'}</small></div>
              <button onClick={() => { dispatch(setCurrentPage('settings')); setProfileOpen(false); onClose() }}><UserRound size={16} /> Tài khoản</button>
              <button onClick={logout}><LogOut size={16} /> Đăng xuất</button>
            </div>
          )}
          <button className="profile-button" onClick={() => setProfileOpen((open) => !open)} aria-expanded={profileOpen}>
            <div className="avatar avatar--profile">{initials}</div>
            <div className="profile-info"><strong>{user?.fullName}</strong><span>{user?.role === 'Admin' ? 'Quản trị viên' : 'Nhân viên'}</span></div>
            <ChevronDown size={16} className={`profile-chevron ${profileOpen ? 'rotate' : ''}`} />
          </button>
        </div>
      </aside>
    </>
  )
}
