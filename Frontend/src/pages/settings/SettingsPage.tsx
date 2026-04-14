import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { showToast } from '../../app/store'
import { clearSession } from '../../features/auth'
import { clearSession as clearStoredSession } from '../../lib/authStorage'

export default function SettingsPage() {
  const dispatch = useAppDispatch()
  const user = useAppSelector((state) => state.auth.user)
  if (!user) return null

  function logout() {
    clearStoredSession()
    dispatch(clearSession())
    dispatch(showToast({ kind: 'info', message: 'Đã đăng xuất.' }))
  }

  return <div className="feature-page">
    <div className="page-title-row"><div><h1>Cài đặt tài khoản</h1><p>Thông tin tài khoản đang đăng nhập.</p></div></div>
    <section className="panel settings-panel">
      <div className="settings-avatar">{user.fullName.trim().split(/\s+/).slice(-2).map((part) => part[0] ?? '').join('').toUpperCase()}</div>
      <div><h2>{user.fullName}</h2><p>{user.email}</p><span className="status-badge status-badge--in-stock"><i />{user.role === 'Admin' ? 'Quản trị viên' : 'Nhân viên'}</span></div>
      <div className="settings-actions"><button className="button button-secondary" onClick={logout}>Đăng xuất</button></div>
    </section>
  </div>
}
